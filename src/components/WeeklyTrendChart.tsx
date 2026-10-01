import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Area,
} from 'recharts';
import { TrendingUp, Award, Calendar, CheckCircle2 } from 'lucide-react';
import { StudySession } from '../types/study';
import { getDateOffsetString } from '../utils/storage';

interface WeeklyTrendChartProps {
  sessions: StudySession[];
  dailyGoalMinutes: number;
}

interface TrendDayData {
  dateStr: string;
  dayLabel: string;
  fullDateLabel: string;
  minutes: number;
  hours: number;
  sessionsCount: number;
  goalMet: boolean;
  isToday: boolean;
}

export const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({
  sessions,
  dailyGoalMinutes,
}) => {
  const [showGoalLine, setShowGoalLine] = useState(true);
  const [unit, setUnit] = useState<'minutes' | 'hours'>('minutes');

  // Compute 7 days of historical study data (last 6 days + today)
  const chartData: TrendDayData[] = Array.from({ length: 7 }, (_, i) => {
    const offset = -(6 - i);
    const dateStr = getDateOffsetString(offset);
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);

    const dayLabel =
      offset === 0
        ? 'Today'
        : dateObj.toLocaleDateString('en-US', { weekday: 'short' });

    const fullDateLabel = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    const daySessions = sessions.filter((s) => s.dateStr === dateStr);
    const dayMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    return {
      dateStr,
      dayLabel,
      fullDateLabel,
      minutes: dayMinutes,
      hours: Number((dayMinutes / 60).toFixed(1)),
      sessionsCount: daySessions.length,
      goalMet: dayMinutes >= dailyGoalMinutes,
      isToday: offset === 0,
    };
  });

  const totalWeekMinutes = chartData.reduce((acc, d) => acc + d.minutes, 0);
  const avgDailyMinutes = Math.round(totalWeekMinutes / 7);
  const daysGoalMet = chartData.filter((d) => d.goalMet).length;

  const bestDay = [...chartData].sort((a, b) => b.minutes - a.minutes)[0];

  const maxMinutes = Math.max(
    dailyGoalMinutes,
    ...chartData.map((d) => d.minutes),
    60
  );

  // Y-axis max with comfortable padding
  const yAxisMax = Math.ceil((maxMinutes + 15) / 30) * 30;

  return (
    <section className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-xs">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Weekly Study Time Trend
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            7-day rolling progression and daily goal consistency
          </p>
        </div>

        {/* Interactive Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Unit Toggle */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setUnit('minutes')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                unit === 'minutes'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Min
            </button>
            <button
              type="button"
              onClick={() => setUnit('hours')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                unit === 'hours'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hours
            </button>
          </div>

          {/* Target Line Toggle */}
          <button
            type="button"
            onClick={() => setShowGoalLine(!showGoalLine)}
            className={`min-h-[32px] px-3 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              showGoalLine
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                showGoalLine ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            />
            Target: {dailyGoalMinutes}m
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-100 text-xs">
        <div className="space-y-0.5">
          <p className="text-slate-500 font-medium">7-Day Total</p>
          <p className="text-lg font-bold font-mono tabular-nums text-slate-900">
            {Math.floor(totalWeekMinutes / 60)}h {totalWeekMinutes % 60}m
          </p>
        </div>

        <div className="space-y-0.5">
          <p className="text-slate-500 font-medium">Daily Average</p>
          <p className="text-lg font-bold font-mono tabular-nums text-slate-900">
            {avgDailyMinutes} min/day
          </p>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Peak Focus</span>
          </div>
          <p className="text-lg font-bold font-mono tabular-nums text-slate-900">
            {bestDay ? `${bestDay.dayLabel} (${bestDay.minutes}m)` : '0m'}
          </p>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Target Reached</span>
          </div>
          <p className="text-lg font-bold font-mono tabular-nums text-slate-900">
            {daysGoalMet} / 7 days
          </p>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="pt-6 pb-2 w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 16, right: 16, left: -16, bottom: 4 }}
          >
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E2E8F0"
              vertical={false}
            />

            <XAxis
              dataKey="dayLabel"
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1', strokeWidth: 1 }}
              tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
              dy={8}
            />

            <YAxis
              domain={[0, unit === 'hours' ? Math.ceil(yAxisMax / 60) : yAxisMax]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              unit={unit === 'hours' ? 'h' : 'm'}
              dx={-4}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload as TrendDayData;
                const diffFromGoal = data.minutes - dailyGoalMinutes;

                return (
                  <div className="bg-slate-900 text-white rounded-xl shadow-xl px-3.5 py-2.5 text-xs space-y-1.5 border border-slate-800">
                    <div className="flex items-center justify-between gap-4 font-semibold border-b border-slate-700/80 pb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        {data.dayLabel} ({data.fullDateLabel})
                      </span>
                      {data.isToday && (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-300">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-slate-400">Study Time:</span>
                      <span className="font-mono font-bold text-white text-sm">
                        {data.minutes} min ({data.hours}h)
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-400">Sessions:</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {data.sessionsCount} {data.sessionsCount === 1 ? 'session' : 'sessions'}
                      </span>
                    </div>

                    <div className="pt-1 border-t border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-slate-400">Target vs Actual:</span>
                      <span
                        className={`font-mono font-semibold ${
                          diffFromGoal >= 0 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {diffFromGoal >= 0
                          ? `+${diffFromGoal}m over target`
                          : `${Math.abs(diffFromGoal)}m below target`}
                      </span>
                    </div>
                  </div>
                );
              }}
            />

            {showGoalLine && (
              <ReferenceLine
                y={unit === 'hours' ? Number((dailyGoalMinutes / 60).toFixed(1)) : dailyGoalMinutes}
                stroke="#6366F1"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Goal ${dailyGoalMinutes}m`,
                  position: 'insideTopRight',
                  fill: '#6366F1',
                  fontSize: 11,
                  fontWeight: 600,
                  offset: 8,
                }}
              />
            )}

            {/* Subtle filled area beneath the trend line */}
            <Area
              type="monotone"
              dataKey={unit === 'hours' ? 'hours' : 'minutes'}
              stroke="none"
              fill="url(#trendGradient)"
            />

            {/* Primary Study Trend Line */}
            <Line
              type="monotone"
              dataKey={unit === 'hours' ? 'hours' : 'minutes'}
              stroke="#2563EB"
              strokeWidth={3}
              dot={{
                r: 4.5,
                fill: '#2563EB',
                stroke: '#FFFFFF',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6.5,
                fill: '#1D4ED8',
                stroke: '#FFFFFF',
                strokeWidth: 2.5,
              }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
