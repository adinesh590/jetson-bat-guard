import { useState, useEffect, useCallback } from 'react';

interface BatteryData {
  voltage: number;
  current: number;
  power: number;
  soc: number;
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
  q1Charge: boolean;
  q2Discharge: boolean;
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

export const useBatteryData = () => {
  const [batteryData, setBatteryData] = useState<BatteryData>({
    voltage: 3.85,
    current: 0.5,
    power: 1.925,
    soc: 65,
    state: 'CHARGING'
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
    q1Charge: true,
    q2Discharge: false
  });

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      severity: 'warning',
      message: 'Battery voltage approaching minimum threshold',
      timestamp: new Date().toISOString(),
      acknowledged: false
    }
  ]);

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
      q1Status: 'idle',
      q2Status: 'idle',
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
        message: 'System initialized successfully'
      },
      {
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: 'info',
        message: 'Battery monitoring started'
      }
    ],
    debugMode: false
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!controlState.emergencyStop) {
        setBatteryData(prev => {
          const voltageVariation = (Math.random() - 0.5) * 0.1;
          const currentVariation = (Math.random() - 0.5) * 0.2;
          
          let newVoltage = Math.max(3.0, Math.min(4.2, prev.voltage + voltageVariation));
          let newCurrent = prev.current + currentVariation;
          
          // Simulate charging/discharging behavior
          if (controlState.chargeEnabled && prev.soc < 100) {
            newCurrent = Math.max(0, newCurrent);
          } else if (controlState.dischargeEnabled && prev.soc > 0) {
            newCurrent = Math.min(0, newCurrent);
          } else {
            newCurrent = 0;
          }
          
          const newPower = newVoltage * newCurrent;
          let newSoc = prev.soc;
          
          // Update SoC based on current
          if (newCurrent > 0.1) {
            newSoc = Math.min(100, prev.soc + 0.1);
          } else if (newCurrent < -0.1) {
            newSoc = Math.max(0, prev.soc - 0.1);
          }
          
          // Determine state
          let newState: BatteryData['state'] = 'IDLE';
          if (controlState.protectionMode) {
            newState = 'PROTECTION';
          } else if (newCurrent > 0.1) {
            newState = 'CHARGING';
          } else if (newCurrent < -0.1) {
            newState = 'DISCHARGING';
          }

          return {
            voltage: newVoltage,
            current: newCurrent,
            power: newPower,
            soc: Math.round(newSoc),
            state: newState
          };
        });

        // Update chart data
        const now = new Date().toISOString();
        const newPoint = {
          time: now,
          voltage: batteryData.voltage,
          current: batteryData.current,
          power: batteryData.power
        };
        
        setChartData(prev => {
          const newData = [...prev, newPoint].slice(-50); // Keep last 50 points for display
          return newData;
        });
        
        // Store in historical data (keep 30 days of data)
        setHistoricalData(prev => {
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
          const filtered = prev.filter(point => point.time > thirtyDaysAgo);
          return [...filtered, newPoint];
        });

        // Update MOSFET status based on control state
        setMosfetStatus({
          q1Charge: controlState.chargeEnabled && !controlState.emergencyStop,
          q2Discharge: controlState.dischargeEnabled && !controlState.emergencyStop
        });
      }
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [controlState, batteryData]);

  // Generate alerts based on battery data
  useEffect(() => {
    const now = new Date().toISOString();
    
    if (batteryData.soc <= 10 && !alerts.some(a => a.message.includes('Critical battery'))) {
      setAlerts(prev => [...prev, {
        id: Date.now().toString(),
        severity: 'critical',
        message: 'Critical battery level: Immediate charging required',
        timestamp: now,
        acknowledged: false
      }]);
    }
    
    if (batteryData.voltage >= 4.1 && !alerts.some(a => a.message.includes('Over-voltage'))) {
      setAlerts(prev => [...prev, {
        id: Date.now().toString(),
        severity: 'warning',
        message: 'Over-voltage detected: Check charging system',
        timestamp: now,
        acknowledged: false
      }]);
    }
  }, [batteryData, alerts]);

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
  }, []);

  const handleResetProtection = useCallback(() => {
    setControlState(prev => ({
      ...prev,
      protectionMode: false
    }));
  }, []);

  const handleAcknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  const handleDismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const handleRunMosfetTest = useCallback(() => {
    setDiagnostics(prev => ({
      ...prev,
      mosfetTest: {
        q1Status: 'testing',
        q2Status: 'testing',
        lastTest: new Date().toLocaleString()
      }
    }));

    setTimeout(() => {
      setDiagnostics(prev => ({
        ...prev,
        mosfetTest: {
          q1Status: 'passed',
          q2Status: 'passed',
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