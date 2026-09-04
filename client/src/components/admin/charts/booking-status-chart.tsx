'use client';

import * as React from 'react';
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface BookingStatusChartProps {
  data: { status: string; value: number; fill: string }[];
}

export function BookingStatusChart({ data }: BookingStatusChartProps) {
  const totalValue = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  const activeData = data.filter(d => d.value > 0);

  if (totalValue === 0 || activeData.length === 0) {
    return (
      <div className="flex h-[240px] flex-col items-center justify-center text-sm text-muted-foreground">
        <div className="h-16 w-16 rounded-full border-4 border-dashed border-muted flex items-center justify-center mb-2 text-xs font-semibold">
          0
        </div>
        <p>No bookings in this period</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[240px] w-full">
      <div className="relative w-full h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const percent = ((item.value / totalValue) * 100).toFixed(1);
                  return (
                    <div className="rounded-lg border bg-popover px-3 py-1.5 text-xs shadow-md">
                      <p className="font-semibold capitalize text-foreground">{item.status}</p>
                      <p className="text-muted-foreground mt-0.5">
                        {item.value} bookings ({percent}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={activeData}
              dataKey="value"
              nameKey="status"
              innerRadius={52}
              outerRadius={78}
              strokeWidth={3}
              stroke="hsl(var(--background))"
              paddingAngle={3}
            >
              {activeData.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center overlay label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-foreground leading-none">{totalValue}</span>
          <span className="text-[11px] text-muted-foreground font-medium mt-0.5">Total</span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs mt-2">
        {data.map((item) => (
          <div key={item.status} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full inline-block"
              style={{ backgroundColor: item.fill }}
            />
            <span className="capitalize text-muted-foreground font-medium">
              {item.status}: <strong className="text-foreground">{item.value}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
