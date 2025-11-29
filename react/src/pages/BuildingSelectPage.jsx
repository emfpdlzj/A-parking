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
    const [isSettleStage, setIsSettleStage] = useState(false) // 출차 버튼 누른 뒤 결제 단계 진입 여부

    const navigate = useNavigate()
    const [parkingStage, setParkingStage] = useState('idle')

    const isParked = !!parkingInfo
    const [profile, setProfile] = useState(() => {
        try {
            const raw = localStorage.getItem('profile')
            if (raw) return JSON.parse(raw)
        } catch {
            // 무시
        }
        return {
            name: '홍길동',
            studentId: '202012345',
            favoriteBuilding: 'paldal',
            carNumber: '12가3456',
        }
    })
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [editProfile, setEditProfile] = useState(profile)
    const formatDuration = (minutes) => {
        if (minutes == null) return '-'
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        if (h > 0 && m > 0) return `${h}시간 ${m}분`
        if (h > 0) return `${h}시간`
        return `${m}분`
    }

    const formatTime = (date) => {
        if (!date) return ''
        const d = typeof date === 'string' ? new Date(date) : date
        const hh = String(d.getHours()).padStart(2, '0')
        const mm = String(d.getMinutes()).padStart(2, '0')
        return `${hh}:${mm}`
    }


    const handleEnterClick = async () => {
        setParkingLoading(true)
        setParkingError('')
        try {
            await enterParking()
        } catch {
            setParkingError('입차 처리 중 오류 발생')
        } finally {
            setParkingLoading(false)
        }
    }

    const handleSettleClick = async () => {
        setParkingLoading(true)
        setParkingError('')
        try {
            await settleParkingFee()
            setParkingInfo(null)
            setParkingStatusText('주차 정보 없음')
            setLastUpdated(new Date())
        } catch {
            setParkingError('정산 처리 중 오류 발생')
        } finally {
            setParkingLoading(false)
        }
    }

    const handlePrimaryParkingClick = async () => {
        if (isParked) {
            await handleSettleClick()
        } else {
            await handleEnterClick()
        }
    }
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
            // 저장 실패 시 무시
        }
    }

    const handleCancelProfile = () => {
        setIsEditingProfile(false)
        setEditProfile(profile)
    }
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

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const res = await getAnalysis(analysisBuilding)
                const chartData =
                    res.status?.map((item) => ({
                        hourLabel: `${String(item.hour).padStart(2, '0')}:00`,
                        percent: Math.round(item.avg_congestion_rate * 100),
                    })) ?? []
                setAnalysisData(chartData)
                setAnalysisError('')
            } catch {
                setAnalysisError('혼잡도 데이터를 불러올 수 없음')
            }
        }

        fetchAnalysis()
    }, [analysisBuilding])

    const handleSelectBuilding = (buildingId) => {
        navigate(`/parking/${buildingId}`)
    }

    const favoriteItems = favorites.map((favId) => {
        const [bId, slotStr] = favId.split(':')
        const slot = Number(slotStr)
        const building = BUILDINGS.find((b) => b.id === bId)
        const status = getSlotStatus(bId, slot)

        let label = '상태 알 수 없음'
        let badgeClass = 'bg-[#f3f4f6] text-slate-500'

        if (status === true) {
            label = '사용 중'
            badgeClass = 'bg-[#fce8e6] text-[#c5221f]'
        } else if (status === false) {
            label = '비어있음'
            badgeClass = 'bg-[#e6f4ea] text-[#137333]'
        }

        return {
            id: favId,
            buildingName: building?.name || bId,
            slot,
            label,
            badgeClass,
        }
    })
    // 입차하기
    const handleEnterParking = async () => {
        setParkingLoading(true)
        setParkingError('')
        try {
            // Authorization 헤더만으로 입차 처리
            await enterParking()

            setParkingStage('entered')
            setParkingInfo(null)
            setParkingStatusText('입차 완료! 이제 예상 요금 확인 또는 출차를 할 수 있습니다.')
            setLastUpdated(new Date())
        } catch (error) {
            console.error('enterParking 오류', error.response?.status, error.response?.data || error)
            const msg =
                error.response?.data?.message ||
                '입차 처리 중 오류가 발생했습니다.'
            setParkingError(msg)
            setParkingStatusText('입차 처리에 실패했습니다.')
        } finally {
            setParkingLoading(false)
        }
    }

    // 예상 요금 확인
    const handlePreviewFee = async () => {
        setParkingLoading(true)
        setParkingError('')

        try {
            const data = await previewParkingFee()
            setParkingInfo(data)
            setLastUpdated(new Date())

            setParkingStatusText(
                `현재까지 예상 요금은 ${data.expect_fee.toLocaleString()}원 입니다. (이용 시간 ${data.duration_minutes}분)`
            )
        } catch (error) {
            console.error('previewParkingFee 오류', error.response?.status, error.response?.data || error)
            const msg =
                error.response?.data?.message ||
                '예상 요금 조회 중 오류가 발생했습니다.'
            setParkingError(msg)
        } finally {
            setParkingLoading(false)
        }
    }

