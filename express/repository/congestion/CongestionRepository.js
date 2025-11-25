import pool from '../../configuration/db.js';

export async function saveCongestionStatus(buildingId, totalSlots, availableSlots, timeStamp) {
    const sql = `
    Insert into congestion_status 
    (building_id, total_slots, available_slots, time_info) 
    values(?,?,?,?)`;
    await pool.query(sql, [buildingId, totalSlots, availableSlots, timeStamp]);
}

export async function getCongestionStatus(building_id, timeStamp) {
    const hour = new Date(timeStamp).getHours();  // 시간만 추출
    const sql = `
        SELECT building_id,
               AVG(available_slots / total_slots) AS avg_congestion_rate
        FROM congestion_status
        WHERE building_id = ?
          AND HOUR(time_info) = ?
        GROUP BY building_id
    `;
    const [congestionInfo] = await pool.query(sql, [building_id, hour]);
    return congestionInfo;
}