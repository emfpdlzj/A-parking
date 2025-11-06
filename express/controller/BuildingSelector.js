import express from "express";
import { broadcast } from "../socket/webSocket.js";

const app=express();
app.use(express.json());

app.get('/api/parking-lot/:buildingId',(req,res) => {
    const { buildingId } = req.params;

    console.log(`${buildingId} 주차장 상태 요청 받음`);

    //여기서 실제 주차장 상태를 조회하는 로직을 구현해야 함
   const parkingStatus = {
    slots: [
      { id: 1, occupied: true },
      { id: 2, occupied: false },
      { id: 3, occupied: true }
    ]
  };
  console.log(`${buildingId} 주차장 상태:`, parkingStatus);
    res.json({ success: true, data: parkingStatus });
})

app.get('/api/parking-lot/analysis/:buildingId', (req, res) => {
  const { buildingId } = req.params;

  console.log(`${buildingId} 주차장 분석 데이터 요청 받음`);

  // WebSocket으로 알림 전송 (실제 analysis 데이터는 나중에)
  broadcast(buildingId, {
    type: "analysis",
    message: "분석 데이터가 업데이트되었습니다."
  });

  // 임시 분석 데이터 예시
  const analysisData = {
    free: Math.floor(Math.random() * 50),
    occ: Math.floor(Math.random() * 100)
  };

  // HTTP 응답
  res.json({ success: true, data: analysisData });
});
export default app;