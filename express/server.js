import express from 'express';
import authRoutes from './controller/login/auth.js';
import dotenv from 'dotenv';
import {applyCors} from "./configuration/corsConfig.js";
import buildingSelector from './controller/building/BuildingSelector.js';
import './service/redis/redisSubscriber.js';
import initialize from './controller/caching/initialize.js';
import ParkingStatus from './controller/building/ParkingFee.js';
import { buildingSummaryRouter } from './controller/summary/BuildingSummary.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


dotenv.config();
applyCors(app); //cors 설정 적용
app.use(express.json());  // JSON body 파싱
app.use(express.static(path.join(__dirname, "../react/dist")));

app.use(authRoutes); // 인증 라우트
app.use(buildingSelector);
app.use(initialize);
app.use(ParkingStatus);
app.use(buildingSummaryRouter);

app.get('/', (req, res) => {
  res.send('8080 서버 응답');
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../react/dist/index.html"));
});

app.listen(8080, () => {
  console.log('8080 서버 실행 중');
});
