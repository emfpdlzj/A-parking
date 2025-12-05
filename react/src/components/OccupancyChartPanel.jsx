import React, { useEffect, useState } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid, //배경에 뜨는 격자
    Tooltip, //마우스 hover 시 뜨는 툴팁
    ResponsiveContainer, //화면 크기에 맞춰 차트를 자동으로 조절
} from 'recharts'
import { getAnalysis } from '../api/parking.js' //해당건물 과거 점유율 받아오는 api
import chartImg from '../assets/icons/chartIcon.svg'

// Tooltip 컴포넌트 분리
function OccupancyTooltip({ active, payload }) {
    //active: 사용자가 그래프 위에 마우스를 올려놓은 상태면 true
    //payload: 현재 hover된 데이터 포인트 배열 ->payload[0].payload 안에 객체있음
    if (!active || !payload || !payload.length) return null

    const point = payload[0].payload

    return (
        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-slate-800">
            <div>{point.dateLabel}</div>
            <div>{point.timeLabel}</div>
            <div className="mt-1 text-[#2563eb] font-semibold">
                점유율 {point.percent} %
            </div>
        </div>
    )
}

function OccupancyChartPanel({ buildings }) { //부모에서 buiildings 받아옴
    const [analysisBuilding, setAnalysisBuilding] = useState('paldal') //어느건물 볼지
    const [analysisData, setAnalysisData] = useState([]) //차트 들어가는 data
    const [analysisError, setAnalysisError] = useState('')
    const [analysisRangeText, setAnalysisRangeText] = useState('') //데이터 표시 기간 범위

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const res = await getAnalysis(analysisBuilding)
                const raw = res.status ?? []

                const last24 = raw.slice(-24) //최근 24시 (24개)만 사용함
                const now = new Date() //현재 시각 받아옴

                const chartData =
                    last24.map((item, idx) => {
                        const hoursAgo = last24.length - 1 - idx //각 데이터의 시간 계산
                        const ts = new Date(
                            now.getTime() - hoursAgo * 60 * 60 * 1000, //현재 시간에서 hoursAgo만큼 과거로
                        )
                        const hour = ts.getHours()
                        const year = ts.getFullYear()
                        const month = ts.getMonth() + 1
                        const day = ts.getDate()

                        return {
                            index: idx,
                            hour,
                            dateLabel: `${year}년 ${month}월 ${day}일`,
                            timeLabel: `${String(hour).padStart(2, '0')}:00`, //표시용 데이터
                            percent: Math.round(
                                (item.avg_congestion_rate ?? 0) * 100, //점유율 실수 -> 0~100% 변환
                            ),
                        }
                    }) ?? []

                setAnalysisData(chartData) //차트 들어가는 data

                if (last24.length > 0) { //제일 최근 데이터
                    const startTs = new Date( //제일오래된 데이터
                        now.getTime() -
                        (last24.length - 1) * 60 * 60 * 1000,
                    )
                    const endTs = now

                    const fmt = (d) => {
                        const m = d.getMonth() + 1
                        const day = d.getDate()
                        const h = String(d.getHours()).padStart(2, '0')
                        return `${m}월 ${String(day).padStart(2, '0')}일 ${h}시`
                    }

                    setAnalysisRangeText( //데이터 범위
                        `${fmt(startTs)} ~ ${fmt(endTs)} 기준`,
                    )
                } else {
                    setAnalysisRangeText('')
                }

                setAnalysisError('')
            } catch {
                setAnalysisError('점유율 데이터를 불러올 수 없음')
                setAnalysisRangeText('')
            }
        }

        fetchAnalysis()
    }, [analysisBuilding])

    return (
        <section className="bg-white rounded-2xl shadow-md p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <img
                            src={chartImg}
                            alt="차트 아이콘"
                            className="w-4 h-4 object-contain"
                        />
                        <h3 className="text-xs sm:text-sm font-semibold text-slate-800">
                            과거 점유율
                        </h3>
                    </div>
                    {analysisRangeText && (
                        <p className="mt-0.5 text-[11px] text-slate-500">
                            {analysisRangeText}
                        </p>
                    )}
                </div>
                <select
                    className="border border-slate-300 rounded-md text-xs px-2 py-1 bg-white w-full sm:w-auto sm:text-xs"
                    value={analysisBuilding}
                    onChange={(e) => setAnalysisBuilding(e.target.value)}
                >
                    {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                            {b.name}
                        </option>
                    ))}
                </select>
            </div>

            {analysisError ? (
                <p className="text-xs text-red-500">{analysisError}</p>
            ) : (
                <div className="h-56 sm:h-64 w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={analysisData}
                            margin={{ left: -20 }}
                        >
                            <CartesianGrid
                                stroke="#e5e7eb"
                                strokeDasharray="3 3"
                            />
                            <XAxis
                                dataKey="index"
                                type="number"
                                domain={[
                                    0,
                                    Math.max(
                                        analysisData.length - 1,
                                        0,
                                    ),
                                ]}
                                allowDecimals={false}
                                tickLine={false}
                                tick={{ fontSize: 10 }}
                                ticks={[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].filter(
                                    (v) => v < analysisData.length,
                                )}
                                tickFormatter={(value) => {
                                    const item = analysisData[value]
                                    return item ? item.timeLabel : ''
                                }}
                            />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                domain={[0, 100]}
                                unit="%"
                            />
                            <Tooltip content={<OccupancyTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="percent"
                                stroke="#174ea6"
                                strokeWidth={2}
                                dot={{ r: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    )
}

export default OccupancyChartPanel