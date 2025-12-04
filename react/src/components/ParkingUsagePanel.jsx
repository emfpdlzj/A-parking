import React, { useEffect, useState } from 'react'
import reloadIcon from '../assets/icons/reload.svg'
import parkingIcon from '../assets/icons/parking_icon.png'
import {
    enterParking,
    previewParkingFee,
    settleParkingFee,
} from '../api/parking.js'

const formatDuration = (minutes) => {
    if (minutes == null) return '-'
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0 && m > 0) return `${h}시간 ${m}분`
    if (h > 0) return `${h}시간`
    if (m > 0) return `${m}분`
    return '0분'
}

function ParkingUsagePanel({ profileCarNumber }) {
    const [parkingStage, setParkingStage] = useState('idle') // 'idle' | 'entered' | 'readyToPay'
    const [parkingInfo, setParkingInfo] = useState(null) // preview / settle 응답
    const [parkingError, setParkingError] = useState('')
    const [parkingLoading, setParkingLoading] = useState(false)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [statusText, setStatusText] = useState('주차 정보 없음')

    // 컴포넌트 마운트 시 현재 주차 상태 한 번 조회
    useEffect(() => {
        const initParkingState = async () => {
            setParkingLoading(true)
            setParkingError('')
            try {
                const data = await previewParkingFee()
                setParkingInfo(data)

                const now = new Date()
                setLastUpdated(now)

                const minutes = data.duration_minutes ?? 0
                const hasActive =
                    minutes > 0 ||
                    (typeof data.expect_fee === 'number' && data.expect_fee > 0)

                if (hasActive) {
                    setParkingStage('entered')
                    setStatusText(
                        `현재 입차중입니다.\n` +
                        `현재까지 예상 요금은 ${data.expect_fee.toLocaleString()}원 입니다.\n` +
                        `이용 시간 : ${formatDuration(minutes)}`,
                    )
                } else {
                    setParkingStage('idle')
                    setStatusText(
                        '현재 진행 중인 주차가 없습니다.\n' +
                        '"입차하기" 버튼을 눌러 주차를 시작해 주세요.',
                    )
                }
            } catch (error) {
                const status = error?.response?.status
                const msg = error?.response?.data?.message

                if (status === 400 && msg && msg.includes('활성')) {
                    setParkingStage('idle')
                    setParkingInfo(null)
                    setStatusText(
                        '현재 진행 중인 주차가 없습니다.\n' +
                        '"입차하기" 버튼을 눌러 주차를 시작해 주세요.',
                    )
                } else {
                    console.error('초기 주차 상태 조회 실패', error)
                    setParkingError(
                        '현재 주차 정보를 불러오는 중 오류가 발생했습니다.',
                    )
                }
            } finally {
                setParkingLoading(false)
            }
        }
        initParkingState()
    }, [])

    // 1) 입차하기
    const handleEnter = async () => {
        setParkingLoading(true)
        setParkingError('')

        try {
            await enterParking()

            setParkingStage('entered')
            setParkingInfo(null)
            setLastUpdated(new Date())

            setStatusText(
                `차량 번호: ${profileCarNumber}\n입차 완료!\n"새로고침" 버튼으로 현재까지의 요금을 확인할 수 있습니다.`,
            )
        } catch (error) {
            console.error('enterParking 오류', error)
            const msg =
                error.response?.data?.message ||
                '입차 처리 중 오류가 발생했습니다.'
            setParkingError(msg)
            setStatusText('입차 처리에 실패했습니다.')
            setParkingStage('idle')
        } finally {
            setParkingLoading(false)
        }
    }

    // 2) 예상 요금 확인 (새로고침 버튼)
    const handlePreview = async () => {
        setParkingLoading(true)
        setParkingError('')

        try {
            const data = await previewParkingFee()
            setParkingInfo(data)
            const now = new Date()
            setLastUpdated(now)

            const minutes = data.duration_minutes ?? 0

            // 예상 요금이나 이용 시간이 0보다 크면 "이미 입차 중"이라고 판단
            const hasActive =
                minutes > 0 ||
                (typeof data.expect_fee === 'number' && data.expect_fee > 0)

            // 새로고침 시, 입차 전 상태였는데 실제로는 입차 중이면 버튼을 "출차하기"로 바꾸기
            if (hasActive && parkingStage === 'idle') {
                setParkingStage('entered')
            }
            // 반대로 활성 세션이 없으면 idle 로 되돌리기
            if (!hasActive) {
                setParkingStage('idle')
            }

            setStatusText(
                hasActive
                    ? `현재까지 예상 요금은 ${data.expect_fee.toLocaleString()}원 입니다.\n` +
                    `이용 시간 : ${formatDuration(minutes)}`
                    : '현재 진행 중인 주차가 없습니다.\n' +
                    '"입차하기" 버튼을 눌러 주차를 시작해 주세요.',
            )
        } catch (error) {
            console.error('previewParkingFee 오류', error)
            const msg =
                error.response?.data?.message ||
                '예상 요금 조회 중 오류가 발생했습니다.'
            setParkingError(msg)
        } finally {
            setParkingLoading(false)
        }
    }

    // 3) 출차하기
    const handleExit = () => {
        if (parkingStage !== 'entered' && parkingStage !== 'readyToPay') {
            setStatusText('아직 입차가 되지 않았습니다!')
            return
        }

        setParkingStage('readyToPay')
        setLastUpdated(new Date())
        setStatusText(
            '출차 처리 완료!\n"결제하기" 버튼을 눌러 최종 정산을 진행해 주세요.',
        )
    }

    // 4) 최종 정산 / 결제하기
    const handleSettle = async () => {
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

            setStatusText(
                `결제가 완료되었습니다.\n총 ${formatDuration(
                    data.duration_minutes,
                )} 이용, 최종 요금 ${data.final_fee.toLocaleString()}원이 결제되었습니다.`,
            )

            setParkingStage('idle')
        } catch (error) {
            console.error('settleParkingFee 오류', error)

            const msg = error.response?.data?.message

            if (typeof msg === 'string' && msg.includes('입차 기록이 없습니다')) {
                // 입차 기록이 없으면, 지금 시각 기준으로 자동 입차 처리
                try {
                    await enterParking()
                    const now = new Date()

                    setParkingStage('entered')
                    setParkingInfo(null)
                    setLastUpdated(now)
                    setStatusText(
                        `기존 입차 기록이 없어,\n` +
                        `${now.toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })} 기준으로 새로 입차 처리되었습니다.\n` +
                        `"새로고침" 버튼으로 현재까지의 요금을 확인할 수 있습니다.`,
                    )
                    setParkingError('')
                    return
                } catch (enterErr) {
                    console.error('자동 입차 처리 중 오류', enterErr)
                    const msg2 =
                        enterErr.response?.data?.message ||
                        '입차 기록이 없어 자동 입차 처리도 실패했습니다.'
                    setParkingError(msg2)
                    setStatusText(
                        '입차 기록이 없어 결제를 진행할 수 없습니다.',
                    )
                }
            } else {
                const fallback =
                    msg || '정산 처리 중 오류가 발생했습니다.'
                setParkingError(fallback)
            }
        } finally {
            setParkingLoading(false)
        }
    }

    // 상태 텍스트
    const currentStatusText =
        parkingStage === 'idle'
            ? '입차 전'
            : parkingStage === 'entered'
                ? '주차 중'
                : '결제 대기'

    // 이용 시간: 서버에서 받은 duration_minutes 사용
    const durationMinutes =
        parkingStage === 'idle' ? 0 : parkingInfo?.duration_minutes ?? 0
    const durationText =
        parkingStage === 'idle' ? '입차 전' : formatDuration(durationMinutes)

    // 요금 (예상 요금 우선, 없으면 최종 요금)
    const currentFee = (() => {
        if (!parkingInfo) return 0
        if (typeof parkingInfo.expect_fee === 'number') {
            return parkingInfo.expect_fee
        }
        if (typeof parkingInfo.final_fee === 'number') {
            return parkingInfo.final_fee
        }
        return 0
    })()

    // 메인 버튼
    const mainButton = (() => {
        if (parkingStage === 'idle') {
            return {
                label: '입차하기',
                variant: 'enter',
                onClick: handleEnter,
            }
        }
        if (parkingStage === 'entered') {
            return {
                label: '출차하기',
                variant: 'exit',
                onClick: handleExit,
            }
        }
        return {
            label: '결제하기',
            variant: 'settle',
            onClick: handleSettle,
        }
    })()

    const mainButtonClass =
        mainButton.variant === 'settle'
            ? 'bg-[#ef4444] hover:bg-[#dc2626]'
            : 'bg-[#1d4ed8] hover:bg-[#1e40af]'

    const lastUpdatedLabel = lastUpdated
        ? lastUpdated.toLocaleString('ko-KR', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : '-'

    return (
        <div className="bg-white rounded-2xl shadow-md p-4">
            <div className="flex items-center gap-2 mb-4">
                <img
                    src={parkingIcon}
                    alt="주차현황 아이콘"
                    className="w-5 h-5 object-contain"
                />
                <h3 className="text-sm font-semibold text-slate-800">
                    내 주차 현황
                </h3>
            </div>

            {/* 내용 */}
            <div className="space-y-2 text-sm text-slate-800">
                <div className="flex justify-between">
                    <span>현재 상태</span>
                    <span
                        className={
                            parkingStage === 'entered'
                                ? 'text-[#1d4ed8] font-semibold'
                                : parkingStage === 'readyToPay'
                                    ? 'text-[#ef4444] font-semibold'
                                    : 'text-slate-600'
                        }
                    >
                        {currentStatusText}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>차량 번호</span>
                    <span>{profileCarNumber}</span>
                </div>
                <div className="flex justify-between">
                    <span>주차 시간</span>
                    <span>{durationText}</span>
                </div>
                <div className="flex justify-between">
                    <span>예상 요금</span>
                    <span>{currentFee.toLocaleString()}원</span>
                </div>
            </div>

            {/* 안내 텍스트 */}
            {statusText && (
                <p className="mt-2 text-xs whitespace-pre-line text-slate-500">
                    {statusText}
                </p>
            )}

            {/* 에러 메시지 */}
            {parkingError && (
                <p className="mt-2 text-xs text-red-500">{parkingError}</p>
            )}

            {/* 최근 갱신 */}
            <div className="mt-4 border-t border-slate-200 pt-2 text-[11px] text-slate-400 text-center">
                최근 갱신 | {lastUpdatedLabel}
            </div>

            {/* 메인 버튼 */}
            <div className="mt-4">
                <button
                    type="button"
                    onClick={mainButton.onClick}
                    disabled={parkingLoading}
                    className={`w-full rounded-lg py-2.5 text-sm font-semibold text-white ${mainButtonClass} disabled:opacity-60`}
                >
                    {parkingLoading ? '처리 중...' : mainButton.label}
                </button>
            </div>

            {/* 새로고침 버튼 */}
            <div className="mt-2">
                <button
                    type="button"
                    onClick={handlePreview}
                    disabled={parkingLoading}
                    className="w-full rounded-lg bg-[#f3f4f6] text-slate-700 text-sm py-2.5 flex items-center justify-center gap-2 hover:bg-[#e5e7eb] disabled:opacity-60"
                >
                    <img
                        src={reloadIcon}
                        alt="새로고침"
                        className="w-4 h-4"
                    />
                    <span>새로고침</span>
                </button>
            </div>
        </div>
    )
}

export default ParkingUsagePanel