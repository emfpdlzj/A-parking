import { findMemberByName } from "../../repository/login/LoginRepository.js";
import { saveStatus, getEntryTime, markAsPaid, getParkingInfo} from "../../repository/parkingfee/ParkingFee.js";
import moment from "moment-timezone";

const feePolicy = {
    base_minutes: 30,
    base_fee: 2000,
    unit_minutes: 10,
    unit_fee: 500
};

export async function saveParkingStatus(userName) { //입차 하는 경우
    const member= await findMemberByName(userName);
    const car_number=member.car_number;
    await saveStatus(car_number); //입차버튼을 누르는 경우 DB에 저장
}

export async function getParkingFeePreview(userName) {
    let carNumber = null;
    let expect_fee = 0;
    let duration_minutes = 0;
    try {
        const member = await findMemberByName(userName);
        if (!member) {
            throw new Error('회원 정보가 없습니다.');
        }
        carNumber = member.car_number;
        const entryInfo = await getEntryTime(carNumber);
        if (!entryInfo?.entryTime) {
            throw new Error('입차 기록이 없습니다.');
        }
        const entryTime = moment.tz(entryInfo.entryTime, 'Asia/Seoul').toDate();
        const now = moment.tz('Asia/Seoul').toDate();

        const result = calculateFee(entryTime, now);
        expect_fee = result.fee;
        duration_minutes = result.durationMinutes;
    } catch (error) {
        console.warn(error.message);
    }

    return { carNumber, expect_fee, duration_minutes };
}

export async function settleParkingFee(userName) {
    const member = await findMemberByName(userName);
    const car_number = member.car_number;
    const entryInfo = await getEntryTime(car_number);
    if (!entryInfo || !entryInfo.entryTime) {
        throw new Error('입차 기록이 없습니다.');
    }
    const entryTime = moment.tz(entryInfo.entryTime, 'Asia/Seoul').toDate();
    const now = moment.tz('Asia/Seoul').toDate();
    const { fee, durationMinutes } = calculateFee(entryTime, now);
    await markAsPaid(entryInfo.carId, moment(now).format('YYYY-MM-DD HH:mm:ss'), fee);
    const parkingInfo = await getParkingInfo(entryInfo.carId);
    return {
    entry_time: moment(parkingInfo.entry_time).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
    exit_time: moment(parkingInfo.exit_time).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
    final_fee: parkingInfo.final_fee,
    duration_minutes: durationMinutes,
    paid: true
};
}

function calculateFee(entryTime, exitTime) {
    const durationMs=exitTime - entryTime;
    const durationMinutes=Math.ceil(durationMs / (1000 * 60)); //밀리초를 분으로 변환
    let fee=feePolicy.base_fee;

    if(durationMinutes > feePolicy.base_minutes) {
        const extraMinutes=durationMinutes-feePolicy.base_minutes;
        const extraUnits=Math.ceil(extraMinutes / feePolicy.unit_minutes);
        fee += extraUnits * feePolicy.unit_fee;
    }
    return {fee, durationMinutes};
}