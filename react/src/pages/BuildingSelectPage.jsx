// 건물 선택 페이지
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import {
    getParkingSummary,
    getAnalysis,
    enterParking,
    previewParkingFee,
    settleParkingFee,
} from '../api/parking'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { loadFavs } from '../utils/favStorage'
import { getSlotStatus } from '../utils/slotStatusStorage'

import paldalImg from '../assets/buildings/paldal.svg'
import libraryImg from '../assets/buildings/library.svg'
import yulgokImg from '../assets/buildings/yulgok.svg'
import yeonamImg from '../assets/buildings/yeonam.svg'

const BUILDINGS = [
    { id: 'paldal', name: '팔달관', image: paldalImg },
    { id: 'library', name: '도서관', image: libraryImg },
    { id: 'yulgok', name: '율곡관', image: yulgokImg },
    { id: 'yeonam', name: '연암관', image: yeonamImg },
]

export default function BuildingSelectPage() {
    const [summary, setSummary] = useState({})
    const [summaryError, setSummaryError] = useState('')

    const [analysisBuilding, setAnalysisBuilding] = useState('paldal')
    const [analysisData, setAnalysisData] = useState([])
    const [analysisError, setAnalysisError] = useState('')

    const [favorites, setFavorites] = useState(() => loadFavs())

    // 내 주차 현황 패널 상태
    const [parkingInfo, setParkingInfo] = useState(null) // preview / settle 응답 raw 저장
    const [parkingStatusText, setParkingStatusText] = useState('주차 정보 없음')
    const [parkingLoading, setParkingLoading] = useState(false)
    const [parkingError, setParkingError] = useState('')
    const [lastUpdated, setLastUpdated] = useState(null)
    const [parkingStage, setParkingStage] = useState('idle') //주차 화면 렌더링 처리용
    const navigate = useNavigate()

    const [profile, setProfile] = useState(() => {
        try {
            const raw = localStorage.getItem('profile')
            if (raw) return JSON.parse(raw)
        } catch {
        }
        return {
            name: '홍길동',
            studentId: '202012345',
            favoriteBuilding: 'paldal',
            carNumber: '12가3456',
            profileImage: null,
        }
    })
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [editProfile, setEditProfile] = useState(profile)
    const [analysisRangeText, setAnalysisRangeText] = useState('')
    const formatDuration = (minutes) => {
        if (minutes == null) return '-'
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        if (h > 0 && m > 0) return `${h}시간 ${m}분`
        if (h > 0) return `${h}시간`
        return `${m}분`
    }
    //처음 로그인 후 이 페이지에 처음 들어올 때, 한 번 강제 출차/정산 시도
    useEffect(() => {
        const alreadySettled = sessionStorage.getItem('parkingSettledOnLogin')
        if (alreadySettled) return

        const forceSettleOnFirstVisit = async () => {
            try {
                await settleParkingFee()
            } catch (error) {
                const status = error?.response?.status
                const msg = error?.response?.data?.message

                if (!(status === 400 && msg && msg.includes('활성'))) {
                    console.warn('초기 자동 정산 시도 실패', status, msg || error)
                }
            } finally {
                sessionStorage.setItem('parkingSettledOnLogin', '1')
            }
        }

        forceSettleOnFirstVisit()
    }, [])
    // 프로필 편집
    const handleStartEditProfile = () => {
        setEditProfile(profile)
        setIsEditingProfile(true)
    }

    const handleChangeProfileField = (field, value) => {
        setEditProfile((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSaveProfile = () => {
        setProfile(editProfile)
        setIsEditingProfile(false)
        try {
            localStorage.setItem('profile', JSON.stringify(editProfile))
        } catch {
        }
    }

    const handleCancelProfile = () => {
        setIsEditingProfile(false)
        setEditProfile(profile)
    }

    const handleChangeProfileImage = (file) => {
        if (!file) return
        const reader = new FileReader()
        reader.onloadend = () => {
            setEditProfile((prev) => ({
                ...prev,
                profileImage: reader.result,
            }))
        }
        reader.readAsDataURL(file)
    }

    const handleClearProfileImage = () => {
        setEditProfile((prev) => ({
            ...prev,
            profileImage: null,
        }))
    }

    // 요약 정보 갱신
    useEffect(() => {
        let timerId

        const fetchSummary = async () => {
            try {
                const data = await getParkingSummary()
                const map = {}
                data.forEach((item) => {
                    map[item.buildingId] = item
                })
                setSummary(map)
                setSummaryError('')
            } catch {
                setSummaryError('주차장 요약 정보를 불러올 수 없음')
            }
        }

        fetchSummary()
        timerId = setInterval(fetchSummary, 10000)

        return () => clearInterval(timerId)
    }, [])

    // 혼잡도 그래프 : 최근 24시간, 2시간 간격 표시
    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const res = await getAnalysis(analysisBuilding)
                const raw = res.status ?? []

                const last24 = raw.slice(-24)
                const now = new Date()

                const chartData =
                    last24.map((item, idx) => {
                        const hoursAgo = last24.length - 1 - idx
                        const ts = new Date(
                            now.getTime() - hoursAgo * 60 * 60 * 1000,
                        )
                        const hour = ts.getHours()
                        const year = ts.getFullYear()
                        const month = ts.getMonth() + 1
                        const day = ts.getDate()

                        return {
                            index: idx,
                            hour,
                            dateLabel: `${year}년 ${month}월 ${day}일`,
                            timeLabel: `${String(hour).padStart(2, '0')}:00`,
                            percent: Math.round(item.avg_congestion_rate * 100),
                        }
                    }) ?? []

                setAnalysisData(chartData)
                if (last24.length > 0) {
                    const startTs = new Date(
                        now.getTime() - (last24.length - 1) * 60 * 60 * 1000,
                    )
                    const endTs = now

                    const fmt = (d) => {
                        const y = d.getFullYear()
                        const m = d.getMonth() + 1
                        const day = d.getDate()
                        const h = String(d.getHours()).padStart(2, '0')
                        return `${m}월 ${String(day).padStart(2, '0')}일 ${h}시`
                    }

                    setAnalysisRangeText(
                        `${fmt(startTs)} ~ ${fmt(endTs)} 기준`,
                    )
                } else {
                    setAnalysisRangeText('')
                }

                setAnalysisError('')
            } catch {
                setAnalysisError('혼잡도 데이터를 불러올 수 없음')
                setAnalysisRangeText('')
            }
        }

        fetchAnalysis()
    }, [analysisBuilding])

    const handleSelectBuilding = (buildingId) => {
        navigate(`/parking/${buildingId}`)
    }

    // 즐겨찾기
    const favoriteItems = favorites.map((favId) => {
        const [bId, slotStr] = favId.split(':')
        const slot = Number(slotStr)
        const building = BUILDINGS.find((b) => b.id === bId)
        const rawStatus = getSlotStatus(bId, slot) // true / false / null / undefined

        let label = '상태 알 수 없음'
        let badgeClass = 'bg-[#f3f4f6] text-slate-500'

        if (rawStatus === true) {
            label = '사용 중'
            badgeClass = 'bg-[#fce8e6] text-[#c5221f]'
        } else if (rawStatus === false) {
            label = '비어있음'
            badgeClass = 'bg-[#e6f4ea] text-[#137333]'
        }

        return {
            id: favId,
            buildingId: bId,
            buildingName: building?.name || bId,
            slot,
            label,
            badgeClass,
            status: rawStatus ?? null,
        }
    })

    // 주차 요금 로직
    //0)초기화
    useEffect(() => {
        const initParkingState = async () => {
            setParkingLoading(true)
            setParkingError('')

            try {
                const data = await previewParkingFee()
                // 현재 입차중
                setParkingInfo(data)
                setParkingStage('entered')
                setLastUpdated(new Date())

                const minutes = data.duration_minutes ?? 0
                const h = Math.floor(minutes / 60)
                const m = minutes % 60

                setParkingStatusText(
                    `현재 입차 중입니다.\n` +
                    `현재까지 예상 요금은 ${data.expect_fee.toLocaleString()}원 입니다.\n` +
                    `이용 시간 : ${h}시간 ${m}분`
                )
            } catch (error) {
                const status = error?.response?.status
                const msg = error?.response?.data?.message

                //  에러면 그냥 입차 전 상태로 간주
                if (status === 400 && msg && msg.includes('활성')) {
                    setParkingStage('idle')
                    setParkingInfo(null)
                    setParkingStatusText(
                        '현재 진행 중인 주차가 없습니다.\n' +
                        '"입차하기" 버튼을 눌러 주차를 시작해 주세요.'
                    )
                } else {
                    console.error('초기 주차 상태 조회 실패:', status, msg || error)
                    setParkingError('현재 주차 정보를 불러오는 중 오류가 발생했습니다.')
                }
            } finally {
                setParkingLoading(false)
            }
        }

        initParkingState()
    }, [])

    // 1) 입차하기
    const handleEnterParking = async () => {
        setParkingLoading(true)
        setParkingError('')

        try {
            await enterParking()

            setParkingStage('entered')
            setParkingInfo(null)
            setLastUpdated(new Date())

            setParkingStatusText(
                `차량 번호: ${profile.carNumber}\n입차 완료!\n"예상 요금 확인" 버튼으로 현재까지의 요금을 확인할 수 있습니다.`,
            )
        } catch (error) {
            console.error(
                'enterParking 오류',
                error.response?.status,
                error.response?.data || error,
            )
            const msg =
                error.response?.data?.message ||
                '입차 처리 중 오류가 발생했습니다.'
            setParkingError(msg)
            setParkingStatusText('입차 처리에 실패했습니다.')
            setParkingStage('idle')
        } finally {
            setParkingLoading(false)
        }
    }

    // 2) 예상 요금 확인
    const handlePreviewFee = async () => {
        setParkingLoading(true)
        setParkingError('')

        try {
            const data = await previewParkingFee()
            setParkingInfo(data)
            setLastUpdated(new Date())

            const minutes = data.duration_minutes ?? 0
            const h = Math.floor(minutes / 60)
            const m = minutes % 60

            setParkingStatusText(
                `현재까지 예상 요금은 ${data.expect_fee.toLocaleString()}원 입니다.\n이용 시간 : ${h}시간 ${m}분`,
            )
        } catch (error) {
            console.error(
                'previewParkingFee 오류',
                error.response?.status,
                error.response?.data || error,
            )
            const msg =
                error.response?.data?.message ||
                '예상 요금 조회 중 오류가 발생했습니다.'
            setParkingError(msg)
        } finally {
            setParkingLoading(false)
        }
    }

    // 3) 출차하기 (백엔드 호출 X, 상태 안내만)
    const handleExitClick = () => {
        if (parkingStage !== 'entered' && parkingStage !== 'readyToPay') {
            setParkingStatusText('아직 입차가 되지 않았습니다!')
            return
        }

        setParkingStage('readyToPay')
        setLastUpdated(new Date())
        setParkingStatusText(
            '출차 처리 완료!\n"결제하기" 버튼을 눌러 최종 정산을 진행해 주세요.',
        )
    }

    // 4) 최종 정산 / 결제하기
    const handleSettleFee = async () => {
        setParkingLoading(true)
        setParkingError('')

        try {
            const data = await settleParkingFee()

            const enriched = {
                ...data,
                expect_fee: 0,
            }

            setParkingInfo(enriched)
            setLastUpdated(new Date())

            setParkingStatusText(
                `결제가 완료되었습니다.\n총 ${formatDuration(
                    data.duration_minutes,
                )} 이용, 최종 요금 ${data.final_fee.toLocaleString()}원이 결제되었습니다.`,
            )

            setParkingStage('idle')
        } catch (error) {
            console.error(
                'settleParkingFee 오류',
                error.response?.status,
                error.response?.data || error,
            )
            const msg =
                error.response?.data?.message ||
                '정산 처리 중 오류가 발생했습니다.'
            setParkingError(msg)
        } finally {
            setParkingLoading(false)
        }
    }

    const isActiveParking =
        parkingStage === 'entered' || parkingStage === 'readyToPay'

    const currentDurationMinutes = isActiveParking
        ? parkingInfo?.duration_minutes ?? 0
        : null

    const durationText = isActiveParking
        ? formatDuration(currentDurationMinutes)
        : '현재 입차중이 아닙니다.'

    const lastUpdatedText = lastUpdated
        ? lastUpdated.toLocaleString()
        : '-'

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f7fb]">
            <Header />

            <main className="flex-1 px-10 py-6">
                <div className="flex gap-6">
                    {/* 왼쪽 영역 */}
                    <section className="flex-[2] flex flex-col gap-6">
                        {/* 건물 선택 카드 */}
                        <div>
                            <h2 className="text-sm font-semibold text-slate-800 mb-3">
                                건물 선택
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {BUILDINGS.map((b) => {
                                    const info = summary[b.id]
                                    const rate = info
                                        ? Math.round(info.occupancy_rate * 100)
                                        : 0

                                    return (
                                        <button
                                            key={b.id}
                                            type="button"
                                            onClick={() =>
                                                handleSelectBuilding(b.id)
                                            }
                                            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition text-left overflow-hidden"
                                        >
                                            <div className="flex">
                                                <div className="flex-1 px-5 py-4 flex flex-col gap-1">
                                                    <h3 className="text-base font-semibold text-slate-800">
                                                        {b.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-500">
                                                        주차장
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        선택하여 주차장 현황 확인
                                                    </p>
                                                    <p className="mt-3 text-xs text-slate-600">
                                                        {info
                                                            ? `현재 ${info.occupied}/${info.total}`
                                                            : '현재 데이터 없음'}
                                                    </p>
                                                    {info && (
                                                        <p className="text-xs text-[#174ea6] font-semibold mt-1">
                                                            {rate}% 사용 중
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="w-40 h-28 my-4 mr-4 rounded-xl overflow-hidden">
                                                    <img
                                                        src={b.image}
                                                        alt={b.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                            <div className="px-5 pb-4 pt-1">
                                                <div className="h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#174ea6]"
                                                        style={{
                                                            width: `${rate}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                            {summaryError && (
                                <p className="mt-2 text-xs text-red-500">
                                    {summaryError}
                                </p>
                            )}
                        </div>

                        {/* 혼잡도 그래프 */}
                        <section className="bg-white rounded-2xl shadow-md p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-800">
                                        과거 혼잡도
                                    </h3>
                                    {analysisRangeText && (
                                        <p className="mt-0.5 text-[11px] text-slate-500">
                                            {analysisRangeText}
                                        </p>
                                    )}
                                </div>
                                <select
                                    className="border border-slate-300 rounded-md text-xs px-2 py-1 bg-white"
                                    value={analysisBuilding}
                                    onChange={(e) => setAnalysisBuilding(e.target.value)}
                                >
                                    {BUILDINGS.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {analysisError ? (
                                <p className="text-xs text-red-500">
                                    {analysisError}
                                </p>
                            ) : (
                                <div className="h-64">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <LineChart
                                            data={analysisData}
                                            margin={{ left: -20 }}
                                        >
                                            <CartesianGrid
                                                stroke="#e5e7eb"
                                                strokeDasharray="3 3"
                                            />
                                            <XAxis
                                                dataKey="index"
                                                type="number"
                                                domain={[0, Math.max(analysisData.length - 1, 0)]}
                                                allowDecimals={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10 }}
                                                ticks={[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].filter(
                                                    (v) => v < analysisData.length
                                                )}
                                                tickFormatter={(value) => {
                                                    const item = analysisData[value]
                                                    return item ? item.timeLabel : ''
                                                }}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 10 }}
                                                tickLine={false}
                                                domain={[0, 100]}
                                                unit="%"
                                            />
                                            <Tooltip
                                                content={({ active, payload }) => {
                                                    if (!active || !payload || !payload.length) return null
                                                    const point = payload[0].payload
                                                    // point = { dateLabel, timeLabel, percent, ... }
                                                    return (
                                                        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-slate-800">
                                                            <div>{point.dateLabel}</div>
                                                            <div>{point.timeLabel}</div>
                                                            <div className="mt-1 text-[#2563eb] font-semibold">
                                                                혼잡도 {point.percent} %
                                                            </div>
                                                        </div>
                                                    )
                                                }}
                                            />
                                            <Line
                                                 type="monotone"
                                                dataKey="percent"
                                                stroke="#174ea6"
                                                strokeWidth={2}
                                                dot={{ r: 2 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </section>
                    </section>

                    {/* 오른쪽 패널 */}
                    <aside className="w-[340px] shrink-0 flex flex-col gap-4">
                        {/* 내 정보 */}
                        <div className="bg-white rounded-2xl shadow-md p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-slate-800">
                                    내 정보
                                </h3>
                                {!isEditingProfile && (
                                    <button
                                        type="button"
                                        onClick={handleStartEditProfile}
                                        className="text-[11px] px-2 py-1 rounded-md bg-[#f3f4f6] text-slate-600 hover:bg-[#e5e7eb] transition"
                                    >
                                        수정
                                    </button>
                                )}
                            </div>

                            {isEditingProfile ? (
                                <div className="space-y-2 text-sm text-slate-700">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-12 h-12 rounded-full bg-[#e5e7eb] overflow-hidden flex items-center justify-center text-[11px] text-slate-500">
                                            {editProfile.profileImage ? (
                                                <img
                                                    src={editProfile.profileImage}
                                                    alt={editProfile.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span>사진</span>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <span className="text-[11px] text-slate-500">
                                                프로필 사진
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <label className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-[#f3f4f6] text-xs text-slate-700 cursor-pointer hover:bg-[#e5e7eb]">
                                                    이미지 선택
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) =>
                                                            handleChangeProfileImage(
                                                                e.target
                                                                    .files?.[0],
                                                            )
                                                        }
                                                        className="hidden"
                                                    />
                                                </label>

                                                {editProfile.profileImage && (
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleClearProfileImage
                                                        }
                                                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-[#f3f4f6] text-xs text-slate-700 cursor-pointer hover:bg-[#e5e7eb]"
                                                    >
                                                        사진 삭제
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center gap-4">
                                        <span className="whitespace-nowrap">
                                            이름
                                        </span>
                                        <input
                                            type="text"
                                            value={editProfile.name}
                                            onChange={(e) =>
                                                handleChangeProfileField(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            className="flex-1 border border-slate-300 rounded-md px-2 py-1 text-sm"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center gap-4">
                                        <span className="whitespace-nowrap">
                                            학번
                                        </span>
                                        <input
                                            type="text"
                                            value={editProfile.studentId}
                                            onChange={(e) =>
                                                handleChangeProfileField(
                                                    'studentId',
                                                    e.target.value,
                                                )
                                            }
                                            className="flex-1 border border-slate-300 rounded-md px-2 py-1 text-sm"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center gap-4">
                                        <span className="whitespace-nowrap">
                                            즐겨찾는 건물
                                        </span>
                                        <select
                                            value={
                                                editProfile.favoriteBuilding
                                            }
                                            onChange={(e) =>
                                                handleChangeProfileField(
                                                    'favoriteBuilding',
                                                    e.target.value,
                                                )
                                            }
                                            className="flex-1 border border-slate-300 rounded-md px-2 py-1 text-sm bg-white"
                                        >
                                            {BUILDINGS.map((b) => (
                                                <option
                                                    key={b.id}
                                                    value={b.id}
                                                >
                                                    {b.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex justify-between items-center gap-4">
                                        <span className="whitespace-nowrap">
                                            차량 번호
                                        </span>
                                        <input
                                            type="text"
                                            value={editProfile.carNumber}
                                            disabled
                                            className="flex-1 border border-slate-200 bg-[#f9fafb] text-slate-500 rounded-md px-2 py-1 text-sm cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="mt-3 flex gap-2 justify-end">
                                        <button
                                            type="button"
                                            onClick={handleCancelProfile}
                                            className="px-3 py-1.5 text-xs rounded-md border border-slate-300 text-slate-600 hover:bg-[#f9fafb] transition"
                                        >
                                            취소
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSaveProfile}
                                            className="px-3 py-1.5 text-xs rounded-md bg-[#174ea6] text-white hover:bg-[#1450c8] transition"
                                        >
                                            저장
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1 text-sm text-slate-700">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-12 h-12 rounded-full bg-[#e5e7eb] overflow-hidden flex items-center justify-center text-[11px] text-slate-500">
                                            {profile.profileImage ? (
                                                <img
                                                    src={profile.profileImage}
                                                    alt={profile.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span>사진</span>
                                            )}
                                        </div>
                                        <div className="text-sm">
                                            <div className="font-semibold text-slate-800">
                                                {profile.name}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>이름</span>
                                        <span>{profile.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>학번</span>
                                        <span>{profile.studentId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>차량 번호</span>
                                        <span>{profile.carNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>즐겨찾는 건물</span>
                                        <span>
                                            {
                                                BUILDINGS.find(
                                                    (b) =>
                                                        b.id ===
                                                        profile.favoriteBuilding,
                                                )?.name
                                            }
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 현재 내 주차 이용 현황 */}
                        <div className="bg-white rounded-2xl shadow-md p-4">
                            <h3 className="text-sm font-semibold text-slate-800 mb-2">
                                현재 내 주차 이용 현황
                            </h3>

                            {parkingStatusText && (
                                <p className="text-xs text-slate-700 mb-2 whitespace-pre-line">
                                    {parkingStatusText}
                                </p>
                            )}

                            {parkingError && (
                                <p className="text-xs text-red-500 mb-2">
                                    {parkingError}
                                </p>
                            )}

                            {/* 서버 응답 요약 */}
                            {parkingInfo && (
                                <div className="mt-2 mb-3 text-xs text-slate-700 space-y-1">
                                    {'expect_fee' in parkingInfo && (
                                        <div>
                                            예상 요금:{' '}
                                            {parkingInfo.expect_fee.toLocaleString()}
                                            원 (
                                            {parkingInfo.duration_minutes}
                                            분 기준)
                                        </div>
                                    )}
                                    {'final_fee' in parkingInfo && (
                                        <>
                                            <div>
                                                입차 시각:{' '}
                                                {parkingInfo.entry_time}
                                            </div>
                                            <div>
                                                출차 시각:{' '}
                                                {parkingInfo.exit_time}
                                            </div>
                                            <div>
                                                최종 요금:{' '}
                                                {parkingInfo.final_fee.toLocaleString()}
                                                원 (
                                                {
                                                    parkingInfo
                                                        .duration_minutes
                                                }
                                                분 이용)
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* 주차 요금 계산 */}
                            <div className="flex flex-col gap-2 mt-2">
                                {parkingStage === 'idle' && (
                                    <button
                                        type="button"
                                        onClick={handleEnterParking}
                                        disabled={parkingLoading || parkingStage !== 'idle'}
                                        className="flex-1 rounded-lg bg-[#2563eb] text-white text-xs py-2 hover:bg-[#1d4ed8] disabled:opacity-60"
                                    >
                                        {parkingLoading && parkingStage === 'idle' ? '처리 중...' : '입차하기'}
                                    </button>
                                )}

                                {parkingStage === 'entered' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handlePreviewFee}
                                            disabled={parkingLoading || parkingStage === 'idle'}
                                            className="flex-1 rounded-lg border border-slate-300 bg-white text-xs py-2 text-slate-700 hover:bg-[#f9fafb] disabled:opacity-60"
                                        >
                                            예상 요금 확인
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleExitClick}
                                            disabled={parkingLoading || parkingStage !== 'entered'}
                                            className="flex-1 rounded-lg bg-[#2563eb] text-white text-xs py-2 hover:bg-[#1d4ed8] disabled:opacity-60"
                                        >
                                            출차하기
                                        </button>
                                    </>
                                )}

                                {parkingStage === 'readyToPay' && (
                                    <button
                                        type="button"
                                        onClick={handleSettleFee}
                                        disabled={parkingLoading || parkingStage !== 'readyToPay'}
                                        className="w-full rounded-lg bg-[#ef4444] text-white text-xs py-2 hover:bg-[#dc2626] disabled:opacity-60"
                                    >
                                        {parkingLoading && parkingStage === 'readyToPay'
                                            ? '결제 처리 중...'
                                            : '결제하기'}
                                    </button>
                                )}
                            </div>

                            <div className="mt-3 border-t pt-2 text-[11px] text-slate-500 space-y-1 border-slate-200">
                                <div>내 차량 번호: {profile.carNumber}</div>
                                <div>현재 주차중 시간 : {durationText}</div>
                                <div>마지막 갱신: {lastUpdatedText}</div>
                            </div>
                        </div>

                        {/* 내 선호 자리 */}
                        <div className="bg-white rounded-2xl shadow-md p-4">
                            <h3 className="text-sm font-semibold text-slate-800 mb-3">
                                내 선호 자리
                            </h3>

                            {favoriteItems.length === 0 ? (
                                <p className="text-xs text-slate-500">
                                    즐겨찾기한 좌석이 없음
                                </p>
                            ) : (
                                <div className="space-y-2 text-sm">
                                    {favoriteItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between rounded-lg bg-[#f9fafb] px-3 py-2"
                                        >
                                            <span>
                                                {item.buildingName}{' '}
                                                {item.slot}번
                                            </span>

                                            {item.status === null ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/parking/${item.buildingId}`,
                                                        )
                                                    }
                                                    className="text-xs px-2 py-0.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-[#eef2ff] transition"
                                                >
                                                    점유 여부 보러가기
                                                </button>
                                            ) : (
                                                <span
                                                    className={`text-xs px-2 py-0.5 rounded-full ${item.badgeClass}`}
                                                >
                                                    {item.label}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                type="button"
                                className="mt-3 w-full rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-500 hover:bg-[#f9fafb] transition"
                                onClick={() =>
                                    navigate(
                                        `/parking/${profile.favoriteBuilding}`,
                                    )
                                }
                            >
                                자리 추가하러 가기
                            </button>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}