import { PieChart, Pie, Cell } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'

interface GaugeChartProps {
  score: number
}

export function GaugeChart({ score }: GaugeChartProps) {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ]

  const getColor = (s: number) => {
    if (s >= 80) return 'hsl(var(--secondary))' // Green (Conforme)
    if (s >= 50) return 'hsl(var(--accent))' // Amber (Atenção)
    return 'hsl(var(--destructive))' // Red (Crítico)
  }

  const chartConfig = {
    score: {
      label: 'Adequação',
      color: 'hsl(var(--primary))',
    },
  }

  return (
    <div className="relative w-full max-w-[300px] mx-auto flex flex-col items-center justify-center pt-6">
      <ChartContainer config={chartConfig} className="w-full aspect-[2/1] relative">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius="75%"
            outerRadius="100%"
            dataKey="value"
            stroke="none"
            isAnimationActive={true}
          >
            <Cell key="cell-0" fill={getColor(score)} />
            <Cell key="cell-1" fill="hsl(var(--muted))" />
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="absolute bottom-0 left-0 w-full text-center">
        <span
          className="text-5xl font-extrabold tracking-tighter drop-shadow-sm"
          style={{ color: getColor(score) }}
        >
          {score}%
        </span>
      </div>
    </div>
  )
}
