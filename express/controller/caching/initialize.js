import express from "express";
import { getPolygonsForBuilding } from "../../repository/redis/PolygonRepository.js";
const app=express();
app.get("/api/buildings/:buildingId/slots/polygons",async (req,res) => {
    try{
        const {buildingId}=req.params;
        const polygons= await getPolygonsForBuilding(buildingId);

        if(!polygons) {
            return res.status(404).json({
                message : `${buildingId}의 정보를 찾을 수 없습니다.`,
            });
        }
        return res.json({
            buildingId,
            slots:polygons
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "서버 오류 발생"
        });
    }
})
export default app;