import os
import json

import redis.asyncio as redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")  # 6379 포트 사용


class RedisPublisher:
    def __init__(self) -> None:
        self.redis = None

    async def connect(self) -> None:
        if self.redis is None:
            print(f"redis 연결 시도 url={REDIS_URL}")
            self.redis = await redis.from_url(
                REDIS_URL,
                decode_responses=True,
            )
            print("redis 연결 완료")

    async def publish_packet(self, building: str, packet: dict) -> None:
        # 기존 숫자 -> 건물 문자열 기반 채널명 구성 수정
        channel = f"parking-status-{building}"
        await self.connect()
        await self.redis.publish(channel, json.dumps(packet))
        # 전송 완료 로그
        print(f"redis publish 완료. channel={channel}")

    async def close(self) -> None:
        if self.redis is not None:
            print("redis 연결 종료")
            await self.redis.close()
            self.redis = None


redis_pub = RedisPublisher()
