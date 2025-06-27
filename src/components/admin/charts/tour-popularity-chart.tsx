
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  bookings: {
    label: 'Bookings',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

interface TourPopularityChartProps {
  data: { name: string; bookings: number }[];
}

export function TourPopularityChart({ data }: TourPopularityChartProps) {
  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
        <BarChart accessibilityLayer data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
            <CartesianGrid horizontal={false} />
            <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={80}
            />
            <XAxis type="number" dataKey="bookings" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="bookings" fill="var(--color-bookings)" radius={5} >
                 <LabelList
                    dataKey="bookings"
                    position="right"
                    offset={8}
                    className="fill-foreground text-sm"
                    formatter={(value: number) => value.toLocaleString()}
                />
            </Bar>
        </BarChart>
    </ChartContainer>
  );
}
