import { findMemberByName } from '../../repository/login/LoginRepository.js';

export async function login(name,password) {
    const member=await findMemberByName(name);
    if(!member){
        throw new Error('사용자를 찾을 수 없습니다.');
    }

    if(member.password !== password){
        throw new Error('비밀번호가 일치하지 않습니다.');
    }

    return member;
}

export function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: '토큰 확인 실패' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: '토큰 유효하지 않음' });
    req.user = user;           // 전체 user 저장
    req.userName = user.name;  // name만 별도로 저장 가능
    next();
  });
}