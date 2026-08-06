
"use client"

import * as React from "react"
import { Label, Pie, PieChart, Cell } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart"

const chartConfig = {
  value: {
    label: "Bookings",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--chart-3))",
  },
  accepted: {
    label: "Accepted",
    color: "hsl(var(--chart-2))",
  },
  rejected: {
    label: "Rejected",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

interface BookingStatusChartProps {
    data: { status: string; value: number; fill: string }[];
}

export function BookingStatusChart({ data }: BookingStatusChartProps) {
  const totalValue = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0)
  }, [data])

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="status"
          innerRadius={60}
          strokeWidth={2}
        >
           {data.map((entry) => (
            <Cell
              key={entry.status}
              fill={entry.fill}
              className="stroke-background"
            />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {totalValue.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      Total Bookings
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
        <ChartLegend
            content={<ChartLegendContent nameKey="status" />}
            className="-mt-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  )
}
