import React from 'react'
import { useNavigate } from 'react-router-dom'
import BuildingCard from '../components/BuildingCard'

const BUILDINGS = [
  { id: 'paldal', name: '팔달관' },
  { id: 'yulgok', name: '율곡관' },
  { id: 'woncheon', name: '원천관' },
  { id: 'namje', name: '남제관' },
]

export default function BuildingSelectPage(){
  const nav = useNavigate()
  return (
    <div className="container mx-auto p-6">
      <header className="header card"><div className="logo text-xl font-bold">🚗 주차관리시스템</div></header>
      <div className="mt-6 grid grid-cols-2 gap-6">
        {BUILDINGS.map(b=> <BuildingCard key={b.id} name={b.name} onClick={()=>nav(`/parking/${b.id}`)} />)}
      </div>
      <aside className="mt-6 card p-4 w-80">
        <h4 className="font-semibold">내 선호 자리</h4>
        <p className="text-gray-500">즐겨찾기한 좌석이 없습니다.</p>
      </aside>
    </div>
  )
}
