import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Cpu, 
  HardDrive, 
  Thermometer, 
  Clock, 
  Wifi,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemStatus {
  jetsonNano: {
    cpuTemp: number;
    cpuUsage: number;
    memoryUsage: number;
    uptime: string;
  };
  sensors: {
    ina219Connected: boolean;
    ads1115Connected: boolean;
    i2cHealth: 'good' | 'warning' | 'error';
    lastReading: string;
  };
  battery: {
    type: string;
    nominalVoltage: number;
    capacity: number;
    cycleCount: number;
    health: number;
  };
}

interface SystemInfoProps {
  status: SystemStatus;
}

export const SystemInfo = ({ status }: SystemInfoProps) => {
  const getStatusIcon = (connected: boolean) => {
    return connected ? (
      <CheckCircle className="h-4 w-4 text-status-good" />
    ) : (
      <XCircle className="h-4 w-4 text-status-critical" />
    );
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'good': return 'text-status-good';
      case 'warning': return 'text-status-warning';
      case 'error': return 'text-status-critical';
      default: return 'text-muted-foreground';
    }
  };

  const getHealthBadgeVariant = (health: string) => {
    switch (health) {
      case 'good': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Jetson Nano Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Jetson Nano Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <Thermometer className="h-3 w-3" />
                CPU Temperature
              </span>
              <Badge variant={status.jetsonNano.cpuTemp > 80 ? "destructive" : "secondary"}>
                {status.jetsonNano.cpuTemp}°C
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <Cpu className="h-3 w-3" />
                CPU Usage
              </span>
              <Badge variant={status.jetsonNano.cpuUsage > 80 ? "destructive" : "secondary"}>
                {status.jetsonNano.cpuUsage}%
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <HardDrive className="h-3 w-3" />
                Memory Usage
              </span>
              <Badge variant={status.jetsonNano.memoryUsage > 80 ? "destructive" : "secondary"}>
                {status.jetsonNano.memoryUsage}%
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Uptime
              </span>
              <span className="text-sm text-muted-foreground">
                {status.jetsonNano.uptime}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sensor Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            Sensor Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">INA219 (Current/Voltage)</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.sensors.ina219Connected)}
                <Badge variant={status.sensors.ina219Connected ? "default" : "destructive"}>
                  {status.sensors.ina219Connected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">ADS1115 (ADC)</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.sensors.ads1115Connected)}
                <Badge variant={status.sensors.ads1115Connected ? "default" : "destructive"}>
                  {status.sensors.ads1115Connected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm">I2C Bus Health</span>
              <Badge variant={getHealthBadgeVariant(status.sensors.i2cHealth)}>
                <span className={cn("capitalize", getHealthColor(status.sensors.i2cHealth))}>
                  {status.sensors.i2cHealth}
                </span>
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground">
              Last Reading: {status.sensors.lastReading}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Battery Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-4 h-4 border border-current rounded-sm flex items-center justify-center">
              <div className="w-1 h-2 bg-current rounded-sm" />
            </div>
            Battery Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Battery Type</span>
              <Badge variant="outline">{status.battery.type}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Nominal Voltage</span>
              <span className="text-sm text-muted-foreground">
                {status.battery.nominalVoltage}V
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Capacity</span>
              <span className="text-sm text-muted-foreground">
                {status.battery.capacity}mAh
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Cycle Count</span>
              <span className="text-sm text-muted-foreground">
                {status.battery.cycleCount}
              </span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm">Battery Health</span>
              <div className="flex items-center gap-2">
                {status.battery.health > 80 ? (
                  <CheckCircle className="h-3 w-3 text-status-good" />
                ) : status.battery.health > 60 ? (
                  <AlertTriangle className="h-3 w-3 text-status-warning" />
                ) : (
                  <XCircle className="h-3 w-3 text-status-critical" />
                )}
                <Badge variant={
                  status.battery.health > 80 ? "default" : 
                  status.battery.health > 60 ? "secondary" : "destructive"
                }>
                  {status.battery.health}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};