
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface TourPopularityChartProps {
  data: { name: string; bookings: number }[];
}

export function TourPopularityChart({ data }: TourPopularityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
        No tour booking data available yet
      </div>
    );
  }

  // Sort descending and take top 6
  const sortedData = [...data].sort((a, b) => b.bookings - a.bookings).slice(0, 6);

  return (
    <div className="h-[240px] w-full pt-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ left: 5, right: 30, top: 5, bottom: 5 }}
        >
          <defs>
            <linearGradient id="tourBarGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284c7" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.95} />
            </linearGradient>
          </defs>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/40" />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            width={120}
            interval={0}
            tick={({ x, y, payload }) => {
              const text = payload.value.length > 18 ? `${payload.value.slice(0, 16)}...` : payload.value;
              return (
                <text
                  x={x}
                  y={y}
                  dy={4}
                  textAnchor="end"
                  className="fill-muted-foreground text-[11px] font-medium"
                >
                  {text}
                </text>
              );
            }}
          />
          <XAxis type="number" hide allowDecimals={false} />
          <Tooltip
            cursor={{ fill: 'rgba(2, 132, 199, 0.08)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-popover px-3 py-1.5 text-xs shadow-md">
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-sky-600 font-medium mt-0.5">
                      Bookings: <span className="font-bold text-foreground">{item.bookings}</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="bookings"
            fill="url(#tourBarGradient)"
            radius={[0, 6, 6, 0]}
            barSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

