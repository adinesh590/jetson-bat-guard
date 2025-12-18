import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface BatteryData {
  voltage: number;
  current: number;
  power: number;
  soc: number;
  soh: number;
  state: 'CHARGING' | 'DISCHARGING' | 'IDLE' | 'PROTECTION';
}

interface ChartDataPoint {
  time: string;
  voltage: number;
  current: number;
  power: number;
}

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

interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

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
    remainingCapacity: number;
    internalResistance: number;
    ageMonths: number;
    degradation: number;
  };
}

interface DiagnosticsState {
  mosfetTest: {
    qcStatus: 'idle' | 'testing' | 'passed' | 'failed';
    qd1Status: 'idle' | 'testing' | 'passed' | 'failed';
    qd2Status: 'idle' | 'testing' | 'passed' | 'failed';
    qd3Status: 'idle' | 'testing' | 'passed' | 'failed';
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

export const useBatteryData = () => {
  const { toast } = useToast();
  
  // Simulation state
  const [simulationVoltage, setSimulationVoltage] = useState(2.8);
  const [simulationSoc, setSimulationSoc] = useState(15);
  
  const [batteryData, setBatteryData] = useState<BatteryData>({
    voltage: 2.8,
    current: 0,
    power: 0,
    soc: 15,
    soh: 92,
    state: 'IDLE'
  });

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [historicalData, setHistoricalData] = useState<ChartDataPoint[]>([]);
  
  const [controlState, setControlState] = useState<ControlState>({
    chargeEnabled: true,
    dischargeEnabled: true,
    autoMode: true,
    emergencyStop: false,
    protectionMode: false
  });

  const [mosfetStatus, setMosfetStatus] = useState<MOSFETStatus>({
    qc: false,
    qd1: false,
    qd2: false,
    qd3: false
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);

  const [systemStatus] = useState<SystemStatus>({
    jetsonNano: {
      cpuTemp: 45,
      cpuUsage: 25,
      memoryUsage: 60,
      uptime: '2d 14h 32m'
    },
    sensors: {
      ina219Connected: true,
      ads1115Connected: true,
      i2cHealth: 'good',
      lastReading: new Date().toLocaleTimeString()
    },
    battery: {
      type: 'Li-ion 18650',
      nominalVoltage: 3.7,
      capacity: 2500,
      cycleCount: 145,
      health: 92,
      remainingCapacity: 2300,
      internalResistance: 85,
      ageMonths: 14,
      degradation: 8
    }
  });

  const [diagnostics, setDiagnostics] = useState<DiagnosticsState>({
    mosfetTest: {
      qcStatus: 'idle',
      qd1Status: 'idle',
      qd2Status: 'idle',
      qd3Status: 'idle',
      lastTest: 'Never'
    },
    sensorValidation: {
      status: 'idle',
      lastValidation: 'Never',
      errors: []
    },
    communicationTest: {
      status: 'idle',
      latency: 0,
      lastTest: 'Never'
    },
    systemLogs: [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Simulation mode initialized'
      }
    ],
    debugMode: false
  });

  // Simulation engine
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      // Emergency stop or protection mode - no changes
      if (controlState.emergencyStop || controlState.protectionMode) {
        return;
      }

      setSimulationVoltage(prevVoltage => {
        setSimulationSoc(prevSoc => {
          let newVoltage = prevVoltage;
          let newSoc = prevSoc;
          let current = 0;
          let state: BatteryData['state'] = 'IDLE';

          // Check voltage limits for protection
          if (prevVoltage <= 2.7) {
            setControlState(prev => ({ ...prev, protectionMode: true }));
            const alert: Alert = {
              id: Math.random().toString(36).substr(2, 9),
              severity: 'critical',
              message: 'Battery voltage critically low - protection mode activated',
              timestamp: new Date().toISOString(),
              acknowledged: false
            };
            setAlerts(prev => [alert, ...prev]);
            toast({
              title: 'CRITICAL Alert',
              description: alert.message,
              variant: 'destructive'
            });
            return prevSoc;
          }

          if (prevVoltage >= 4.2 && mosfetStatus.qc) {
            setMosfetStatus(prev => ({ ...prev, qc: false }));
            const alert: Alert = {
              id: Math.random().toString(36).substr(2, 9),
              severity: 'warning',
              message: 'Battery fully charged - charging stopped',
              timestamp: new Date().toISOString(),
              acknowledged: false
            };
            setAlerts(prev => [alert, ...prev]);
            toast({
              title: 'Warning',
              description: alert.message
            });
          }

          // Charging mode (QC MOSFET active)
          if (mosfetStatus.qc && controlState.chargeEnabled && !controlState.emergencyStop) {
            // Charging current: 0.01A to 0.03A
            current = 0.01 + Math.random() * 0.02;
            
            // Increase voltage (slower as we approach 4.2V)
            const chargeRate = (4.2 - prevVoltage) / 1.5 * 0.002;
            newVoltage = Math.min(4.2, prevVoltage + chargeRate + (Math.random() * 0.001 - 0.0005));
            
            // Increase SOC
            newSoc = Math.min(100, prevSoc + 0.2);
            state = 'CHARGING';
          }
          // Discharging mode (any QD MOSFET active)
          else if ((mosfetStatus.qd1 || mosfetStatus.qd2 || mosfetStatus.qd3) && 
                   controlState.dischargeEnabled && !controlState.emergencyStop) {
            // Discharging current: 0.1A to 0.9A
            let dischargeFactor = 1;
            if (mosfetStatus.qd1) dischargeFactor = 1;
            if (mosfetStatus.qd2) dischargeFactor = 1.5;
            if (mosfetStatus.qd3) dischargeFactor = 2;
            
            current = -(0.1 + Math.random() * 0.8) * dischargeFactor;
            
            // Decrease voltage
            const dischargeRate = Math.abs(current) * 0.0008;
            newVoltage = Math.max(2.7, prevVoltage - dischargeRate + (Math.random() * 0.0002 - 0.0001));
            
            // Decrease SOC
            newSoc = Math.max(0, prevSoc - 0.15 * dischargeFactor);
            state = 'DISCHARGING';
          }
          // Idle mode
          else {
            // Small voltage fluctuation
            newVoltage = prevVoltage + (Math.random() * 0.002 - 0.001);
            newVoltage = Math.max(2.7, Math.min(4.2, newVoltage));
            current = 0;
            state = 'IDLE';
          }

          // Calculate power
          const power = newVoltage * current;

          // Update battery data
          setBatteryData(prev => ({
            voltage: parseFloat(newVoltage.toFixed(3)),
            current: parseFloat(current.toFixed(3)),
            power: parseFloat(power.toFixed(3)),
            soc: parseFloat(newSoc.toFixed(1)),
            soh: prev.soh,
            state: controlState.protectionMode ? 'PROTECTION' : state
          }));

          // Add to chart data
          const newPoint: ChartDataPoint = {
            time: new Date().toISOString(),
            voltage: parseFloat(newVoltage.toFixed(3)),
            current: parseFloat(current.toFixed(3)),
            power: parseFloat(power.toFixed(3))
          };

          setChartData(prev => [...prev, newPoint].slice(-50));
          setHistoricalData(prev => {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const filtered = prev.filter(point => point.time > thirtyDaysAgo);
            return [...filtered, newPoint];
          });

          return newSoc;
        });
        return prevVoltage;
      });
    }, 1000); // Update every second

