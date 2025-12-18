import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Zap, Activity, Gauge, Battery, Heart, Percent } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Statistics {
  voltage: {
    avg: number;
    peak: number;
    min: number;
  };
  current: {
    avg: number;
    peak: number;
    min: number;
  };
  power: {
    avg: number;
    peak: number;
    min: number;
  };
  energy: {
    consumed: number;
    stored: number;
  };
}

interface StatisticsPanelProps {
  statistics: Statistics;
  soc?: number;
  soh?: number;
}

export const StatisticsPanel = ({ statistics, soc = 0, soh = 0 }: StatisticsPanelProps) => {
  const getSocColor = (value: number) => {
    if (value >= 60) return 'text-green-500';
    if (value >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSohColor = (value: number) => {
    if (value >= 80) return 'text-green-500';
    if (value >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSocProgressColor = (value: number) => {
    if (value >= 60) return 'bg-green-500';
    if (value >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSohProgressColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* SOC Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">State of Charge (SOC)</CardTitle>
            <Percent className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${getSocColor(soc)}`}>
                {soc.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getSocProgressColor(soc)}`}
                style={{ width: `${Math.min(soc, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {soc >= 80 ? 'Fully charged' : soc >= 50 ? 'Good charge level' : soc >= 20 ? 'Consider charging' : 'Low battery'}
            </p>
          </CardContent>
        </Card>

        {/* SOH Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">State of Health (SOH)</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${getSohColor(soh)}`}>
                {soh.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getSohProgressColor(soh)}`}
                style={{ width: `${Math.min(soh, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {soh >= 90 ? 'Excellent condition' : soh >= 80 ? 'Good condition' : soh >= 60 ? 'Fair condition' : 'Consider replacement'}
            </p>
          </CardContent>
        </Card>

        {/* Energy Statistics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Stats</CardTitle>
            <Battery className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Consumed:</span>
              <span className="font-semibold text-red-500">
                {statistics.energy.consumed.toFixed(2)} Wh
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stored:</span>
              <span className="font-semibold text-green-500">
                {statistics.energy.stored.toFixed(2)} Wh
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-muted-foreground">Net:</span>
              <span className={`font-semibold ${
                statistics.energy.stored - statistics.energy.consumed >= 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                {(statistics.energy.stored - statistics.energy.consumed).toFixed(2)} Wh
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Voltage Statistics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voltage Stats</CardTitle>
            <Zap className="h-4 w-4 text-chart-voltage" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Average:</span>
              <span className="font-semibold">{statistics.voltage.avg.toFixed(2)} V</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">Peak:</span>
              <span className="font-semibold flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                {statistics.voltage.peak.toFixed(2)} V
              </span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">Min:</span>
              <span className="font-semibold flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-red-500" />
                {statistics.voltage.min.toFixed(2)} V
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Current Statistics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stats</CardTitle>
            <Activity className="h-4 w-4 text-chart-current" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Average:</span>
              <span className="font-semibold">{statistics.current.avg.toFixed(2)} A</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">Peak:</span>
              <span className="font-semibold flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                {statistics.current.peak.toFixed(2)} A
              </span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">Min:</span>
              <span className="font-semibold flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-red-500" />
                {statistics.current.min.toFixed(2)} A
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Power Statistics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Power Stats</CardTitle>
            <Gauge className="h-4 w-4 text-chart-power" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Average:</span>
              <span className="font-semibold">{Math.abs(statistics.power.avg).toFixed(2)} W</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">Peak:</span>
              <span className="font-semibold flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                {Math.abs(statistics.power.peak).toFixed(2)} W
              </span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">Min:</span>
              <span className="font-semibold flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-red-500" />
                {Math.abs(statistics.power.min).toFixed(2)} W
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
