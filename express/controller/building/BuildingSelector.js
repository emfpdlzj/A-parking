import express from "express";
import { getLatestParkingStatus } from "../../repository/redis/RedisRepository.js";
import { getStatus } from "../../service/congestion/CongestionService.js";

const app=express();
app.use(express.json());

app.get('/api/parking-lot/:buildingId',async (req,res) => {
    const { buildingId } = req.params;

    console.log(`${buildingId} 주차장 상태 요청 받음`);
    const parkingStatus= await getLatestParkingStatus(buildingId);
    //여기서 실제 주차장 상태를 조회하는 로직을 구현해야 함
    res.json({ success: true, data: parkingStatus });
})

app.get('/api/parking-lot/analysis/:buildingId', async (req, res) => {
    try {
        const { buildingId } = req.params;
        const now= new Date();
        if (!now) {
            return res.status(400).json({ error:'timeStamp가 필요합니다'});
        }
        const status = await getStatus(buildingId, now);
        res.json({ buildingId, status });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '서버 오류' });
    }
});
export default app;