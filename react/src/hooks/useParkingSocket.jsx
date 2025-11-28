// 주차장 상태 WebSocket 구독 훅
import { useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth'

const WS_BASE = 'ws://localhost:8081'

export function useParkingSocket(buildingId) {
    const { accessToken } = useAuth()
    const [slots, setSlots] = useState({})
    const [connected, setConnected] = useState(false)
    const [error, setError] = useState('')
    const wsRef = useRef(null)

    useEffect(() => {
        if (!buildingId) return

        // 토큰 없으면 연결 안 함
        if (!accessToken) {
            setError('로그인 필요')
            return
        }

        const protocols = accessToken ? [accessToken] : []
        const ws = new WebSocket(WS_BASE, protocols)
        wsRef.current = ws

        setError('')

        ws.onopen = () => {
            console.log('웹소켓 연결 성공')
            setConnected(true)
        }

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data)

                const list = Array.isArray(msg?.data) ? msg.data : []

                const map = {}
                list.forEach((item) => {
                    if (!item) return
                    const id = Number(item.id)
                    const occ = Number(item.occupied)
                    if (!Number.isNaN(id)) {
                        map[id] = occ
                    }
                })

                setSlots((prev) =>
                    msg.type === 'update' ? { ...prev, ...map } : map,
                )
                setError('')
            } catch (e) {
                console.error('웹소켓 메시지 파싱 오류', e, event.data)
                setError('웹소켓 데이터 파싱 오류')
            }
        }

        ws.onerror = (err) => {
            console.error('웹소켓 에러', err)
            setError('웹소켓 연결 오류')
        }

        ws.onclose = (evt) => {
            console.log(`웹소켓 종료, code=${evt.code}, reason=${evt.reason}`)
            setConnected(false)
            if (evt.code === 4001) setError('토큰 누락')
            else if (evt.code === 4002) setError('토큰 만료')
            else if (evt.code === 4003) setError('서버 내부 오류')
        }

        return () => {
            ws.close(1000, '페이지 이동')
        }
    }, [buildingId, accessToken])

    return { slots, connected, error }
}