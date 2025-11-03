import express from 'express';
import authRoutes from './routes/auth.js';
import dotenv from 'dotenv';
import root from './app.js';
import {applyCors} from "./configuration/corsConfig.js";


dotenv.config();
const app = express();
applyCors(app); //cors 설정 적용
app.use(express.json());  // JSON body 파싱

app.use(authRoutes);

app.get('/', (req, res) => {
  res.send('8080 서버 응답');
});

app.listen(8080, () => {
  console.log('8080 서버 실행 중');
});