    return () => clearInterval(simulationInterval);
  }, [mosfetStatus, controlState, toast]);


  const handleMosfetToggle = useCallback((mosfet: keyof MOSFETStatus, value: boolean) => {
    setMosfetStatus(prev => {
      // If turning ON a discharge MOSFET, turn OFF charging MOSFET
      if ((mosfet === 'qd1' || mosfet === 'qd2' || mosfet === 'qd3') && value) {
        return {
          ...prev,
          qc: false,
          [mosfet]: true
        };
      }
      
      // If turning ON charging MOSFET, turn OFF all discharge MOSFETs
      if (mosfet === 'qc' && value) {
        return {
          qc: true,
          qd1: false,
          qd2: false,
          qd3: false
        };
      }
      
      // If turning OFF, just update that specific MOSFET
      return {
        ...prev,
        [mosfet]: value
      };
    });
  }, []);

  const handleControlChange = useCallback((control: keyof ControlState, value: boolean) => {
    setControlState(prev => ({
      ...prev,
      [control]: value
    }));
  }, []);

  const handleEmergencyStop = useCallback(() => {
    setControlState(prev => ({
      ...prev,
      emergencyStop: !prev.emergencyStop,
      chargeEnabled: false,
      dischargeEnabled: false
    }));
    
    // Turn off all MOSFETs
    setMosfetStatus({
      qc: false,
      qd1: false,
      qd2: false,
      qd3: false
    });
  }, []);

  const handleResetProtection = useCallback(() => {
    setControlState(prev => ({
      ...prev,
      protectionMode: false
    }));
  }, []);

  const handleAcknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true }
        : alert
    ));
  }, []);

  const handleDismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const handleRunMosfetTest = useCallback(() => {
    setDiagnostics(prev => ({
      ...prev,
      mosfetTest: {
        qcStatus: 'testing',
        qd1Status: 'testing',
        qd2Status: 'testing',
        qd3Status: 'testing',
        lastTest: new Date().toLocaleString()
      }
    }));

    setTimeout(() => {
      setDiagnostics(prev => ({
        ...prev,
        mosfetTest: {
          qcStatus: 'passed',
          qd1Status: 'passed',
          qd2Status: 'passed',
          qd3Status: 'passed',
          lastTest: new Date().toLocaleString()
        },
        systemLogs: [
          ...prev.systemLogs,
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'MOSFET test completed successfully'
          }
        ]
      }));
    }, 2000);
  }, []);

  const handleValidateSensors = useCallback(() => {
    setDiagnostics(prev => ({
      ...prev,
      sensorValidation: {
        status: 'running',
        lastValidation: new Date().toLocaleString(),
        errors: []
      }
    }));

    setTimeout(() => {
      setDiagnostics(prev => ({
        ...prev,
        sensorValidation: {
          status: 'passed',
          lastValidation: new Date().toLocaleString(),
          errors: []
        },
        systemLogs: [
          ...prev.systemLogs,
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'Sensor validation completed - all sensors operational'
          }
        ]
      }));
    }, 1500);
  }, []);

  const handleCommunicationTest = useCallback(() => {
    setDiagnostics(prev => ({
      ...prev,
      communicationTest: {
        status: 'running',
        latency: 0,
        lastTest: new Date().toLocaleString()
      }
    }));

    setTimeout(() => {
      const latency = Math.floor(Math.random() * 50) + 10;
      setDiagnostics(prev => ({
        ...prev,
        communicationTest: {
          status: 'passed',
          latency,
          lastTest: new Date().toLocaleString()
        },
        systemLogs: [
          ...prev.systemLogs,
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Communication test passed - latency: ${latency}ms`
          }
        ]
      }));
    }, 1000);
  }, []);

  const handleToggleDebugMode = useCallback(() => {
    setDiagnostics(prev => {
      const newDebugMode = !prev.debugMode;
      return {
        ...prev,
        debugMode: newDebugMode,
        systemLogs: [
          ...prev.systemLogs,
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Debug mode ${newDebugMode ? 'enabled' : 'disabled'}`
          }
        ]
      };
    });
  }, []);

  const handleClearLogs = useCallback(() => {
    setDiagnostics(prev => ({
      ...prev,
      systemLogs: [{
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'System logs cleared'
      }]
    }));
  }, []);

  return {
    batteryData,
    chartData,
    historicalData,
    controlState,
    mosfetStatus,
    alerts,
    systemStatus,
    diagnostics,
    handleControlChange,
    handleMosfetToggle,
    handleEmergencyStop,
    handleResetProtection,
    handleAcknowledgeAlert,
    handleDismissAlert,
    handleRunMosfetTest,
    handleValidateSensors,
    handleCommunicationTest,
    handleToggleDebugMode,
    handleClearLogs
  };
};