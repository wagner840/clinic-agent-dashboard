
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface ChartData {
  name: string
  fullName: string
  total: number
  private: number
  insurance: number
}

interface PieData {
  name: string
  fullName: string
  value: number
  percentage: string
}

interface ChartRendererProps {
  chartType: 'bar' | 'line' | 'pie'
  chartData: ChartData[]
  pieData: PieData[]
  dataType: 'amount' | 'appointments'
  comparisonMode: 'none' | 'private-insurance'
  formatCurrency: (value: number) => string
}

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--primary))",
  },
  private: {
    label: "Particular",
    color: "#10b981",
  },
  insurance: {
    label: "Convênio", 
    color: "#3b82f6",
  },
}

const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export function ChartRenderer({
  chartType,
  chartData,
  pieData,
  dataType,
  comparisonMode,
  formatCurrency
}: ChartRendererProps) {
  if (chartType === 'pie') {
    return (
      <div className="w-full overflow-hidden">
        <ResponsiveContainer width="100%" height={300} minWidth={250}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} (${percentage}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value: number, name: string) => [
                dataType === 'amount' ? formatCurrency(value) : value,
                name
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (chartType === 'line') {
    return (
      <div className="w-full overflow-hidden">
        <ResponsiveContainer width="100%" height={350} minWidth={250}>
          <LineChart data={chartData} margin={{ top: 20, right: 15, left: 10, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="fullName"
              className="text-xs fill-muted-foreground"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 10 }}
            />
            <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value: number) => [
                dataType === 'amount' ? formatCurrency(value) : value,
                dataType === 'amount' ? 'Valor' : 'Consultas'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 3 }}
            />
            {comparisonMode === 'private-insurance' && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="private" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="insurance" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 3 }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden">
      <ResponsiveContainer width="100%" height={350} minWidth={250}>
        <BarChart data={chartData} margin={{ top: 20, right: 15, left: 10, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="fullName"
            className="text-xs fill-muted-foreground"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            tick={{ fontSize: 10 }}
          />
          <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} />
          <ChartTooltip 
            content={<ChartTooltipContent />}
            formatter={(value: number) => [
              dataType === 'amount' ? formatCurrency(value) : value,
              dataType === 'amount' ? 'Valor' : 'Consultas'
            ]}
          />
          <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          {comparisonMode === 'private-insurance' && (
            <>
              <Bar dataKey="private" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="insurance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
