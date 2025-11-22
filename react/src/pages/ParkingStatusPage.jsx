import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getParking, getAnalysis } from '../api/parking'
import SlotMap from '../components/SlotMap'
import { loadFavs } from '../utils/favStorage'
import Header from '../components/Header'

export default function ParkingStatusPage(){
  const { buildingId } = useParams()
  const nav = useNavigate()
  const [slots, setSlots] = useState([])
  const [analysis, setAnalysis] = useState({ free: '-', occ: '-' })
  const [selected, setSelected] = useState(null)
  const [favs, setFavs] = useState(loadFavs())

  useEffect(() => {

 const token = localStorage.getItem('accessToken');
const ws = new WebSocket(`ws://localhost:8081/${buildingId}`, [token]);

  ws.onopen = () => console.log(`${buildingId} 웹소켓 연결 성공`);

  ws.onmessage = (event) => {
    try {
      const msg=JSON.parse(event.data);
      if(msg.type==="init") {
        setSlots(msg.data.slots);
      } else if(msg.type==="update") {
        setSlots(msg.data);
      }
    } catch (error) {
      console.error('웹소켓 메시지 처리 오류:', error);
    }
  }
  ws.onerror = (err) => console.error('WebSocket 에러:', err)
    ws.onclose = () => console.log(`${buildingId} 웹소켓 연결 종료`)

}, [buildingId])

  return (
    <div className="container mx-auto p-6">
      <Header />

      <div className="page-layout mt-6">
        <div className="map-area card">
          <div className="flex justify-center mb-4"><button className="btn" onClick={()=>nav('/')}>뒤로가기</button></div>
          <SlotMap slots={slots} onSelect={setSelected} />
        </div>

        <div className="side-panel">
          <div className="card p-4">
            <h4 className="font-semibold">범례</h4>
            <div className="mt-2">
              <div className="flex items-center gap-2"><div style={{width:18,height:18,background:'#dff4ff',borderRadius:4,border:'1px solid #b6e0ff'}}></div> 이용가능 <span className="ml-auto text-blue-600">{analysis.free}석</span></div>
              <div className="flex items-center gap-2 mt-2"><div style={{width:18,height:18,background:'#e0e0e0',borderRadius:4}}></div> 주차중 <span className="ml-auto text-blue-600">{analysis.occ}석</span></div>
            </div>

            <div className="selected-info mt-4 p-3 border rounded">
              <h5 className="font-semibold">현재 내 좌석 이용현황</h5>
              <p className="text-blue-600">선택된 좌석: {selected ? selected.id : '없음'}</p>
              <p>이용시간: {selected?.time ?? '-'}</p>
              <p>예상요금: {selected?.fee ?? '-'} 원</p>
            </div>
          </div>

          <div className="mt-4 card p-4">
            <h4 className="font-semibold">선택한 좌석</h4>
            {selected ? (
              <div><p>좌석 번호: {selected.id}</p><p>상태: {selected.occupied ? '주차중' : '이용 가능'}</p></div>
            ) : <p className="text-gray-500">좌석을 선택해주세요</p>}
          </div>

          <div className="mt-4 card p-4">
            <h4 className="font-semibold">내 선호 자리</h4>
            {favs.length ? favs.map(id=> <div key={id}>★ 좌석 {id}</div>) : <p className="text-gray-500">즐겨찾기한 좌석이 없습니다.</p>}
          </div>

        </div>
      </div>
    </div>
  )
}

function demoSlots(){
  const arr = []
  for(let i=1;i<=120;i++) arr.push({ id:i, occupied: Math.random()<0.55 })
  return arr
}
