import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Battery, Zap, Gauge, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface BatteryData {
  voltage: number;
  current: number;
  power: number;
  soc: number;
  state: 'CHARGING' | 'DISCHARGING' | 'IDLE' | 'PROTECTION';
}

interface BatteryMetricsProps {
  data: BatteryData;
}

export const BatteryMetrics = ({ data }: BatteryMetricsProps) => {
  const getVoltageStatus = (voltage: number) => {
    if (voltage >= 4.1) return { status: 'excellent', color: 'status-excellent' };
    if (voltage >= 3.7) return { status: 'good', color: 'status-good' };
    if (voltage >= 3.3) return { status: 'warning', color: 'status-warning' };
    return { status: 'critical', color: 'status-critical' };
  };

  const getSocStatus = (soc: number) => {
    if (soc >= 80) return { status: 'excellent', color: 'status-excellent' };
    if (soc >= 50) return { status: 'good', color: 'status-good' };
    if (soc >= 20) return { status: 'warning', color: 'status-warning' };
    return { status: 'critical', color: 'status-critical' };
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'CHARGING': return 'state-charging';
      case 'DISCHARGING': return 'state-discharging';
      case 'PROTECTION': return 'state-protection';
      default: return 'state-idle';
    }
  };

  const voltageStatus = getVoltageStatus(data.voltage);
  const socStatus = getSocStatus(data.soc);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Voltage Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Battery Voltage</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-bold">{data.voltage.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">V</div>
          </div>
          <div className="flex items-center mt-2">
            <div 
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: `hsl(var(--${voltageStatus.color}))` }}
            />
            <div className="text-xs text-muted-foreground capitalize">
              {voltageStatus.status}
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Range: 3.0V - 4.2V
          </div>
        </CardContent>
      </Card>

      {/* Current Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Battery Current</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-bold">
              {data.current > 0 ? '+' : ''}{data.current.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">A</div>
          </div>
          <div className="flex items-center mt-2">
            <Badge variant={data.current > 0 ? "default" : "secondary"} className="text-xs">
              {data.current > 0 ? '↑ Charging' : data.current < 0 ? '↓ Discharging' : '— Idle'}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Peak: ±1.5A
          </div>
        </CardContent>
      </Card>

      {/* Power Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Battery Power</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-bold">
              {Math.abs(data.power).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">W</div>
          </div>
          <div className="flex items-center mt-2">
            <div className="text-xs text-muted-foreground">
              {data.power > 0 ? 'Consuming' : data.power < 0 ? 'Generating' : 'No load'}
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Max: 20W
          </div>
        </CardContent>
      </Card>

      {/* State of Charge Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">State of Charge</CardTitle>
          <Battery className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-bold">{data.soc}</div>
            <div className="text-sm text-muted-foreground">%</div>
          </div>
          <Progress value={data.soc} className="mt-2" />
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs capitalize flex items-center">
              <div 
                className="w-1.5 h-1.5 rounded-full mr-1"
                style={{ backgroundColor: `hsl(var(--${socStatus.color}))` }}
              />
              <span style={{ color: `hsl(var(--${socStatus.color}))` }}>
                {socStatus.status}
              </span>
            </div>
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ 
                borderColor: `hsl(var(--${getStateColor(data.state)}))`,
                color: `hsl(var(--${getStateColor(data.state)}))`
              }}
            >
              {data.state}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};