import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Power, 
  Square, 
  Play, 
  Pause, 
  AlertTriangle,
  Shield,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ControlState {
  chargeEnabled: boolean;
  dischargeEnabled: boolean;
  autoMode: boolean;
  emergencyStop: boolean;
  protectionMode: boolean;
}

interface MOSFETStatus {
  q1Charge: boolean;
  q2Discharge: boolean;
}

interface ControlPanelProps {
  controlState: ControlState;
  mosfetStatus: MOSFETStatus;
  onControlChange: (control: keyof ControlState, value: boolean) => void;
  onEmergencyStop: () => void;
  onResetProtection: () => void;
}

export const ControlPanel = ({ 
  controlState, 
  mosfetStatus, 
  onControlChange, 
  onEmergencyStop,
  onResetProtection 
}: ControlPanelProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Manual Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Manual Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="charge-enable" className="flex items-center gap-2">
              <Play className="h-4 w-4 text-state-charging" />
              Charge Enable
            </Label>
            <Switch
              id="charge-enable"
              checked={controlState.chargeEnabled}
              onCheckedChange={(checked) => onControlChange('chargeEnabled', checked)}
              disabled={controlState.emergencyStop}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="discharge-enable" className="flex items-center gap-2">
              <Pause className="h-4 w-4 text-state-discharging" />
              Discharge Enable
            </Label>
            <Switch
              id="discharge-enable"
              checked={controlState.dischargeEnabled}
              onCheckedChange={(checked) => onControlChange('dischargeEnabled', checked)}
              disabled={controlState.emergencyStop}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="auto-mode" className="flex items-center gap-2">
              <Power className="h-4 w-4" />
              Auto Mode
            </Label>
            <Switch
              id="auto-mode"
              checked={controlState.autoMode}
              onCheckedChange={(checked) => onControlChange('autoMode', checked)}
              disabled={controlState.emergencyStop}
            />
          </div>
        </CardContent>
      </Card>

      {/* Safety Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Safety Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant={controlState.emergencyStop ? "destructive" : "outline"}
            size="lg"
            onClick={onEmergencyStop}
            className="w-full"
          >
            <Square className="h-4 w-4 mr-2" />
            {controlState.emergencyStop ? 'EMERGENCY ACTIVE' : 'EMERGENCY STOP'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onResetProtection}
            disabled={!controlState.protectionMode}
            className="w-full"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Reset Protection
          </Button>

          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Protection Mode
            </Label>
            <Badge 
              variant={controlState.protectionMode ? "destructive" : "secondary"}
            >
              {controlState.protectionMode ? "ACTIVE" : "NORMAL"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* MOSFET Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Power className="h-4 w-4" />
            MOSFET Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Q1 (Charge MOSFET)</Label>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: mosfetStatus.q1Charge ? 'hsl(var(--state-charging))' : 'hsl(var(--muted))',
                  boxShadow: mosfetStatus.q1Charge ? '0 0 10px hsl(var(--state-charging))' : 'none'
                }}
              />
              <Badge variant={mosfetStatus.q1Charge ? "default" : "secondary"}>
                {mosfetStatus.q1Charge ? "ON" : "OFF"}
              </Badge>
            </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Q2 (Discharge MOSFET)</Label>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: mosfetStatus.q2Discharge ? 'hsl(var(--state-discharging))' : 'hsl(var(--muted))',
                  boxShadow: mosfetStatus.q2Discharge ? '0 0 10px hsl(var(--state-discharging))' : 'none'
                }}
              />
              <Badge variant={mosfetStatus.q2Discharge ? "default" : "secondary"}>
                {mosfetStatus.q2Discharge ? "ON" : "OFF"}
              </Badge>
            </div>
            </div>
          </div>

          <Separator />

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Gate Voltage Q1: 12.0V</p>
            <p>Gate Voltage Q2: 12.0V</p>
            <p>Last Update: {new Date().toLocaleTimeString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};