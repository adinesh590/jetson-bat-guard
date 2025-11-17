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
  qc: boolean;  // Charging MOSFET
  qd1: boolean; // Discharge MOSFET 1
  qd2: boolean; // Discharge MOSFET 2
  qd3: boolean; // Discharge MOSFET 3
}

interface ControlPanelProps {
  controlState: ControlState;
  mosfetStatus: MOSFETStatus;
  onControlChange: (control: keyof ControlState, value: boolean) => void;
  onMosfetToggle: (mosfet: keyof MOSFETStatus, value: boolean) => void;
  onEmergencyStop: () => void;
  onResetProtection: () => void;
}

export const ControlPanel = ({ 
  controlState, 
  mosfetStatus, 
  onControlChange, 
  onMosfetToggle,
  onEmergencyStop,
  onResetProtection 
}: ControlPanelProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            MOSFET Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Qc (Charge MOSFET)</Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={mosfetStatus.qc}
                onCheckedChange={(checked) => onMosfetToggle('qc', checked)}
                disabled={controlState.emergencyStop}
              />
              <div 
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: mosfetStatus.qc ? 'hsl(var(--state-charging))' : 'hsl(var(--muted))',
                  boxShadow: mosfetStatus.qc ? '0 0 10px hsl(var(--state-charging))' : 'none'
                }}
              />
              <Badge variant={mosfetStatus.qc ? "default" : "secondary"}>
                {mosfetStatus.qc ? "ON" : "OFF"}
              </Badge>
            </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label className="text-sm">Qd1 (Discharge MOSFET 1)</Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={mosfetStatus.qd1}
                onCheckedChange={(checked) => onMosfetToggle('qd1', checked)}
                disabled={controlState.emergencyStop}
              />
              <div 
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: mosfetStatus.qd1 ? 'hsl(var(--state-discharging))' : 'hsl(var(--muted))',
                  boxShadow: mosfetStatus.qd1 ? '0 0 10px hsl(var(--state-discharging))' : 'none'
                }}
              />
              <Badge variant={mosfetStatus.qd1 ? "default" : "secondary"}>
                {mosfetStatus.qd1 ? "ON" : "OFF"}
              </Badge>
            </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Qd2 (Discharge MOSFET 2)</Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={mosfetStatus.qd2}
                onCheckedChange={(checked) => onMosfetToggle('qd2', checked)}
                disabled={controlState.emergencyStop}
              />
              <div 
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: mosfetStatus.qd2 ? 'hsl(var(--state-discharging))' : 'hsl(var(--muted))',
                  boxShadow: mosfetStatus.qd2 ? '0 0 10px hsl(var(--state-discharging))' : 'none'
                }}
              />
              <Badge variant={mosfetStatus.qd2 ? "default" : "secondary"}>
                {mosfetStatus.qd2 ? "ON" : "OFF"}
              </Badge>
            </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Qd3 (Discharge MOSFET 3)</Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={mosfetStatus.qd3}
                onCheckedChange={(checked) => onMosfetToggle('qd3', checked)}
                disabled={controlState.emergencyStop}
              />
              <div 
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: mosfetStatus.qd3 ? 'hsl(var(--state-discharging))' : 'hsl(var(--muted))',
                  boxShadow: mosfetStatus.qd3 ? '0 0 10px hsl(var(--state-discharging))' : 'none'
                }}
              />
              <Badge variant={mosfetStatus.qd3 ? "default" : "secondary"}>
                {mosfetStatus.qd3 ? "ON" : "OFF"}
              </Badge>
            </div>
            </div>
          </div>

          <Separator />

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Safety Rule:</p>
            <p>• Charging ON → All discharge OFF</p>
            <p>• Any discharge ON → Charging OFF</p>
            <p>Last Update: {new Date().toLocaleTimeString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};