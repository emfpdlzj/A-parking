//기존 구성에서 로직을 useParkingUsage훅으로 분리하고, 여기서는 훅 이용해서 UI만 관리하게 했음.
import React from 'react'
import reloadIcon from '../assets/icons/reload.svg'
import parkingIcon from '../assets/icons/parking_icon.png'
import { useParkingUsage } from '../hooks/useParkingUsage.jsx'

function ParkingUsagePanel({ profileCarNumber }) {
    const {
        // 상태 변경
        parkingStage,
        parkingError,
        parkingLoading,
        statusText,
        currentStatusText,
        durationText,
        currentFee,
        lastUpdatedLabel,
        // 액션 (버튼 클릭 등 ..)
        handleEnter,
        handlePreview,
        handleExit,
        handleSettle,
    } = useParkingUsage(profileCarNumber)

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

            {/* 요약 정보 */}
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