
interface ChartLegendProps {
  comparisonMode: 'none' | 'private-insurance'
  chartType: 'bar' | 'line' | 'pie'
}

export function ChartLegend({ comparisonMode, chartType }: ChartLegendProps) {
  if (comparisonMode !== 'private-insurance' || chartType === 'pie') {
    return null
  }

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-primary rounded"></div>
        <span className="text-sm">Total</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-green-500 rounded"></div>
        <span className="text-sm">Particular</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-blue-500 rounded"></div>
        <span className="text-sm">Convênio</span>
      </div>
    </div>
  )
}
