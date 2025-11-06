import express from "express";
import { broadcast } from "../socket/webSocket.js";

const app=express();
app.use(express.json());

app.get('/parking/:buildingId',(req,res) => {
    const { buildingId } = req.params;

    console.log(`${buildingId} 주차장 상태 요청 받음`);
    //여기서 실제 주차장 상태를 조회하는 로직을 구현해야 함
    broadcast(buildingId, JSON.stringify({ event: 'update', data: `주차장 ${buildingId} 상태 업데이트` }));
    res.json({ message: `주차장 ${buildingId} 상태 업데이트 알림 전송됨` });
})

export default app;