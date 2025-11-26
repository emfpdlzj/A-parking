import pool from '../../configuration/db.js';

export async function saveCongestionStatus(buildingId, totalSlots, availableSlots, timeStamp) {
    const sql = `
    Insert into congestion_status 
    (building_id, total_slots, available_slots, time_info) 
    values(?,?,?,?)`;
    await pool.query(sql, [buildingId, totalSlots, availableSlots, timeStamp]);
}

export async function getCongestionStatusByHour(buildingId) {
    const sql = `
        SELECT HOUR(time_info) AS hour,
               AVG(available_slots / total_slots) AS avg_congestion_rate
        FROM congestion_status
        WHERE building_id = ?
        GROUP BY HOUR(time_info)
        ORDER BY hour
    `;
    const [rows] = await pool.query(sql, [buildingId]);
    return rows;
}
