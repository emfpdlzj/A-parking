import WebSocket, { WebSocketServer } from "ws";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getLatestParkingStatus } from "../../repository/redis/RedisRepository.js";

dotenv.config();

const wss = new WebSocketServer({ port: 8081 }); //WebSocket 연결을 기다리는 서버를 띄움

wss.on("connection", async (ws,req) => { //클라이언트가 연결 시 실행
    const url=new URL(req.url, `http://${req.headers.host}`);
    const token = req.headers['sec-websocket-protocol'];
    const building=url.pathname.split("/")[1];

    if (!token) {
        ws.close(4001, "토큰이 필요합니다.");
        return;
    }
    try {
        const user=jwt.verify(token, process.env.JWT_SECRET);
        ws.user=user;
        ws.building=building;

        const parkingStatus=await getLatestParkingStatus(building);
        ws.send(JSON.stringify({
            type: "init",
            data:parkingStatus,
            message: `${building} 웹소켓 연결 성공`
            }));
        } catch (err) {
            if(err.name === "TokenExpiredError") {
             ws.close(4002, "토큰이 만료되었습니다.");
            } else {
                ws.close(4003, "서버 내부 오류.");
            }
        }
});

export function broadcast(building, message) { //모든 연결된 클라이언트에게 메시지를 보냄
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.building === building) {
            client.send(JSON.stringify({
                type: "update",
                data: message,
            }));
        }
    });
}

export default wss;