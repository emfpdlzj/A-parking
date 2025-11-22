import express from 'express';
import authRoutes from './controller/login/auth.js';
import dotenv from 'dotenv';
import {applyCors} from "./configuration/corsConfig.js";
import buildingSelector from './controller/building/BuildingSelector.js';
import './redis/redisSubscriber.js';
import initialize from './controller/caching/initialize.js';

const app = express();

dotenv.config();
applyCors(app); //cors 설정 적용
app.use(express.json());  // JSON body 파싱

app.use(authRoutes); // 인증 라우트
app.use(buildingSelector);
app.use(initialize);

app.get('/', (req, res) => {
  res.send('8080 서버 응답');
});

app.listen(8080, () => {
  console.log('8080 서버 실행 중');
});
