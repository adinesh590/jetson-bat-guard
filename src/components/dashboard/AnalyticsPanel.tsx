import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  FileText,
  BarChart3,
  Activity,
  Zap,
  Clock,
  Battery
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceMetrics {
  chargeEfficiency: number;
  dischargeEfficiency: number;
  energyLoss: number;
  averageChargeRate: number;
  averageDischargeRate: number;
}

interface UsagePatterns {
  peakUsageTime: string;
  averageDailyConsumption: number;
  totalChargeTime: number;
  totalDischargeTime: number;
  mostCommonState: string;
}

interface CycleAnalysis {
  totalCycles: number;
  averageDepthOfDischarge: number;
  estimatedRemainingCycles: number;
  cycleLifePrediction: string;
  healthTrend: 'improving' | 'stable' | 'degrading';
}

interface AnalyticsPanelProps {
  performanceMetrics: PerformanceMetrics;
  usagePatterns: UsagePatterns;
  cycleAnalysis: CycleAnalysis;
  onGenerateCSV: () => void;
  onGenerateDetailedReport: () => void;
}

export const AnalyticsPanel = ({
  performanceMetrics,
  usagePatterns,
  cycleAnalysis,
  onGenerateCSV,
  onGenerateDetailedReport
}: AnalyticsPanelProps) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-status-good" />;
      case 'degrading':
        return <TrendingDown className="h-4 w-4 text-status-critical" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-status-good';
      case 'degrading':
        return 'text-status-critical';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Charge Efficiency */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Charge Efficiency</span>
                <Badge variant={performanceMetrics.chargeEfficiency > 90 ? "default" : "secondary"}>
                  {performanceMetrics.chargeEfficiency.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={performanceMetrics.chargeEfficiency} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Average: {performanceMetrics.averageChargeRate.toFixed(2)}A
              </div>
            </div>

            {/* Discharge Efficiency */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Discharge Efficiency</span>
                <Badge variant={performanceMetrics.dischargeEfficiency > 90 ? "default" : "secondary"}>
                  {performanceMetrics.dischargeEfficiency.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={performanceMetrics.dischargeEfficiency} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Average: {performanceMetrics.averageDischargeRate.toFixed(2)}A
              </div>
            </div>

            {/* Energy Loss */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Energy Loss</span>
                <Badge variant="outline">
                  {(performanceMetrics.energyLoss / 1000).toFixed(2)}Wh
                </Badge>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-status-warning"
                  style={{ width: `${Math.min(100, (performanceMetrics.energyLoss / 10))}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Total system loss over time
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Usage Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Peak Usage Time</span>
                </div>
                <Badge variant="outline">{usagePatterns.peakUsageTime}</Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Daily Consumption</span>
                </div>
                <span className="text-sm font-medium">
                  {usagePatterns.averageDailyConsumption.toFixed(2)} Wh
                </span>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Charging Time</span>
                  <span className="font-medium">{usagePatterns.totalChargeTime.toFixed(0)} min</span>
                </div>
                <Progress 
                  value={(usagePatterns.totalChargeTime / (usagePatterns.totalChargeTime + usagePatterns.totalDischargeTime)) * 100} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Discharging Time</span>
                  <span className="font-medium">{usagePatterns.totalDischargeTime.toFixed(0)} min</span>
                </div>
                <Progress 
                  value={(usagePatterns.totalDischargeTime / (usagePatterns.totalChargeTime + usagePatterns.totalDischargeTime)) * 100} 
                  className="h-2"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm">Most Common State</span>
                <Badge variant={
                  usagePatterns.mostCommonState === 'CHARGING' ? 'default' : 
                  usagePatterns.mostCommonState === 'DISCHARGING' ? 'secondary' : 'outline'
                }>
                  {usagePatterns.mostCommonState}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cycle Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Battery className="h-4 w-4" />
              Cycle Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Total Cycles</span>
                <div className="text-2xl font-bold">{cycleAnalysis.totalCycles}</div>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Remaining</span>
                <div className="text-2xl font-bold">{cycleAnalysis.estimatedRemainingCycles}</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg. Depth of Discharge</span>
                <Badge variant="outline">
                  {cycleAnalysis.averageDepthOfDischarge.toFixed(1)}%
                </Badge>
              </div>

              <Progress value={cycleAnalysis.averageDepthOfDischarge} className="h-2" />

              <div className="text-xs text-muted-foreground">
                Lower DoD increases battery lifespan
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Estimated Lifespan</span>
                <Badge variant="default">
                  {cycleAnalysis.cycleLifePrediction}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Health Trend</span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(cycleAnalysis.healthTrend)}
                  <span className={cn("text-sm font-medium capitalize", getTrendColor(cycleAnalysis.healthTrend))}>
                    {cycleAnalysis.healthTrend}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Report Generation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={onGenerateCSV}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV Data
            </Button>

            <Button
              variant="outline"
              onClick={onGenerateDetailedReport}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Detailed Report (JSON)
            </Button>
          </div>
          
          <div className="mt-4 p-4 rounded-md bg-muted">
            <p className="text-xs text-muted-foreground">
              Reports include all historical data, performance metrics, usage patterns, and cycle analysis. 
              CSV format is suitable for spreadsheet applications, while JSON format provides complete system details.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
