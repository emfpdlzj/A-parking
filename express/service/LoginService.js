import { findMemberByName } from '../repository/login/LoginRepository.js';

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