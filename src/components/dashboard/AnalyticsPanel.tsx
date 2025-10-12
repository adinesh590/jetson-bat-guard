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
  Battery,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Lightbulb,
  Target,
  AlertCircle
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

interface BatteryStatus {
  type: string;
  nominalVoltage: number;
  capacity: number;
  cycleCount: number;
  health: number;
  remainingCapacity: number;
  internalResistance: number;
  ageMonths: number;
  degradation: number;
}

interface AnalyticsPanelProps {
  performanceMetrics: PerformanceMetrics;
  usagePatterns: UsagePatterns;
  cycleAnalysis: CycleAnalysis;
  batteryStatus: BatteryStatus;
  onGenerateCSV: () => void;
  onGenerateDetailedReport: () => void;
}

export const AnalyticsPanel = ({
  performanceMetrics,
  usagePatterns,
  cycleAnalysis,
  batteryStatus,
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

  // Generate recommendations based on data
  const getRecommendations = () => {
    const recommendations = [];
    
    if (batteryStatus.degradation > 15) {
      recommendations.push({
        type: 'warning',
        title: 'High Battery Degradation',
        message: 'Consider battery replacement soon. Current degradation exceeds 15%.',
        action: 'Schedule maintenance'
      });
    }
    
    if (cycleAnalysis.averageDepthOfDischarge > 80) {
      recommendations.push({
        type: 'info',
        title: 'Deep Discharge Optimization',
        message: 'Reduce average depth of discharge to extend battery life. Try to keep DoD below 80%.',
        action: 'Adjust usage patterns'
      });
    }
    
    if (performanceMetrics.chargeEfficiency < 85) {
      recommendations.push({
        type: 'warning',
        title: 'Low Charge Efficiency',
        message: 'Charging efficiency is below optimal range. Check charging system.',
        action: 'Run diagnostics'
      });
    }
    
    if (batteryStatus.internalResistance > 150) {
      recommendations.push({
        type: 'critical',
        title: 'High Internal Resistance',
        message: 'Battery internal resistance is elevated, indicating significant wear.',
        action: 'Replace battery'
      });
    }
    
    if (usagePatterns.averageDailyConsumption > 50) {
      recommendations.push({
        type: 'info',
        title: 'High Energy Consumption',
        message: 'Daily energy usage is high. Consider load balancing or capacity upgrade.',
        action: 'Review load profile'
      });
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        title: 'All Systems Optimal',
        message: 'Battery is operating within optimal parameters. Continue current maintenance schedule.',
        action: 'Continue monitoring'
      });
    }
    
    return recommendations;
  };

  const recommendations = getRecommendations();

  // Calculate risk score (0-100)
  const calculateRiskScore = () => {
    let risk = 0;
    
    if (batteryStatus.degradation > 20) risk += 30;
    else if (batteryStatus.degradation > 10) risk += 15;
    
    if (batteryStatus.internalResistance > 150) risk += 25;
    else if (batteryStatus.internalResistance > 100) risk += 10;
    
    if (performanceMetrics.chargeEfficiency < 85) risk += 20;
    else if (performanceMetrics.chargeEfficiency < 90) risk += 10;
    
    if (cycleAnalysis.healthTrend === 'degrading') risk += 15;
    
    if (cycleAnalysis.averageDepthOfDischarge > 80) risk += 10;
    
    return Math.min(100, risk);
  };

  const riskScore = calculateRiskScore();

  return (
    <div className="space-y-6">
      {/* Battery Health Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Battery Health Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Remaining Capacity</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{batteryStatus.remainingCapacity}</span>
                <span className="text-sm text-muted-foreground">mAh</span>
              </div>
              <div className="text-xs text-muted-foreground">
                of {batteryStatus.capacity}mAh original
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Internal Resistance</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{batteryStatus.internalResistance}</span>
                <span className="text-sm text-muted-foreground">mΩ</span>
              </div>
              <Badge variant={
                batteryStatus.internalResistance < 100 ? "default" : 
                batteryStatus.internalResistance < 150 ? "secondary" : "destructive"
              }>
                {batteryStatus.internalResistance < 100 ? "Good" : 
                 batteryStatus.internalResistance < 150 ? "Fair" : "Poor"}
              </Badge>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Battery Age</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{batteryStatus.ageMonths}</span>
                <span className="text-sm text-muted-foreground">months</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {batteryStatus.cycleCount} cycles completed
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Degradation</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{batteryStatus.degradation}</span>
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <Badge variant={
                batteryStatus.degradation < 10 ? "default" : 
                batteryStatus.degradation < 20 ? "secondary" : "destructive"
              }>
                {batteryStatus.degradation < 10 ? "Excellent" : 
                 batteryStatus.degradation < 20 ? "Good" : "Replace Soon"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Predictive Analytics & Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Risk Score</span>
                <Badge variant={
                  riskScore < 30 ? "default" : 
                  riskScore < 60 ? "secondary" : "destructive"
                }>
                  {riskScore}/100
                </Badge>
              </div>
              <Progress value={riskScore} className="h-3" />
              <div className="text-xs text-muted-foreground">
                {riskScore < 30 ? 'Low risk - System operating normally' :
                 riskScore < 60 ? 'Moderate risk - Monitor closely' :
                 'High risk - Action required'}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="text-sm font-medium">Risk Factors</div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Battery Degradation</span>
                  <div className="flex items-center gap-2">
                    {batteryStatus.degradation > 20 ? 
                      <AlertCircle className="h-3 w-3 text-status-critical" /> :
                      batteryStatus.degradation > 10 ?
                      <AlertTriangle className="h-3 w-3 text-status-warning" /> :
                      <CheckCircle className="h-3 w-3 text-status-good" />
                    }
                    <span className="text-xs text-muted-foreground">{batteryStatus.degradation}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Internal Resistance</span>
                  <div className="flex items-center gap-2">
                    {batteryStatus.internalResistance > 150 ? 
                      <AlertCircle className="h-3 w-3 text-status-critical" /> :
                      batteryStatus.internalResistance > 100 ?
                      <AlertTriangle className="h-3 w-3 text-status-warning" /> :
                      <CheckCircle className="h-3 w-3 text-status-good" />
                    }
                    <span className="text-xs text-muted-foreground">{batteryStatus.internalResistance}mΩ</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Charge Efficiency</span>
                  <div className="flex items-center gap-2">
                    {performanceMetrics.chargeEfficiency < 85 ? 
                      <AlertCircle className="h-3 w-3 text-status-critical" /> :
                      performanceMetrics.chargeEfficiency < 90 ?
                      <AlertTriangle className="h-3 w-3 text-status-warning" /> :
                      <CheckCircle className="h-3 w-3 text-status-good" />
                    }
                    <span className="text-xs text-muted-foreground">{performanceMetrics.chargeEfficiency.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Health Trend</span>
                  <div className="flex items-center gap-2">
                    {cycleAnalysis.healthTrend === 'degrading' ? 
                      <TrendingDown className="h-3 w-3 text-status-critical" /> :
                      cycleAnalysis.healthTrend === 'stable' ?
                      <Minus className="h-3 w-3 text-status-warning" /> :
                      <TrendingUp className="h-3 w-3 text-status-good" />
                    }
                    <span className="text-xs text-muted-foreground capitalize">{cycleAnalysis.healthTrend}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border",
                    rec.type === 'success' && "bg-status-good/10 border-status-good/20",
                    rec.type === 'info' && "bg-primary/10 border-primary/20",
                    rec.type === 'warning' && "bg-status-warning/10 border-status-warning/20",
                    rec.type === 'critical' && "bg-status-critical/10 border-status-critical/20"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {rec.type === 'success' && <CheckCircle className="h-4 w-4 text-status-good mt-0.5" />}
                    {rec.type === 'info' && <AlertTriangle className="h-4 w-4 text-primary mt-0.5" />}
                    {rec.type === 'warning' && <AlertTriangle className="h-4 w-4 text-status-warning mt-0.5" />}
                    {rec.type === 'critical' && <AlertCircle className="h-4 w-4 text-status-critical mt-0.5" />}
                    <div className="flex-1 space-y-1">
                      <div className="text-sm font-medium">{rec.title}</div>
                      <div className="text-xs text-muted-foreground">{rec.message}</div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {rec.action}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
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
              Reports include all historical data, performance metrics, usage patterns, cycle analysis, and predictive recommendations. 
              CSV format is suitable for spreadsheet applications, while JSON format provides complete system details.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
