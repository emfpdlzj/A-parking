// OccupancyChartPanel.jsx
import React, { useEffect, useState } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { getAnalysis } from '../api/parking'
import chartImg from '../assets/icons/chartIcon.svg'

function OccupancyChartPanel({ buildings }) {
    const [analysisBuilding, setAnalysisBuilding] = useState('paldal')
    const [analysisData, setAnalysisData] = useState([])
    const [analysisError, setAnalysisError] = useState('')
    const [analysisRangeText, setAnalysisRangeText] = useState('')

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const res = await getAnalysis(analysisBuilding)
                const raw = res.status ?? []

                const last24 = raw.slice(-24)
                const now = new Date()

                const chartData =
                    last24.map((item, idx) => {
                        const hoursAgo = last24.length - 1 - idx
                        const ts = new Date(
                            now.getTime() - hoursAgo * 60 * 60 * 1000,
                        )
                        const hour = ts.getHours()
                        const year = ts.getFullYear()
                        const month = ts.getMonth() + 1
                        const day = ts.getDate()

                        return {
                            index: idx,
                            hour,
                            dateLabel: `${year}년 ${month}월 ${day}일`,
                            timeLabel: `${String(hour).padStart(2, '0')}:00`,
                            percent: Math.round(item.avg_congestion_rate * 100),
                        }
                    }) ?? []

                setAnalysisData(chartData)
                if (last24.length > 0) {
                    const startTs = new Date(
                        now.getTime() - (last24.length - 1) * 60 * 60 * 1000,
                    )
                    const endTs = now

                    const fmt = (d) => {
                        const y = d.getFullYear()
                        const m = d.getMonth() + 1
                        const day = d.getDate()
                        const h = String(d.getHours()).padStart(2, '0')
                        return `${m}월 ${String(day).padStart(2, '0')}일 ${h}시`
                    }

                    setAnalysisRangeText(
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
        <section className="bg-white rounded-2xl shadow-md p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <img
                            src={chartImg}
                            alt="차트 아이콘"
                            className="w-4 h-4 object-contain"
                        />
                        <h3 className="text-sm font-semibold text-slate-800">
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
                    className="border border-slate-300 rounded-md text-xs px-2 py-1 bg-white"
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
                <div className="h-64">
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
                                    Math.max(analysisData.length - 1, 0),
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
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (!active || !payload || !payload.length)
                                        return null
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
                                }}
                            />
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