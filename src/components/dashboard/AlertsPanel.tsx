import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  Clock,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface AlertsConfig {
  lowBatteryWarning: boolean;
  criticalBattery: boolean;
  overVoltage: boolean;
  overCurrent: boolean;
  temperature: boolean;
  soundAlerts: boolean;
}

interface AlertsPanelProps {
  alerts: Alert[];
  config: AlertsConfig;
  onAcknowledgeAlert: (alertId: string) => void;
  onDismissAlert: (alertId: string) => void;
  onConfigChange: (config: AlertsConfig) => void;
}

export const AlertsPanel = ({ 
  alerts, 
  config, 
  onAcknowledgeAlert, 
  onDismissAlert,
  onConfigChange 
}: AlertsPanelProps) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-status-critical" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-status-warning" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-status-good" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-status-critical';
      case 'warning': return 'border-l-status-warning';
      case 'info': return 'border-l-status-good';
      default: return 'border-l-muted';
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.acknowledged);
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Active Alerts
              {activeAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {activeAlerts.length}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-status-good" />
              <p>No active alerts</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-3 border-l-4 bg-card/50 rounded-r-md",
                      getSeverityColor(alert.severity)
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleString()}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAcknowledgeAlert(alert.id)}
                          className="text-xs px-2"
                        >
                          ACK
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDismissAlert(alert.id)}
                          className="text-xs px-1"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Alert Configuration & History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alert Settings & History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Settings */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Alert Configuration</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Badge variant={config.lowBatteryWarning ? "default" : "secondary"}>
                Low Battery {config.lowBatteryWarning ? "ON" : "OFF"}
              </Badge>
              <Badge variant={config.criticalBattery ? "default" : "secondary"}>
                Critical Battery {config.criticalBattery ? "ON" : "OFF"}
              </Badge>
              <Badge variant={config.overVoltage ? "default" : "secondary"}>
                Over-voltage {config.overVoltage ? "ON" : "OFF"}
              </Badge>
              <Badge variant={config.overCurrent ? "default" : "secondary"}>
                Over-current {config.overCurrent ? "ON" : "OFF"}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Recent Acknowledged Alerts */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent History</h4>
            {acknowledgedAlerts.length === 0 ? (
              <p className="text-xs text-muted-foreground">No recent alerts</p>
            ) : (
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {acknowledgedAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center gap-2 p-2 bg-muted/20 rounded text-xs"
                    >
                      <CheckCircle className="h-3 w-3 text-status-good" />
                      <span className="flex-1 truncate">{alert.message}</span>
                      <Badge variant="outline" className="text-xs">
                        ACK
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <Separator />

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-lg font-bold">{activeAlerts.length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div>
              <p className="text-lg font-bold">{acknowledgedAlerts.length}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};