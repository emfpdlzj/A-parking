import express from "express";
import { verifyToken } from '../../service/login/LoginService.js';
import { saveParkingStatus, settleParkingFee } from "../../service/parkingfee/ParkingFeeService.js";
import { getParkingFeePreview } from "../../service/parkingfee/ParkingFeeService.js";

const app=express();
app.use(express.json());

app.post(`/api/parking/enter`, verifyToken, async (req, res) => {
  try {
    const name = req.userName;
    console.log('입차 요청 사용자:', name);
    await saveParkingStatus(name);
    res.status(200).json({ message:'입차가 성공적으로 처리되었습니다.'});
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

app.get(`/api/parking/fee/preview`, verifyToken, async (req, res) => {
    const userName=req.userName;
    const preview = await getParkingFeePreview(userName);
    res.status(200).json(preview);
});

app.post(`/api/parking/fee/settle`, verifyToken, async (req, res) => {
    const userName=req.userName;
    const settlement = await settleParkingFee(userName);
    res.status(200).json(settlement);
});

export default app;