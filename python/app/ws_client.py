import os
import json

import redis.asyncio as redis


REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")


class RedisPublisher:
    def __init__(self) -> None:
        self.redis = None

    async def connect(self) -> None:
        if self.redis is None:
            self.redis = await redis.from_url(
                REDIS_URL,
                decode_responses=True,
            )

    async def publish_packet(self, building_id: int, packet: dict) -> None:
        channel = f"parking-status-{building_id}"
        await self.connect()
        await self.redis.publish(channel, json.dumps(packet))

    async def close(self) -> None:
        if self.redis is not None:
            await self.redis.close()
            self.redis = None


redis_pub = RedisPublisher()