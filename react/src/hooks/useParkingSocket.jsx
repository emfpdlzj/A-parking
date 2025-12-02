// 주차장 상태 WebSocket 구독 훅
import {useEffect, useRef, useState} from 'react'
import {useAuth} from './useAuth'

const WS_BASE = 'ws://localhost:8081'

export function useParkingSocket(buildingId) {
    const {accessToken} = useAuth()
    const [slots, setSlots] = useState({})
    const [connected, setConnected] = useState(false)
    const [error, setError] = useState('')
    const wsRef = useRef(null)

    // 언제 호출되든 현재 건물 채널 WebSocket을 확실하게 끊는 함수
    const closeSocket = (reason) => {
        const ws= wsRef.current
        if (!wsRef.current) return

        console.log(
            `[WS CLOSE] 건물 채널 종료 → ${buildingId}, readyState=${wsRef.current.readyState}`,
        )

        try {
            // 실제로 열려 있을 때만 정상 코드 (1000)로 종료함.
            if(ws.readyState === WebSocket.OPEN){
                ws.close(1000, reason ?? '페이지 이동/언마운트')
            }
            //알아서 종료
        } catch (e) {
            console.error('웹소켓 수동 종료 중 오류', e)
        } finally {
            wsRef.current = null
            setConnected(false)
        }
    }

    useEffect(() => {
        if (!buildingId) return

        if (!accessToken) {
            setError('로그인 필요')
            return
        }

        // "Bearer xxx" 형태-> 뒤에 JWT만 사용
        const rawToken = accessToken.startsWith('Bearer ')
            ? accessToken.slice(7)
            : accessToken

        const wsUrl = `${WS_BASE}/${buildingId}`
        const ws = new WebSocket(wsUrl, rawToken) // subprotocol = jwt
        wsRef.current = ws

        setError('')

        ws.onopen = () => {
            console.log('웹소켓 연결 성공', wsUrl)
            setConnected(true)
        }

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data)
                console.log('ws message', msg)

                const list = Array.isArray(msg?.data?.slots)
                    ? msg.data.slots
                    : Array.isArray(msg?.data)
                        ? msg.data
                        : []

                const map = {}
                list.forEach((item) => {
                    if (!item) return
                    const id = Number(item.id ?? item.slot_number ?? item.slot)
                    // 서버 occupied → 0/1로 정규화
                    let occNum
                    if (item.occupied === true) occNum = 1
                    else if (item.occupied === false) occNum = 0
                    else occNum = Number(item.occupied)

                    const normalized = occNum === 1 ? 1 : 0

                    if (!Number.isNaN(id)) {
                        map[id] = normalized
                    }
                })

                setSlots(map)
                //서버에서 항상 건물 전체 슬롯 보냄 -> 매번 전체 사앹 그대로 반영.
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
            // 페이지에서 나가거나 buildingId, accessToken 변경 시 항상 정리
            closeSocket()
        }
    }, [buildingId, accessToken])

    return {slots, connected, error, closeSocket}
}