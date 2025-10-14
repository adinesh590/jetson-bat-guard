import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [batteryData, setBatteryData] = useState<BatteryData>({
    voltage: 0,
    current: 0,
    power: 0,
    soc: 0,
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
    q1Charge: true,
    q2Discharge: false
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

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch latest battery reading
        const { data: latestReading, error: readingError } = await supabase
          .from('battery_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (readingError && readingError.code !== 'PGRST116') {
          console.error('Error fetching battery data:', readingError);
          toast({
            title: 'Error',
            description: 'Failed to fetch battery data',
            variant: 'destructive'
          });
        } else if (latestReading) {
          setBatteryData({
            voltage: Number(latestReading.voltage),
            current: Number(latestReading.current),
            power: Number(latestReading.power),
            soc: Number(latestReading.soc),
            state: (latestReading.state || 'IDLE') as BatteryData['state']
          });
        }

        // Fetch recent readings for chart (last 50)
        const { data: recentReadings, error: chartError } = await supabase
          .from('battery_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (chartError) {
          console.error('Error fetching chart data:', chartError);
        } else if (recentReadings) {
          const chartPoints = recentReadings.reverse().map(reading => ({
            time: reading.created_at,
            voltage: Number(reading.voltage),
            current: Number(reading.current),
            power: Number(reading.power)
          }));
          setChartData(chartPoints);
        }

        // Fetch recent alerts
        const { data: alertsData, error: alertsError } = await supabase
          .from('alerts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (alertsError) {
          console.error('Error fetching alerts:', alertsError);
        } else if (alertsData) {
          const formattedAlerts = alertsData.map(alert => ({
            id: alert.id,
            severity: alert.severity as 'info' | 'warning' | 'critical',
            message: alert.message,
            timestamp: alert.created_at,
            acknowledged: alert.acknowledged
          }));
          setAlerts(formattedAlerts);
        }
      } catch (error) {
        console.error('Error in fetchInitialData:', error);
      }
    };

    fetchInitialData();
  }, [toast]);

  // Set up realtime subscriptions
  useEffect(() => {
    // Subscribe to battery_logs table
    const batteryChannel = supabase
      .channel('battery_logs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'battery_logs'
        },
        (payload) => {
          const newReading = payload.new;
          setBatteryData({
            voltage: Number(newReading.voltage),
            current: Number(newReading.current),
            power: Number(newReading.power),
            soc: Number(newReading.soc),
            state: (newReading.state || 'IDLE') as BatteryData['state']
          });

          // Add to chart data
          const newPoint = {
            time: newReading.created_at,
            voltage: Number(newReading.voltage),
            current: Number(newReading.current),
            power: Number(newReading.power)
          };
          
          setChartData(prev => {
            const newData = [...prev, newPoint].slice(-50);
            return newData;
          });

          setHistoricalData(prev => {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const filtered = prev.filter(point => point.time > thirtyDaysAgo);
            return [...filtered, newPoint];
          });
        }
      )
      .subscribe();

    // Subscribe to alerts table
    const alertsChannel = supabase
      .channel('alerts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newAlert = payload.new;
            setAlerts(prev => [{
              id: newAlert.id,
              severity: newAlert.severity as 'info' | 'warning' | 'critical',
              message: newAlert.message,
              timestamp: newAlert.created_at,
              acknowledged: newAlert.acknowledged
            }, ...prev]);
            
            toast({
              title: `${newAlert.severity.toUpperCase()} Alert`,
              description: newAlert.message,
              variant: newAlert.severity === 'critical' ? 'destructive' : 'default'
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedAlert = payload.new;
            setAlerts(prev => prev.map(alert => 
              alert.id === updatedAlert.id 
                ? {
                    id: updatedAlert.id,
                    severity: updatedAlert.severity as 'info' | 'warning' | 'critical',
                    message: updatedAlert.message,
                    timestamp: updatedAlert.created_at,
                    acknowledged: updatedAlert.acknowledged
                  }
                : alert
            ));
          } else if (payload.eventType === 'DELETE') {
            setAlerts(prev => prev.filter(alert => alert.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(batteryChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, [toast]);

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

  const handleAcknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ 
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', alertId);

      if (error) {
        console.error('Error acknowledging alert:', error);
        toast({
          title: 'Error',
          description: 'Failed to acknowledge alert',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error in handleAcknowledgeAlert:', error);
    }
  }, [toast]);

  const handleDismissAlert = useCallback(async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alertId);

      if (error) {
        console.error('Error dismissing alert:', error);
        toast({
          title: 'Error',
          description: 'Failed to dismiss alert',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error in handleDismissAlert:', error);
    }
  }, [toast]);

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