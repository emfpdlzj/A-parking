// 주차장 상태 WebSocket  
import { useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth'

const WS_BASE = import.meta.env.VITE_WS_BASE || 'ws://localhost:8081'

export function useParkingSocket(buildingId) {
    const { accessToken } = useAuth()
    const [slots, setSlots] = useState({})      // { slotId: occupied }
    const [connected, setConnected] = useState(false)
    const [error, setError] = useState('')
    const wsRef = useRef(null)

    useEffect(() => {
        if (!buildingId) return
        if (!accessToken) {
            setError('로그인 필요')
            return
        }

        const url = `${WS_BASE}/${buildingId}`
        const ws = new WebSocket(url, accessToken) // 토큰을 프로토콜로 전달
        wsRef.current = ws
        setError('')

        ws.onopen = () => {
            setConnected(true)
        }

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data) // [{ id, occupied }, ...]
                const map = {}
                data.forEach((item) => {
                    map[item.id] = item.occupied
                })
                setSlots(map)
            } catch {
                setError('웹소켓 데이터 파싱 오류')
            }
        }

        ws.onerror = () => {
            setError('웹소켓 연결 오류')
        }

        ws.onclose = () => {
            setConnected(false)
        }

        return () => {
            ws.close()
        }
    }, [buildingId, accessToken])

    return { slots, connected, error }
}