import redis from "./redisConfig.js";
import { broadcast } from "../socket/webSocket.js";
import { getLatestParkingStatus, saveParkingStatusDB} from "../../repository/redis/RedisRepository.js";
import { saveStatus } from "../../service/congestion/CongestionService.js";

export const buildingIds=["paldal","library","yulgok","yeonam"];

async function initCache() {
    for (const buildingId of buildingIds) {
        try {
            const status = await getLatestParkingStatus(buildingId); // DB에서 최신 상태 조회
            const slotMap = Object.fromEntries(
                status.slots.map(slot =>[slot.id,{id:slot.id,occupied:slot.occupied}])
            );
            await redis.set(`parking:${buildingId}`,JSON.stringify(slotMap));
        } catch (err) {
            console.log(`${buildingId} 주차장 상태 캐시 초기화 실패:`, err);
        }
    }
}

redis.on("message", async (channel, message) => {
    const data = JSON.parse(message);
    const buildingId = data.buildingId;
    const slots = data.results.map(r => ({ id: r.id, occupied: r.occupied }));

    // Redis에서 현재 슬롯 상태 가져오기
    const slotMapRaw = await redis.get(`parking:${buildingId}`);
    let slotMap = slotMapRaw ? JSON.parse(slotMapRaw) : {};

    let changed = false;
    slots.forEach(slot => {
        const existing = slotMap[slot.id];
        if (!existing||existing.occupied!==slot.occupied) {
            slotMap[slot.id] =slot;
            changed =true;
        }
    });

    if (changed) {
        // Redis에 업데이트
        await redis.set(`parking:${buildingId}`, JSON.stringify(slotMap));
        // 웹소켓으로 브로드캐스트
        broadcast(buildingId, Object.values(slotMap));
    }
});

setInterval(async () => {
    for (const buildingId of buildingIds) {
        const slotMapRaw = await redis.get(`parking:${buildingId}`);
        if (!slotMapRaw) continue;
        const slotMap = JSON.parse(slotMapRaw);
        try {
            await saveParkingStatusDB(buildingId, Object.values(slotMap));
        } catch (err) {
            console.error(`${buildingId} 주차장 상태 DB 저장 실패:`, err);
        }
    }
}, 60 * 1000);

setInterval(async () => {
    const now = new Date();
    const minute = now.getMinutes();
    if (minute % 5 !== 0) return;

    for (const buildingId of buildingIds) {
        const slotMapRaw = await redis.get(`parking:${buildingId}`);
        if (!slotMapRaw) continue;
        const slotList = Object.values(JSON.parse(slotMapRaw));
        const totalSlots = slotList.length;
        const availableSlots = slotList.filter(s => !s.occupied).length;
        saveStatus(buildingId, totalSlots, availableSlots, now);
    }

    console.log(`혼잡도 저장 완료 at ${now.toISOString()}`);
}, 60 * 1000);

initCache();
export default redis;