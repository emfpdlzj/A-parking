import { Router } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {broadcast} from '../socket/webSocket.js';

dotenv.config();

const router = Router();

// JWT 토큰 검증 미들웨어
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: '토큰 확인 실패' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: '토큰 유효하지 않음' });
    req.user = user;
    next();
  });
}

// 로그인
router.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'user' && password === 'pass') {
    const user = { name: username };
    const accessToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
    broadcast(`${username}님이 로그인했습니다.`);
    return res.json({ accessToken });
  }

  res.status(401).json({ message: '인증 실패' });
});

// 인증 체크
router.get('/api/auth/check', verifyToken, (req, res) => {
  res.json({ message: '인증 성공', user: req.user });
});

export default router;
