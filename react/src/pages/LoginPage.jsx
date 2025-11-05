import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginApi } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import Header from '../components/Header'

const DEMO_ACCOUNT = {
  id: 'demo',
  pw: 'demo',
  user: { name: 'Demo User' }
}

export default function LoginPage(){
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const { login } = useAuth()
  const nav = useNavigate()

  const loginWithDemo= () => {
    setId(DEMO_ACCOUNT.id)
    setPw(DEMO_ACCOUNT.pw)
  }

  async function submit(e){
    e.preventDefault()
    setErr('')
    try{
      const data = await loginApi(id,pw)

      console.log('토큰:', data.accessToken);
      console.log('사용자 정보:', data.user);

  // support backend returning { accessToken, user }
  login(data.accessToken, data.user || { name: id || 'User' })
      nav('/')
    } catch(e){
      setErr('로그인 실패')
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Header />
      <div className="login-container">
        <div className="login-card">
          <h2 className="text-2xl font-semibold mb-4">AJOU UNIV. 주차 관리 시스템</h2>
          <form onSubmit={submit}>
            <input className="input" placeholder="사용자 ID" value={id} onChange={e=>setId(e.target.value)} />
            <input className="input" placeholder="비밀번호" type="password" value={pw} onChange={e=>setPw(e.target.value)} />
            <button className="btn" type="submit">로그인</button>
            <button type="button" className="btn" style={{background:'#eef3ff', color:'#2454b8', marginLeft:8}} onClick={loginWithDemo}>데모 계정</button>
          </form>
          {err && <p className="text-red-600 mt-2">{err}</p>}
        </div>
      </div>
    </div>
  )
}
