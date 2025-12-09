import { Router } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { login } from '../../service/login/LoginService.js';
import { verifyToken } from '../../service/login/LoginService.js';

dotenv.config();

const router = Router();

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
