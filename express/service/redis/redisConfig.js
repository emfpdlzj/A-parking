import Redis from "ioredis";

const redis = new Redis({
    host:"localhost",
    port : 6379
});

redis.on("connect", () => console.log("redis 연결됨"));
redis.on("error", (err) => console.log("redis 연결 에러:", err));

export default redis;