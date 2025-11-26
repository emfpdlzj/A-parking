import { findMemberByName } from "../../repository/login/LoginRepository.js";
import { saveStatus, getEntryTime} from "../../repository/parkingfee/ParkingFee.js";
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
    const member = await findMemberByName(userName);
    const car_number = member.car_number;
    const entryTimeStr = await getEntryTime(car_number);
    if (!entryTimeStr) {
        throw new Error('입차 기록이 없습니다.');
    }
    // 문자열을 moment로 변환 후 Date 객체로
    const entryTime = moment.tz(entryTimeStr, 'Asia/Seoul').toDate();
    // 현재 시간 KST
    const now = moment.tz('Asia/Seoul').toDate();
    console.log('입차 시간:', entryTime);
    console.log('현재 시간:', now);
    const { fee, durationMinutes } = calculateFee(entryTime, now);
    return {
        carNumber: car_number,
        expect_fee: fee,
        duration_minutes: durationMinutes
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