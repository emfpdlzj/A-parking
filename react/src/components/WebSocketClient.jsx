import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth'; // 사용자님의 인증 훅 가정

// 웹소켓 서버 포트: 8081
const WS_PORT = 8081; 
const WEBSOCKET_URL = `wss://a-parking.kro.kr/ws`;

export default function WebSocketClientComponent() {
  const { accessToken } = useAuth(); // 로그인 후 저장된 토큰 가져오기
  const ws = useRef(null); // WebSocket 인스턴스 참조
  const [isConnected, setIsConnected] = useState(false);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  
  useEffect(() => {
    // 1. 토큰이 없으면 연결 시도하지 않고, 기존 연결이 있다면 닫음
    if (!accessToken) {
      if (ws.current) {
        ws.current.close(1000, "토큰이 없어 연결 해제");
        ws.current = null;
        setIsConnected(false);
      }
      return;
    }

const protocols = accessToken ? [accessToken] : [];
ws.current = new WebSocket(WEBSOCKET_URL, protocols);
    
    ws.current.onopen = () => {
      console.log('웹소켓 연결 성공');
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      try{
        const msg=JSON.parse(event.data);
        if(msg.type=="init") {
            setReceivedMessages([msg.data]);
        } else if(msg.type="update") {
            setReceivedMessages(prev => [...prev, msg.data]);
        }
      } catch (error) {
        console.error('메시지 파싱 오류:', error);
      }
    };

    ws.current.onerror = (error) => {
      console.error('웹소켓 에러 발생:', error);
    };

    ws.current.onclose = (event) => {
      console.log(`웹소켓 연결 종료. 코드: ${event.code}`);
      setIsConnected(false);
    };

    return () => {
      if (ws.current) {
        console.log('컴포넌트 클린업: 웹소켓 연결 닫기');
        ws.current.close(1000, "클라이언트 언마운트");
      }
    };
  }, [accessToken]);
}