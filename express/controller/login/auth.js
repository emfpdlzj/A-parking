import { Router } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { login } from '../../service/LoginService.js';

dotenv.config();

const router = Router();

// JWT 토큰 검증 미들웨어 , 나중에 service로 옮길 것
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
router.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const member = await login(username,password);
    const accessToken=jwt.sign(
        {name:member.name},
        process.env.JWT_SECRET, {expiresIn:'15m'});
    return res.json({ accessToken,member });
  } catch (err) {
    console.error(err);
    return res.status(400).json({message : '로그인 실패: ' + err.message});
  }
});

// 인증 체크
router.get('/api/auth/check', verifyToken, (req, res) => {
  res.json({ message: '인증 성공', user: req.user });
});

export default router;
