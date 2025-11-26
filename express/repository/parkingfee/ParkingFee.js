import pool from '../../configuration/db.js';
import moment from 'moment-timezone';

export async function findActiveParking(car_number) {
  const sql = `
    SELECT * FROM parking_status
    WHERE car_number = ? AND paid = false
  `;
  const [rows] = await pool.query(sql, [car_number]);
  return rows[0];
}

export async function saveStatus(car_number) {
    const existing = await findActiveParking(car_number);
    if(existing) {
        throw new Error('이미 입차된 상태입니다.');
    }
    const nowKST = moment.tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
    const sql = `
        INSERT INTO parking_status(car_number, entry_time, paid)
        VALUES (?, ?, false)
    `;
    await pool.query(sql, [car_number, nowKST]);
}

export async function getEntryTime(car_number) {
    const sql = `
        SELECT entry_time, car_id
        FROM parking_status
        WHERE car_number = ? AND paid = false
    `;
    const [rows] = await pool.query(sql, [car_number]);
    if (!rows[0]) return null;
    // entry_time은 Date 객체로 반환됨
    const kstTime = moment(rows[0].entry_time)
        .tz('Asia/Seoul')
        .format('YYYY-MM-DD HH:mm:ss');

    return {
        carId: rows[0].car_id,
        entryTime: kstTime
    };
}

export async function markAsPaid(car_id, exitTime, fee) {
    const sql= `
        update parking_status
        set paid=true, exit_time=?, final_fee=?
        where car_id=?
    `;
    await pool.query(sql, [exitTime, fee, car_id]);
}

export async function getParkingInfo(car_id) {
    const sql =`
        select entry_time, exit_time, final_fee
        from parking_status
        where car_id=?
    `;
    const [rows] = await pool.query(sql, [car_id]);
    return rows[0];
}