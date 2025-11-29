import React from 'react'

export default function ParkingSlot({
                                        slotId,
                                        occupied,
                                        favorite,
                                        onToggleFavorite,
                                    }) {
    const statusLabel = occupied ? '사용 중' : '비어있음'
    const statusClass = occupied
        ? 'bg-[#fce8e6] text-[#c5221f]'
        : 'bg-[#e6f4ea] text-[#137333]'

    return (
        <div className="flex items-center justify-between rounded-lg bg-white shadow-sm px-3 py-2 mb-2">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onToggleFavorite}
                    className="text-lg leading-none"
                    aria-label="즐겨찾기"
                >
                    {favorite ? '★' : '☆'}
                </button>
                <span className="text-sm text-slate-800">{slotId}번</span>
            </div>
            <span
                className={`text-xs px-2 py-0.5 rounded-full ${statusClass}`}
            >
                {statusLabel}
            </span>
        </div>
    )
}