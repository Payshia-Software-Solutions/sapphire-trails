
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  bookings: {
    label: 'Bookings',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

interface BookingVolumeChartProps {
  data: { date: string; bookings: number }[];
}

export function BookingVolumeChart({ data }: BookingVolumeChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis allowDecimals={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
        </BarChart>
    </ChartContainer>
  );
}
