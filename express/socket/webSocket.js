import WebSocket, { WebSocketServer } from "ws";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const wss = new WebSocketServer({ port: 8081 });

wss.on("connection", (ws,req) => {
    const url=new URL(req.url, `http://${req.headers.host}`);
    const token=url.searchParams.get("token");

    if (!token) {
        ws.close(4001, "토큰이 필요합니다.");
        return;
    }
    try {
        const user=jwt.verify(token, process.env.JWT_SECRET);
        ws.user=user;
        ws.send("웹소켓 연결 성공");

    ws.on('message', (msg) => {
        console.log(`사용자 ${ws.user.name}로부터 메시지: ${msg}`);
    });
} catch (err) {
    ws.close(4002, "토큰이 유효하지 않습니다.");
}
});

export function broadcast(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
        console.log(`브로드캐스트 메시지: ${message}`);
    });
}

export default wss;