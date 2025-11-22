import pool from '../../configuration/db.js';

export async function findMemberByID(member_id) {
    const query = 'SELECT * FROM members WHERE member_id =?';
    const [rows] = await pool.query(query, [member_id]);
    return rows[0];
}

export async function findMemberByName(name) {
    const query ='SELECT * FROM members WHERE name=?';
    const [rows] = await pool.query(query, [name]);
    return rows[0];
}