// 출차하기 버튼 (백엔드 호출 X, 정산 단계로 UI만 전환)
    const handleExitClick = () => {
        setParkingStage('readyToPay')
        setParkingStatusText('출차 처리 완료. 결제하기 버튼을 눌러 최종 정산을 진행해 주세요.')
    }

// 최종 정산(결제) 처리
    const handleSettleFee = async () => {
        setParkingLoading(true)
        setParkingError('')

        try {
            const data = await settleParkingFee()
            setParkingInfo(data)
            setLastUpdated(new Date())
            setParkingStatusText(
                `총 ${data.duration_minutes}분 이용, 최종 요금 ${data.final_fee.toLocaleString()}원이 결제되었습니다.`
            )

            // 결제까지 끝났으니 다시 "입차하기" 상태로 초기화
            setParkingStage('idle')
        } catch (error) {
            console.error('settleParkingFee 오류', error.response?.status, error.response?.data || error)
            const msg =
                error.response?.data?.message ||
                '정산 처리 중 오류가 발생했습니다.'
            setParkingError(msg)
        } finally {
            setParkingLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f7fb]">
            <Header />

            <main className="flex-1 px-10 py-6">
                <div className="flex gap-6">
                    {/* 왼쪽 */}
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
                                            onClick={() => handleSelectBuilding(b.id)}
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
                                                        style={{ width: `${rate}%` }}
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
                                <h3 className="text-sm font-semibold text-slate-800">
                                    과거 혼잡도
                                </h3>
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
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={analysisData} margin={{ left: -20 }}>
                                            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="hourLabel"
                                                tick={{ fontSize: 10 }}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 10 }}
                                                tickLine={false}
                                                domain={[0, 100]}
                                                unit="%"
                                            />
                                            <Tooltip />
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
                                            value={editProfile.favoriteBuilding}
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

                        {/* 오른쪽 패널 중 "현재 내 좌석 이용현황" 카드 */}
                        <div className="bg-white rounded-2xl shadow-md p-4">
                            <h3 className="text-sm font-semibold text-slate-800 mb-2">
                                현재 내 주차 이용 현황
                            </h3>

                            <p className="text-xs text-slate-500 mb-2">
                                실제 요금 계산/정산은 Express 서버의 주차 API와 연동됩니다.
                            </p>

                            {parkingStatusText && (
                                <p className="text-xs text-slate-700 mb-2">
                                    {parkingStatusText}
                                </p>
                            )}

                            {lastUpdated && (
                                <p className="text-[11px] text-slate-400 mb-2">
                                    마지막 갱신: {lastUpdated.toLocaleString()}
                                </p>
                            )}

                            {parkingError && (
                                <p className="text-xs text-red-500 mb-2">
                                    {parkingError}
                                </p>
                            )}

                            {/* 버튼들 */}
                            <div className="flex flex-col gap-2 mt-2">
                                {parkingStage === 'idle' && (
                                    <button
                                        type="button"
                                        onClick={handleEnterParking}
                                        disabled={parkingLoading}
                                        className="w-full rounded-lg bg-[#174ea6] text-white text-xs py-2 hover:bg-[#1d4ed8] disabled:opacity-60"
                                    >
                                        {parkingLoading ? '입차 처리 중...' : '입차하기'}
                                    </button>
                                )}

                                {parkingStage === 'entered' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handlePreviewFee}
                                            disabled={parkingLoading}
                                            className="w-full rounded-lg bg-[#f3f4f6] text-xs py-2 text-slate-700 hover:bg-[#e5e7eb] disabled:opacity-60"
                                        >
                                            {parkingLoading ? '조회 중...' : '주차 요금 확인'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleExitClick}
                                            disabled={parkingLoading}
                                            className="w-full rounded-lg bg-[#dcfce7] text-xs py-2 text-[#166534] hover:bg-[#bbf7d0] disabled:opacity-60"
                                        >
                                            출차하기
                                        </button>
                                    </>
                                )}

                                {parkingStage === 'readyToPay' && (
                                    <button
                                        type="button"
                                        onClick={handleSettleFee}
                                        disabled={parkingLoading}
                                        className="w-full rounded-lg bg-[#f97316] text-white text-xs py-2 hover:bg-[#ea580c] disabled:opacity-60"
                                    >
                                        {parkingLoading ? '결제 처리 중...' : '결제하기'}
                                    </button>
                                )}
                            </div>

                            {/* preview / settle 응답 요약 표현 (선택) */}
                            {parkingInfo && (
                                <div className="mt-3 border-t pt-2 text-xs text-slate-700 space-y-1">
                                    {'expect_fee' in parkingInfo && (
                                        <div>
                                            예상 요금: {parkingInfo.expect_fee.toLocaleString()}원 (
                                            {parkingInfo.duration_minutes}분 기준)
                                        </div>
                                    )}
                                    {'final_fee' in parkingInfo && (
                                        <>
                                            <div>입차 시각: {parkingInfo.entry_time}</div>
                                            <div>출차 시각: {parkingInfo.exit_time}</div>
                                            <div>
                                                최종 요금: {parkingInfo.final_fee.toLocaleString()}원 (
                                                {parkingInfo.duration_minutes}분 이용)
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

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
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full ${item.badgeClass}`}
                                            >
                                                {item.label}
                                            </span>
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