"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/dataviz/chart"

export interface ChartMostActivityItem {
  source: string
  label: string
  percentage: number
  color: string
}

export interface ChartMostActivityProps {
  data: ChartMostActivityItem[]
  title?: string
}

export function ChartMostActivity({
  data,
  title = "Maior Atividade",
}: ChartMostActivityProps) {
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {}
    data.forEach((item) => {
      config[item.source] = {
        label: item.label,
        color: item.color,
      }
    })
    return config
  }, [data])

  const chartData = React.useMemo(
    () =>
      data.map((item) => ({
        source: item.source,
        leads: item.percentage,
        fill: `var(--color-${item.source})`,
      })),
    [data]
  )

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <span className="text-muted-foreground text-sm">Sem dados de atividade</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="leads"
              nameKey="source"
              innerRadius={60}
              strokeWidth={5}
            />
          </PieChart>
        </ChartContainer>
        <div className="flex justify-around">
          {data.map((item) => (
            <div className="flex flex-col" key={item.source}>
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="block size-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div>{item.label}</div>
              </div>
              <div className="text-center text-xl font-semibold">{item.percentage}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
