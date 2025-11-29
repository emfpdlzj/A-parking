import express from "express";
import { cache } from "../../service/redis/redisSubscriber.js";

const app = express();
app.use(express.json());

app.get("/api/parkinglot/summary", (req, res) => {
    const summary = Object.values(cache).map(buildingId => {
        const slots = Object.values(buildingId.slotMap);
        const total = slots.length;
        const occupied = slots.filter(slot => slot.occupied).length;
        return {
            buildingId: buildingId.buildingId,
            occupied,
            total,
            occupancy_rate: total === 0 ? 0 : +(occupied / total).toFixed(2)  // 숫자 형태로
        };
    });
    res.json(summary);
});

export const buildingSummaryRouter = app;
