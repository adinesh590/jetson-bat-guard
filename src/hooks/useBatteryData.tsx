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
  };
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
      health: 92
    }
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
        setChartData(prev => {
          const now = new Date().toISOString();
          const newPoint = {
            time: now,
            voltage: batteryData.voltage,
            current: batteryData.current,
            power: batteryData.power
          };
          
          const newData = [...prev, newPoint].slice(-50); // Keep last 50 points
          return newData;
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

  return {
    batteryData,
    chartData,
    controlState,
    mosfetStatus,
    alerts,
    systemStatus,
    handleControlChange,
    handleEmergencyStop,
    handleResetProtection,
    handleAcknowledgeAlert,
    handleDismissAlert
  };
};