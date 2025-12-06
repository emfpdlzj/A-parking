import redis from "./redisConfig.js";
import { broadcast } from "../socket/webSocket.js";
import { getLatestParkingStatus, saveParkingStatusDB} from "../repository/redis/RedisRepository.js";

const buildingIds=["paldal","library","yulgok","yeonam"];
const cache={};

async function initCache() {
    for(const buildingId of buildingIds){
        try {
            const status= await getLatestParkingStatus(buildingId); //db에서 최신 상태 조회
            cache[buildingId]={
                buildingId : status.buildingId,
                slotMap : Object.fromEntries(status.slots.map(slot => [slot.slot,slot.occupied])), //부분 업데이트 관리 하기 편하게 slotmap사용
                updated : false
            }
        } catch (err) {
            console.log(`${buildingId} 주차장 상태 캐시 초기화 실패:`, err);
            cache[buildingId] = {buildingId,slotMap : {}, updated : false};
        }
    }
}

buildingIds.forEach((buildingId) => {
    redis.subscribe(`parking-status-${buildingId}`, () => {
        console.log(`${buildingId} 주차장 상태 채널 구독 시작`);
    });
});

redis.on("message", (channel, message) => {
    const data= JSON.parse(message);
    const buildingId=data.buildingId;
    if(!cache[buildingId]){
        cache[buildingId]={buildingId,slotMap:{},updated:false};
    }

    const slots=data.results.map(r=> ({ // redis 메시지 변경
        id:r.slot,
        occupied:r.occupied
    }));
    
    let changed=false;
    slots.forEach(slot => {
        const existing=cache[buildingId].slotMap[slot.id];
        if(!existing || existing.occupied !== slot.occupied){
            cache[buildingId].slotMap[slot.id]=slot;
            changed=true;
        }
    });
    if(changed){
        cache[buildingId].updated=true;
    }

    //buildingID에 해당하는 클라이언트들에게 웹소켓으로 방송 => 변화가 있을 때만 전송(전체 상태 전송)
    broadcast(buildingId, Object.values(cache[buildingId].slotMap));
});

setInterval(async () => {
    for(const buildingId in cache) {
        const building = cache[buildingId];
        if(!building.updated) continue; //업데이트된 적 없으면 넘어감
        try {
            await saveParkingStatusDB(buildingId, Object.values(building.slotMap)); //DB에 저장
            building.updated = false; //저장 완료 후 업데이트 플래그 초기화
        } catch (err) {
            console.error(`${buildingId} 주차장 상태 DB 저장 실패:`, err);
        }
    }
},60*1000); //1분마다 실행

initCache(); // 서버 시작 시 캐시 초기화 호출
export default redis;