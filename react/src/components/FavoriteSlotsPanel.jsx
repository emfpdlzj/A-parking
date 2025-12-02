import React from 'react'
import { getSlotStatus } from '../utils/slotStatusStorage'
import starIcon from "../assets/icons/star.svg";
import plusIcon from "../assets/icons/plusIcon.svg";
function FavoriteSlotsPanel(props) {
    const { mode } = props

    if (mode === 'global') {
        const {
            favorites,
            buildings,
            profileFavoriteBuilding,
            onNavigateToBuilding,
        } = props

        const favoriteItems = favorites.map((favId) => {
            const [bId, slotStr] = favId.split(':')
            const slot = Number(slotStr)
            const building = buildings.find((b) => b.id === bId)
            const rawStatus = getSlotStatus(bId, slot) // true/false/null/undefined

            let label = '상태 알 수 없음'
            let badgeClass = 'bg-[#f3f4f6] text-slate-500'
            let status = rawStatus ?? null

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
                status,
            }
        })

        return (
            <div className="bg-white rounded-2xl shadow-md p-4">
                <div className="flex items-center gap-2 mb-3">
                    <img
                        src={starIcon}
                        alt="star 아이콘"
                        className="w-4 h-4 object-contain"
                    />
                    <h3 className="text-sm font-semibold text-slate-800">
                        내 선호 자리
                    </h3>
                </div>
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
                                    {item.buildingName} {item.slot}번
                                </span>

                                {item.status === null ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onNavigateToBuilding(
                                                item.buildingId,
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
                    onClick={() => onNavigateToBuilding(profileFavoriteBuilding)}
                    className="mt-3 w-full rounded-2xl border border-dashed border-[#cbd5f5]
               px-4 py-3 flex items-center justify-center gap-2
               text-sm text-slate-700 hover:bg-[#f9fafb] transition"
                >
                    <img
                        src={plusIcon}
                        alt="plus 아이콘"
                        className="w-4 h-4 object-contain"
                    />
                    <span className="font-semibold">
                        자리 추가하러 가기
                    </span>
                </button>
            </div>
        )
    }

    const { favorites, buildingName, slots } = props

    return (
        <div className="bg-white rounded-2xl shadow-md p-4">
            <div className="flex items-center gap-2 mb-3">
                <img
                    src={starIcon}
                    alt="star 아이콘"
                    className="w-4 h-4 object-contain"
                />
                <h3 className="text-sm font-semibold text-slate-800">
                    내 선호 자리
                </h3>
            </div>
            {favorites.length === 0 ? (
                <p className="text-sm text-slate-500">
                    즐겨찾기한 자리가 없음
                </p>
            ) : (
                <div className="space-y-2 text-sm">
                    {favorites.map((slotId) => {
                        const occ = slots[slotId]
                        const isOccupied = occ === 1

                        return (
                            <div
                                key={slotId}
                                className="flex items-center justify-between rounded-lg bg-[#f9fafb] px-3 py-2"
                            >
                                <span>
                                    {buildingName} {slotId}번
                                </span>
                                <span
                                    className={[
                                        'text-xs px-2 py-0.5 rounded-full',
                                        isOccupied
                                            ? 'bg-[#fce8e6] text-[#c5221f]'
                                            : 'bg-[#e6f4ea] text-[#137333]',
                                    ].join(' ')}
                                >
                                    {isOccupied ? '사용 중' : '비어있음'}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default FavoriteSlotsPanel