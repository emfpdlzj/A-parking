//주차요금관련 API 호출 + 상태/로직을 훅 분리
//로직 재활용 하기도 좋고 코드가 너무 길어지는거 방지
import { useEffect, useState } from 'react'
import {
    enterParking,
    previewParkingFee,
    settleParkingFee,
} from '../api/parking.js'

// 분 -> @시간 @ 분 형태의 문자열로 바꿈
const formatDuration = (minutes) => {
    if (minutes == null) return '-'
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0 && m > 0) return `${h}시간 ${m}분`
    if (h > 0) return `${h}시간`
    if (m > 0) return `${m}분`
    return '0분'
}

const IDLE_GUIDE_TEXT = //반복되는 기본 문구 상수 처리함
    '현재 진행 중인 주차가 없습니다.\n"입차하기" 버튼을 눌러 주차를 시작해 주세요.'

// preview/settle 응답에 활성화 된게 있는지
const hasActiveSession = (data) => { //새로고침, 입차할 때 입차중인지 판단
    if (!data) return false
    const minutes = data.duration_minutes ?? 0
    const fee = typeof data.expect_fee === 'number' ? data.expect_fee : 0
    return minutes > 0 || fee > 0 //minutes > 0 || fee > 0면 입차중 판단
}

// 안내 텍스트
const buildActiveStatusText = (data) => {
    const minutes = data?.duration_minutes ?? 0
    const fee = data?.expect_fee ?? 0
    return (
        `현재까지 예상 요금은 ${fee.toLocaleString()}원 입니다.\n` +
        `이용 시간 : ${formatDuration(minutes)}`
    )
}

