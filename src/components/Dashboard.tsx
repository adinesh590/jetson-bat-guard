import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BatteryMetrics } from "@/components/dashboard/BatteryMetrics";
import { RealtimeCharts } from "@/components/dashboard/RealtimeCharts";
import { ControlPanel } from "@/components/dashboard/ControlPanel";
import { SystemInfo } from "@/components/dashboard/SystemInfo";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { TimeRangeSelector, TimeRange } from "@/components/dashboard/TimeRangeSelector";
import { StatisticsPanel } from "@/components/dashboard/StatisticsPanel";
import { useBatteryData } from "@/hooks/useBatteryData";
import { useHistoricalData } from "@/hooks/useHistoricalData";
import { DateRange } from "react-day-picker";
import { 
  Activity, 
  Settings, 
  Info, 
  Bell,
  Zap,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Dashboard = () => {
  const {
    batteryData,
    chartData,
    historicalData,
    controlState,
    mosfetStatus,
    alerts,
    systemStatus,
    handleControlChange,
    handleEmergencyStop,
    handleResetProtection,
    handleAcknowledgeAlert,
    handleDismissAlert
  } = useBatteryData();

  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1h');
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();

  const { filteredData, statistics } = useHistoricalData(
    historicalData,
    selectedTimeRange,
    customDateRange
  );

  const activeAlertsCount = alerts.filter(alert => !alert.acknowledged).length;

  const getSystemStatusColor = () => {
    if (controlState.emergencyStop || controlState.protectionMode) return 'status-critical';
    if (batteryData.soc < 20) return 'status-warning';
    if (activeAlertsCount > 0) return 'status-warning';
    return 'status-good';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Battery Monitoring Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time monitoring and control for Li-ion battery management system
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge 
              variant="outline" 
              className="px-3 py-1 text-sm"
              style={{ 
                borderColor: `hsl(var(--${getSystemStatusColor()}))`,
                color: `hsl(var(--${getSystemStatusColor()}))`
              }}
            >
              <div 
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: `hsl(var(--${getSystemStatusColor()}))` }}
              />
              {controlState.emergencyStop ? 'EMERGENCY' : 
               controlState.protectionMode ? 'PROTECTION' : 
               'OPERATIONAL'}
            </Badge>
            {activeAlertsCount > 0 && (
              <Badge variant="destructive" className="px-3 py-1">
                <Bell className="w-3 h-3 mr-1" />
                {activeAlertsCount} Alert{activeAlertsCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="monitoring" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="control" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Control
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              System Info
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2 relative">
              <Bell className="h-4 w-4" />
              Alerts
              {activeAlertsCount > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="space-y-6">
            {/* Battery Metrics */}
            <BatteryMetrics data={batteryData} />
            
            {/* Time Range Selector */}
            <Card>
              <CardContent className="pt-6">
                <TimeRangeSelector
                  selectedRange={selectedTimeRange}
                  onRangeChange={setSelectedTimeRange}
                  customDateRange={customDateRange}
                  onCustomDateChange={setCustomDateRange}
                />
              </CardContent>
            </Card>

            {/* Statistics */}
            <StatisticsPanel statistics={statistics} />
            
            {/* Real-time Charts */}
            <RealtimeCharts data={filteredData.length > 0 ? filteredData : chartData} />
            
            {/* Quick Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Status</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{batteryData.state}</div>
                  <p className="text-xs text-muted-foreground">
                    Auto Mode: {controlState.autoMode ? 'Enabled' : 'Disabled'}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">MOSFET Status</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Q1 (Charge):</span>
                      <Badge variant={mosfetStatus.q1Charge ? "default" : "secondary"}>
                        {mosfetStatus.q1Charge ? "ON" : "OFF"}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Q2 (Discharge):</span>
                      <Badge variant={mosfetStatus.q2Discharge ? "default" : "secondary"}>
                        {mosfetStatus.q2Discharge ? "ON" : "OFF"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Efficiency:</span>
                      <span>94.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span>{systemStatus.jetsonNano.uptime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="control" className="space-y-6">
            <ControlPanel
              controlState={controlState}
              mosfetStatus={mosfetStatus}
              onControlChange={handleControlChange}
              onEmergencyStop={handleEmergencyStop}
              onResetProtection={handleResetProtection}
            />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <SystemInfo status={systemStatus} />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AlertsPanel
              alerts={alerts}
              config={{
                lowBatteryWarning: true,
                criticalBattery: true,
                overVoltage: true,
                overCurrent: true,
                temperature: true,
                soundAlerts: false
              }}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onDismissAlert={handleDismissAlert}
              onConfigChange={() => {}}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};