import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth'; // 사용자님의 인증 훅 가정

// 웹소켓 서버 포트: 8081
const WS_PORT = 8081; 
const WEBSOCKET_URL = `ws://localhost:${WS_PORT}`; 

export default function WebSocketClientComponent() {
  const { accessToken } = useAuth(); // 로그인 후 저장된 토큰 가져오기
  const ws = useRef(null); // WebSocket 인스턴스 참조
  const [isConnected, setIsConnected] = useState(false);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  
  // 메시지 전송 함수
  const sendMessage = useCallback(() => {
    if (ws.current && isConnected) {
      ws.current.send(inputMessage);
      setInputMessage(''); // 입력창 초기화
    } else {
      console.warn('웹소켓이 연결되지 않았거나 닫혔습니다.');
    }
  }, [isConnected, inputMessage]);

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
      console.log('서버로부터 메시지 수신:', event.data);
      setReceivedMessages(prev => [...prev, event.data]);
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
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc' }}>
      <h2>WebSocket 클라이언트</h2>
      <p>상태: <strong style={{ color: isConnected ? 'green' : 'red' }}>{isConnected ? '연결됨' : '연결 끊김'}</strong></p>
      
      {/* 메시지 전송 UI */}
      <div>
        <input 
          type="text" 
          value={inputMessage} 
          onChange={(e) => setInputMessage(e.target.value)} 
          placeholder="메시지를 입력하세요"
          disabled={!isConnected}
          style={{ marginRight: '10px' }}
        />
        <button onClick={sendMessage} disabled={!isConnected || !inputMessage.trim()}>
          메시지 전송
        </button>
      </div>

      <h4 style={{ marginTop: '20px' }}>수신 메시지 ({receivedMessages.length}개)</h4>
      <div style={{ maxHeight: '200px', overflowY: 'scroll', border: '1px solid #eee', padding: '10px' }}>
        {receivedMessages.map((msg, index) => (
          <p key={index} style={{ margin: '3px 0', fontSize: '14px' }}>
            [{new Date().toLocaleTimeString()}] {msg}
          </p>
        ))}
      </div>
    </div>
  );
}