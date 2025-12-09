import { getLatestParkingStatus } from "../../repository/redis/RedisRepository.js";
import redis from "../../service/redis/redisSubscriber.js";
import { buildingIds } from "../../service/redis/redisSubscriber.js";

export async function  getBuildingParkingStatus(buildingId) {
    console.log(`${buildingId} 주차장 상태 요청 받음`);
    if(!buildingId){
        throw new Error('buildingId가 필요합니다');
    }
    const parkingStatus = await getLatestParkingStatus(buildingId);
    return parkingStatus;
}

export async function getParkingSummary() {
    const result = [];
    for (const buildingId of buildingIds) {
        const slotMapRaw = await redis.get(`parking:${buildingId}`);
        if (!slotMapRaw) continue;
        const slotMap = JSON.parse(slotMapRaw);
        const slots = Object.values(slotMap);
        const total = slots.length;
        const occupied = slots.filter(s => s.occupied).length;
        result.push({
            buildingId,
            occupied,
            total,
            occupancy_rate: total === 0 ? 0 : +(occupied / total).toFixed(2)
        });
    }
    return result;
}