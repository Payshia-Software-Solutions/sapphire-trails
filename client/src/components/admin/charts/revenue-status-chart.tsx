'use client';

import * as React from 'react';
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/invoices-data';

interface RevenueStatusChartProps {
  data: {
    status: string;
    label: string;
    amount: number;
    count: number;
    fill: string;
  }[];
  totalRevenue: number;
}

export function RevenueStatusChart({ data, totalRevenue }: RevenueStatusChartProps) {
  const activeData = data.filter((d) => d.amount > 0);

  if (totalRevenue === 0 || activeData.length === 0) {
    return (
      <div className="flex h-[240px] flex-col items-center justify-center text-sm text-muted-foreground">
        <div className="h-16 w-16 rounded-full border-4 border-dashed border-muted flex items-center justify-center mb-2 text-xs font-semibold">
          $0
        </div>
        <p>No invoice revenue recorded yet</p>
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
                  const percent = ((item.amount / totalRevenue) * 100).toFixed(1);
                  return (
                    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
                      <p className="font-semibold text-foreground">{item.label}</p>
                      <p className="font-bold text-emerald-600 mt-0.5">
                        {formatCurrency(item.amount)} ({percent}%)
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {item.count} invoice{item.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={activeData}
              dataKey="amount"
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
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
          <span className="text-base font-bold text-foreground leading-tight truncate max-w-[110px]">
            ${totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(1)}k` : totalRevenue.toFixed(0)}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Invoiced</span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs mt-2">
        {data.map((item) => (
          <div key={item.status} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full inline-block shrink-0"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-muted-foreground font-medium">
              {item.label}: <strong className="text-foreground">{formatCurrency(item.amount)}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
