import os
import json

import redis.asyncio as redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379") #6379 포트 사용 


class RedisPublisher:
    def __init__(self) -> None:
        self.redis = None

    async def connect(self) -> None:
        if self.redis is None:
            self.redis = await redis.from_url(
                REDIS_URL,
                decode_responses=True,
            )

    async def publish_packet(self, building: str, packet: dict) -> None:
        # 기존 숫자 -> 건물 문자열 기반 채널명 구성 수정 
        channel = f"parking-status-{building}"
        await self.connect()
        await self.redis.publish(channel, json.dumps(packet))

    async def close(self) -> None:
        if self.redis is not None:
            await self.redis.close()
            self.redis = None


redis_pub = RedisPublisher()