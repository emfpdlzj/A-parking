import express from "express";
import { getParkingSummary } from "../../service/building/BuildingSelcetorService.js";
const app = express();
app.use(express.json());

app.get("/api/parkinglot/summary", (req, res) => {
    try {
        const summary = getParkingSummary();
        res.json(summary);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "서버 오류 발생" });
    }
});

export const buildingSummaryRouter = app;
