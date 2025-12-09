import express from "express";
import { getStatus } from "../../service/congestion/CongestionService.js";
import {getBuildingParkingStatus} from "../../service/building/BuildingSelcetorService.js";

const app=express();
app.use(express.json());

app.get('/api/parking-lot/:buildingId',async (req,res) => {
    const { buildingId } = req.params;
    const parkingStatus= await getBuildingParkingStatus(buildingId);
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