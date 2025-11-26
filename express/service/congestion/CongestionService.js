import { saveCongestionStatus, getCongestionStatusByHour } from '../../repository/congestion/CongestionRepository.js';

//건물 이름, 주차 슬롯 상태(통계해서 ex> 전체자리, 남은 자리 등), localdateTime 저장
export async function saveStatus(buildingId, totalSlots, availableSlots, timeStamp) {
    await saveCongestionStatus(buildingId, totalSlots, availableSlots, timeStamp);
}

export async function getStatus(buildingId) {
    return await getCongestionStatusByHour(buildingId);
}