// 주차/요금 관련 상태, API 로직 : ParkingUsagePanel에서 분리함
export function useParkingUsage(profileCarNumber) {
    const [parkingStage, setParkingStage] = useState('idle') //현재 주차상태
    // 'idle' | 'entered' | 'readyToPay'
    const [parkingInfo, setParkingInfo] = useState(null)     // 요금관련 정보
    const [parkingError, setParkingError] = useState('')
    const [parkingLoading, setParkingLoading] = useState(false)//어떤 API가 동작 중인지 표시 ->버튼렌더링에 사용
    const [lastUpdated, setLastUpdated] = useState(null)//마지막으로 요금/상태가 갱신된 시각 관리
    const [statusText, setStatusText] = useState('주차 정보 없음') //카드 아래쪽에 나오는 안내 텍스트

    const markUpdatedNow = () => setLastUpdated(new Date())//lastUpdated를 세팅할 때 날짜 관리

    // 초기 상태 조회, 1회 실행
    useEffect(() => {
        const initParkingState = async () => {
            setParkingLoading(true)
            setParkingError('')
            try {
                const data = await previewParkingFee() //서버에 현재 상태 물어봄
                setParkingInfo(data)
                markUpdatedNow()

                if (hasActiveSession(data)) { //이미 입차됐다면 입차처리
                    setParkingStage('entered')
                    setStatusText(buildActiveStatusText(data))
                } else {
                    setParkingStage('idle') //아무 것도 없으면->기본안내
                    setStatusText(IDLE_GUIDE_TEXT)
                }
            } catch (error) {
                const status = error?.response?.status
                const msg = error?.response?.data?.message

                if (status === 400 && msg && msg.includes('활성')) {//400인데 활성인 에러는 그냥 idel로 처리했음.
                    setParkingStage('idle')
                    setParkingInfo(null)
                    setStatusText(IDLE_GUIDE_TEXT)
                } else { //그 외 에러는 진짜 오류처리함
                    console.error('초기 주차 상태 조회 실패', error)
                    setParkingError(
                        '현재 주차 정보를 불러오는 중 오류가 발생했습니다.',
                    )
                }
            } finally {
                setParkingLoading(false)
            }
        }

        initParkingState()
    }, [])

    // 1) 입차하기
    const handleEnter = async () => {
        setParkingLoading(true)
        setParkingError('')

        try {
            await enterParking()

            setParkingStage('entered') //입차처리
            setParkingInfo(null) //입차 ->요금 아직없음
            markUpdatedNow()

            setStatusText( //안내문구 표시
                `차량 번호: ${profileCarNumber}\n입차 완료!\n"새로고침" 버튼으로 현재까지의 요금을 확인할 수 있습니다.`,
            )
        } catch (error) {
            console.error('enterParking 오류', error) //실패시 서버에서 받은 오류메시지 씀
            const msg =
                error?.response?.data?.message ||
                '입차 처리 중 오류가 발생했습니다.'
            setParkingError(msg)
            setStatusText('입차 처리에 실패했습니다.')
            setParkingStage('idle') //실패이므로 idle처리
        } finally {
            setParkingLoading(false)
        }
    }

    // 2) 예상 요금 확인 (새로고침)
    const handlePreview = async () => {
        setParkingLoading(true)
        setParkingError('')

        try {
            const data = await previewParkingFee() // 서버 기준 최신 요금/시간으로 갱신
            setParkingInfo(data)
            markUpdatedNow()

            const active = hasActiveSession(data)

            if (active && parkingStage === 'idle') { //프론트랑 서버정보가 다르면 서버에 맞춤
                setParkingStage('entered')
            }
            if (!active) { //서버에도 정보 없으면 idle
                setParkingStage('idle')
            }

            setStatusText(
                active ? buildActiveStatusText(data) : IDLE_GUIDE_TEXT,
            )
        } catch (error) {
            console.error('previewParkingFee 오류', error)
            const msg =
                error?.response?.data?.message ||
                '예상 요금 조회 중 오류가 발생했습니다.'
            setParkingError(msg)
        } finally {
            setParkingLoading(false)
        }
    }

    // 3) 출차하기
    const handleExit = () => { //UI 상에서 결제 준비 단계로 진입. 서버에는 결제하기에서 처리
        if (parkingStage !== 'entered' && parkingStage !== 'readyToPay') {
            setStatusText('아직 입차가 되지 않았습니다!') //입차상태가 아니면 안내문구만 변경
            return
        }

        setParkingStage('readyToPay')
        markUpdatedNow()
        setStatusText(
            '출차 처리 완료!\n"결제하기" 버튼을 눌러 최종 정산을 진행해 주세요.',
        )
    }

    // 4) 최종 정산 / 결제하기
    const handleSettle = async () => {
        setParkingLoading(true)
        setParkingError('')

        try {
            const data = await settleParkingFee() //최종 요금 받아옴

            const enriched = {
                ...data,
                expect_fee: 0,
            }

            setParkingInfo(enriched)
            markUpdatedNow()

            setStatusText(
                `결제가 완료되었습니다.\n총 ${formatDuration(
                    data.duration_minutes,
                )} 이용, 최종 요금 ${data.final_fee.toLocaleString()}원이 결제되었습니다.`,
            )

            setParkingStage('idle')
        } catch (error) {
            console.error('settleParkingFee 오류', error)

            const msg = error?.response?.data?.message

            if (typeof msg === 'string' && msg.includes('입차 기록이 없습니다')) {
                // 입차 기록이 없으면 그 시간 기준으로 입차 처리
                //UI꼬임 방지 ㅜㅜ
                try {
                    await enterParking()
                    const now = new Date()

                    setParkingStage('entered')
                    setParkingInfo(null)
                    setLastUpdated(now)
                    setStatusText(
                        `기존 입차 기록이 없어,\n` +
                        `${now.toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })} 기준으로 새로 입차 처리되었습니다.\n` +
                        `"새로고침" 버튼으로 현재까지의 요금을 확인할 수 있습니다.`,
                    )
                    setParkingError('')
                    return
                } catch (enterErr) {
                    console.error('자동 입차 처리 중 오류', enterErr)
                    const msg2 =
                        enterErr?.response?.data?.message ||
                        '입차 기록이 없어 자동 입차 처리도 실패했습니다.'
                    setParkingError(msg2)
                    setStatusText(
                        '입차 기록이 없어 결제를 진행할 수 없습니다.',
                    )
                }
            } else {
                const fallback =
                    msg || '정산 처리 중 오류가 발생했습니다.'
                setParkingError(fallback)
            }
        } finally {
            setParkingLoading(false)
        }
    }

    const currentStatusText =
        parkingStage === 'idle'
            ? '입차 전'
            : parkingStage === 'entered'
                ? '주차 중'
                : '결제 대기'

    const durationMinutes =
        parkingStage === 'idle' ? 0 : parkingInfo?.duration_minutes ?? 0
    const durationText =
        parkingStage === 'idle' ? '입차 전' : formatDuration(durationMinutes)

    const currentFee = (() => {
        if (!parkingInfo) return 0
        if (typeof parkingInfo.expect_fee === 'number') {
            return parkingInfo.expect_fee
        }
        if (typeof parkingInfo.final_fee === 'number') {
            return parkingInfo.final_fee
        }
        return 0
    })()

    const lastUpdatedLabel = lastUpdated
        ? lastUpdated.toLocaleString('ko-KR', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : '-'

    return {
        // 상태
        parkingStage,
        parkingInfo,
        parkingError,
        parkingLoading,
        lastUpdated,
        statusText,

        // 파생 데이터
        currentStatusText,
        durationText,
        currentFee,
        lastUpdatedLabel,

        // 액션
        handleEnter,
        handlePreview,
        handleExit,
        handleSettle,
    }
}