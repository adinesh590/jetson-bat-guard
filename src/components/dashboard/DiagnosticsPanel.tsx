import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  PlayCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Zap,
  Activity,
  Wifi,
  FileText,
  Trash2,
  Bug
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DiagnosticsState {
  mosfetTest: {
    q1Status: 'idle' | 'testing' | 'passed' | 'failed';
    q2Status: 'idle' | 'testing' | 'passed' | 'failed';
    lastTest: string;
  };
  sensorValidation: {
    status: 'idle' | 'running' | 'passed' | 'failed';
    lastValidation: string;
    errors: string[];
  };
  communicationTest: {
    status: 'idle' | 'running' | 'passed' | 'failed';
    latency: number;
    lastTest: string;
  };
  systemLogs: {
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    message: string;
  }[];
  debugMode: boolean;
}

interface DiagnosticsPanelProps {
  diagnostics: DiagnosticsState;
  onRunMosfetTest: () => void;
  onValidateSensors: () => void;
  onCommunicationTest: () => void;
  onToggleDebugMode: () => void;
  onClearLogs: () => void;
}

export const DiagnosticsPanel = ({
  diagnostics,
  onRunMosfetTest,
  onValidateSensors,
  onCommunicationTest,
  onToggleDebugMode,
  onClearLogs
}: DiagnosticsPanelProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-status-good" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-status-critical" />;
      case 'testing':
      case 'running':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      default:
        return <PlayCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'passed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'testing':
      case 'running':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-status-critical';
      case 'warning':
        return 'text-status-warning';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* System Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Tests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* MOSFET Test */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">MOSFET Test</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={onRunMosfetTest}
                disabled={diagnostics.mosfetTest.q1Status === 'testing'}
              >
                {diagnostics.mosfetTest.q1Status === 'testing' ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-3 w-3 mr-1" />
                    Run Test
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 pl-6">
              <div className="flex items-center justify-between">
                <span className="text-xs">Q1 (Charge)</span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(diagnostics.mosfetTest.q1Status)}
                  <Badge variant={getStatusBadgeVariant(diagnostics.mosfetTest.q1Status)} className="text-xs">
                    {diagnostics.mosfetTest.q1Status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Q2 (Discharge)</span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(diagnostics.mosfetTest.q2Status)}
                  <Badge variant={getStatusBadgeVariant(diagnostics.mosfetTest.q2Status)} className="text-xs">
                    {diagnostics.mosfetTest.q2Status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground pl-6">
              Last Test: {diagnostics.mosfetTest.lastTest}
            </div>
          </div>

          <Separator />

          {/* Sensor Validation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm font-medium">Sensor Validation</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={onValidateSensors}
                disabled={diagnostics.sensorValidation.status === 'running'}
              >
                {diagnostics.sensorValidation.status === 'running' ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-3 w-3 mr-1" />
                    Validate
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between pl-6">
              <span className="text-xs">Status</span>
              <div className="flex items-center gap-1">
                {getStatusIcon(diagnostics.sensorValidation.status)}
                <Badge variant={getStatusBadgeVariant(diagnostics.sensorValidation.status)} className="text-xs">
                  {diagnostics.sensorValidation.status}
                </Badge>
              </div>
            </div>

            {diagnostics.sensorValidation.errors.length > 0 && (
              <div className="pl-6 space-y-1">
                {diagnostics.sensorValidation.errors.map((error, idx) => (
                  <div key={idx} className="text-xs text-status-critical flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {error}
                  </div>
                ))}
              </div>
            )}

            <div className="text-xs text-muted-foreground pl-6">
              Last Validation: {diagnostics.sensorValidation.lastValidation}
            </div>
          </div>

          <Separator />

          {/* Communication Test */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                <span className="text-sm font-medium">Communication Test</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={onCommunicationTest}
                disabled={diagnostics.communicationTest.status === 'running'}
              >
                {diagnostics.communicationTest.status === 'running' ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-3 w-3 mr-1" />
                    Test
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 pl-6">
              <div className="flex items-center justify-between">
                <span className="text-xs">Status</span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(diagnostics.communicationTest.status)}
                  <Badge variant={getStatusBadgeVariant(diagnostics.communicationTest.status)} className="text-xs">
                    {diagnostics.communicationTest.status}
                  </Badge>
                </div>
              </div>
              {diagnostics.communicationTest.latency > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs">Latency</span>
                  <Badge variant="outline" className="text-xs">
                    {diagnostics.communicationTest.latency}ms
                  </Badge>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground pl-6">
              Last Test: {diagnostics.communicationTest.lastTest}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              System Logs
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4" />
                <Label htmlFor="debug-mode" className="text-sm">Debug</Label>
                <Switch
                  id="debug-mode"
                  checked={diagnostics.debugMode}
                  onCheckedChange={onToggleDebugMode}
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={onClearLogs}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <div className="space-y-2">
              {diagnostics.systemLogs.slice().reverse().map((log, idx) => (
                <div key={idx} className="text-xs space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <Badge 
                      variant={
                        log.level === 'error' ? 'destructive' : 
                        log.level === 'warning' ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {log.level}
                    </Badge>
                  </div>
                  <p className={cn("pl-24", getLogLevelColor(log.level))}>
                    {log.message}
                  </p>
                  {idx < diagnostics.systemLogs.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          
          {diagnostics.debugMode && (
            <div className="mt-4 p-3 rounded-md bg-muted">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Bug className="h-3 w-3" />
                <span>Debug mode enabled - verbose logging active</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
