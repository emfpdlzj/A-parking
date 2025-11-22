import pool from '../../configuration/db.js';

export async function getPolygonsForBuilding(buildingId) { // cctv에 대한 정보를 저장한 설정 정보 받아옴
    const query = "select slot_number, polygon from slot_config where building_id=?";
    try{
        const [rows] = await pool.query(query,[buildingId]);
        if(!rows.length) return null;

        const slots=rows.map(row => ({
            id:row.slot_number,
            polygon: typeof row.polygon === "string" ? JSON.parse(row.polygon) : row.polygon
        }));
        return slots;
    } catch (err) {
        console.error("DB 조회 실패: ", err);
        throw err;
    }
}