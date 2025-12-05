// 주차장 상태 WebSocket 구독
import {useEffect, useRef, useState} from 'react'
import {useAuth} from './useAuth'

//const WS_BASE = 'ws://localhost:8081'
const WS_BASE = 'wss://a-parking.kro.kr/ws' //배포용

export function useParkingSocket(buildingId) { //웹소켓 연결해줌
    const {accessToken} = useAuth()
    const [slots, setSlots] = useState({}) //slot정보 저장
    const [connected, setConnected] = useState(false) //websocket 연결 관리
    const [error, setError] = useState('')
    const wsRef = useRef(null) //websocket instance

    // 언제 호출되든 현재 건물 채널 WebSocket을 확실하게 끊는 함수
    const closeSocket = () => {
        const ws= wsRef.current
        if (!ws) return //wsRef가 없으면 아무것도 안하고 종료

        if (
            ws.readyState === WebSocket.CONNECTING ||
            ws.readyState === WebSocket.OPEN
        ) {
            ws.close(1000, '페이지 이동/연결해제') //열려있으면 정상종료
        }
        // 이벤트 핸들러 제거,, 메모리 누수 방지 및 연결해제 후 상태 업데이트 방지
        ws.onopen = null
        ws.onclose = null
        ws.onmessage = null
        ws.onerror = null

        wsRef.current = null
        setConnected(false)
    }

    useEffect(() => {
        if (!buildingId) return //buildingId없으면 바로종료

        if (!accessToken) { //토큰 만료,없음 -> 에러 후 종료
            setError('로그인 필요')
            return
        }
        // 기존 연결이 있다면 무조건 종료 후 새로 연결
        if (wsRef.current) {
            closeSocket()
        }

        // "Bearer xxx" 형태-> 뒤에 JWT만 사용
        const rawToken = accessToken.startsWith('Bearer ')
            ? accessToken.slice(7)
            : accessToken

        const wsUrl = `${WS_BASE}/${buildingId}`
        const ws = new WebSocket(wsUrl, rawToken) // subprotocol = jwt
        wsRef.current = ws

        setError('') //연결 준비 완료 ->Error 초기화함

        ws.onopen = () => {
            console.log('웹소켓 연결 성공', wsUrl)
            setConnected(true)
        }

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data)
                console.log('ws message', msg)

               let list = null

                if (msg.type === 'init') {
                    list = msg.data?.slots
                } else if (msg.type === 'update') {
                    list = msg.data
                }


                // 배열이 아니면 에러 처리
                if (!Array.isArray(list)) {
                    console.error('웹소켓 데이터 형식 오류', msg)
                    setError('웹소켓 데이터 형식 오류')
                    return
                }

                const map = {}
                list.forEach((item) => {
                    if (!item) return
                    const id = Number(item.id)

                    let occNum //점유, 비어있음 -> 1,0
                    if (item.occupied === true) occNum = 1
                    else if (item.occupied === false) occNum = 0

                    if (!Number.isNaN(id)) {
                        map[id] = occNum
                    }
                })

                setSlots(map)
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
            console.log(`웹소켓 종료`)
            setConnected(false)
            if (evt.code === 4001) setError('토큰 누락')
            else if (evt.code === 4002) setError('토큰 만료')
            else if (evt.code === 4003) setError('서버 내부 오류')
        }

        return () => {
            // 페이지에서 나가거나 buildingId, accessToken 변경 시 항상 종료
            closeSocket()
        }
    }, [buildingId, accessToken])

    return {slots, connected, error, closeSocket}
}