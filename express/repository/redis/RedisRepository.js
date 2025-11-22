import pool from '../../configuration/db.js';

export async function getLatestParkingStatus(buildingId) {
    const query = "select slot_number, occupied from slot_status where building_id=?";
    try{
        const [rows] = await pool.query(query,[buildingId]);
        if(!rows.length) return { buildingId, slots: [] };
        const slots = rows.map(row => ({ slot: row.slot_number, occupied: row.occupied }));
        return {
            buildingId,
            slots
        };
    } catch (err){
        console.error("DB 조회 실패: ",err);
        throw err;
    }
}

export async function saveParkingStatusDB(buildingId, slotMap) {
    const query = `
        UPDATE slot_status
        SET occupied = ?
        WHERE building_id = ? AND slot_number = ?
    `;
    try {
        for(const slot of Object.values(slotMap)) {
            const {id,occupied} = slot;
            await pool.query(query,[occupied,buildingId,id])
        }
        console.log(`${buildingId} 주차장 상태 DB 업데이트 완료`);
    } catch (err) {
        console.log(`${buildingId} 주차장 상태 DB 업데이트 살퍄 ` ,err);
        throw err;
    }
};