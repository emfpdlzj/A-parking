import React from 'react'
import starIcon from '../assets/icons/star.svg'
import plusIcon from '../assets/icons/plusIcon.svg'

//공통 UI: 카드, 타이틀
function FavoritePanelContainer({ children }) {
    return (
        <div className="bg-white rounded-2xl shadow-md p-4">
            <div className="flex items-center gap-2 mb-3">
                <img
                    src={starIcon}
                    alt="star 아이콘"
                    className="w-4 h-4 object-contain"
                />
                <h3 className="text-xs sm:text-sm font-semibold text-slate-800">
                    내 선호 자리
                </h3>
            </div>
            {children}
        </div>
    )
}

function FavoriteSlotsPanel(props) {
    const { mode } = props

//BuildingSelectPage
    if (mode === 'global') {
        const {
            favorites, //예: ["paldal:1", .. 어느건물의 어디 자리인지
            buildings,//예: [{ id, name }, ... //건물 리스트. 여기서 건물 찾음.
            profileFavoriteBuilding, // 예: "paldal" //대표건물. 일단 팔달로 설정해둠. 자리추가하러가기 누르면 여기로 이동
            onNavigateToBuilding,    //(buildingId) 에 따른 점유 상태 보러가기
        } = props

        const favoriteItems = favorites.map((favId) => { //즐겨찾기 하나를 객체로 변환해서 화면에 보여줌
            const [bId, slotStr] = favId.split(':')
            const slot = Number(slotStr) //좌석 번호 숫자로 변환
            const building = buildings.find((b) => b.id === bId) //해당하는 건물 찾음

            return {
                id: favId, //key
                buildingId: bId, // onNavigateToBuilding(bId)에 사용
                buildingName: building?.name || bId,
                slot, //숫자
            }
        })

        return (
            <FavoritePanelContainer>
                {favoriteItems.length === 0 ? (
                    <p className="text-xs sm:text-sm text-slate-500">
                        즐겨찾기한 좌석이 없음
                    </p>
                ) : (
                    <div className="space-y-2 text-xs sm:text-sm">
                        {favoriteItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded-lg bg-[#f9fafb] px-3 py-2 border border-slate-200"
                            >
                                <span className="truncate">
                                    {item.buildingName} {item.slot}번
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onNavigateToBuilding(item.buildingId)
                                    }
                                    className="text-[11px] sm:text-xs px-2 py-0.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-[#eef2ff] transition whitespace-nowrap"
                                >
                                    점유 여부 보러가기
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    type="button"
                    onClick={() =>
                        onNavigateToBuilding(profileFavoriteBuilding)
                    }
                    className="mt-3 w-full rounded-2xl border border-dashed border-[#cbd5f5]
               px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-center gap-2
               text-xs sm:text-sm text-slate-700 hover:bg-[#f9fafb] transition"
                >
                    <img
                        src={plusIcon}
                        alt="plus 아이콘"
                        className="w-4 h-4 object-contain"
                    />
                    <span className="font-semibold">자리 추가하러 가기</span>
                </button>
            </FavoritePanelContainer>
        )
    }

   //개별 건물 상태 보는 페이지
    const { favorites = [], buildingName, slots = {} } = props

    return (
        <FavoritePanelContainer>
            {favorites.length === 0 ? (
                <p className="text-xs sm:text-sm text-slate-500">
                    즐겨찾기한 자리가 없음
                </p>
            ) : (
                <div className="space-y-2 text-xs sm:text-sm">
                    {favorites.map((slotId) => {
                        const occ = slots[slotId]
                        const isOccupied = occ === 1 //1이면 점유 처리, 아니면 빈자리

                        return (
                            <div
                                key={slotId}
                                className="flex items-center justify-between rounded-lg bg-[#f9fafb] px-3 py-2 border border-slate-200"
                            >
                                <span className="truncate">
                                    {buildingName} {slotId}번
                                </span>
                                <span
                                    className={[
                                        'text-[11px] sm:text-xs px-2 py-0.5 rounded-full',
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
        </FavoritePanelContainer>
    )
}

export default FavoriteSlotsPanel