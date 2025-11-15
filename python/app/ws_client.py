# app/ws_client.py
import os
import json
import aioredis


REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")


class RedisPublisher:
    # Redis 퍼블리셔 클래스 정의
    def __init__(self) -> None:
        self.redis = None

    async def connect(self) -> None:
        # 지연 연결 방식 사용
        if self.redis is None:
            self.redis = await aioredis.from_url(
                REDIS_URL,
                decode_responses=True,
            )

    async def publish_packet(self, building_id: int, packet: dict) -> None:
        # 채널명 패턴 parking-status-{buildingId} 사용
        channel = f"parking-status-{building_id}"
        await self.connect()
        await self.redis.publish(channel, json.dumps(packet))

    async def close(self) -> None:
        # 연결 종료 함수 정의
        if self.redis is not None:
            await self.redis.close()
            self.redis = None


redis_pub = RedisPublisher()
