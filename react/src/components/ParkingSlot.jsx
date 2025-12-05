//하나의 주차 칸 정보를 카드 형태로 보여줌
import React from 'react'

export default function ParkingSlot({
                                        slotId, //슬롯 번호
                                        occupied, //점유여부
                                        favorite, //즐겨찾기 여부
                                        onToggleFavorite, // 즐겨찾기 버튼 눌렀을 때 호출되는 콜백
                                    }) {
    const statusLabel = occupied ? '사용 중' : '비어있음'
    const statusClass = occupied
        ? 'bg-[#fce8e6] text-[#c5221f]'
        : 'bg-[#e6f4ea] text-[#137333]'

    return (
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1.5 xs:gap-0 rounded-lg bg-white shadow-sm px-3 py-2 mb-2">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onToggleFavorite}
                    className="text-base sm:text-lg leading-none"
                    aria-label="즐겨찾기"
                >
                    {favorite ? '★' : '☆'}
                </button>
                <span className="text-xs sm:text-sm text-slate-800">
                    {slotId}번
                </span>
            </div>
            <span
                className={`text-[11px] sm:text-xs px-2 py-0.5 rounded-full self-start xs:self-auto ${statusClass}`}
            >
                {statusLabel}
            </span>
        </div>
    )
}