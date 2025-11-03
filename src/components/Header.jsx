import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Header(){
  const { token, user, logout } = useAuth()
  const nav = useNavigate()

  return (
    <header className="header card flex items-center justify-between">
      <div className="logo text-xl font-bold">🚗 주차관리시스템</div>
      <div>
        {token ? (
          <div className="flex items-center gap-3">
            <span className="text-sm">{user?.name ? `${user.name} 님` : '로그인됨'}</span>
            <button className="btn" onClick={()=>{ logout(); nav('/login') }}>로그아웃</button>
          </div>
        ) : (
          <Link to="/login" className="btn">로그인</Link>
        )}
      </div>
    </header>
  )
}
