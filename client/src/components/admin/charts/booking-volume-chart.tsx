
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface BookingVolumeChartProps {
  data: { date: string; bookings: number; fullDate?: string }[];
}

export function BookingVolumeChart({ data }: BookingVolumeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
        No booking data available for this timeframe
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.bookings), 5);

  return (
    <div className="h-[240px] w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="bookingBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d97706" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#b45309" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
          <XAxis
            dataKey="date"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            className="text-xs fill-muted-foreground"
          />
          <YAxis
            allowDecimals={false}
            domain={[0, maxVal]}
            tickLine={false}
            axisLine={false}
            className="text-xs fill-muted-foreground"
          />
          <Tooltip
            cursor={{ fill: 'rgba(217, 119, 6, 0.08)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
                    <p className="font-semibold text-foreground">{item.fullDate || item.date}</p>
                    <p className="text-amber-600 font-medium mt-0.5">
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
            fill="url(#bookingBarGradient)"
            radius={[6, 6, 0, 0]}
            maxBarSize={45}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

