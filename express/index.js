import express from 'express';
import authRoutes from './routes/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());  // JSON body 파싱

app.use(authRoutes);

app.listen(8080, () => {
    console.log(process.env.JWT_SECRET);
  console.log('8080 서버 실행 중');
});
