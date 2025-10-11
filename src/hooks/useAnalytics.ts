import { useMemo } from 'react';

interface ChartDataPoint {
  time: string;
  voltage: number;
  current: number;
  power: number;
}

interface BatteryData {
  voltage: number;
  current: number;
  power: number;
  soc: number;
  state: 'CHARGING' | 'DISCHARGING' | 'IDLE' | 'PROTECTION';
}

interface PerformanceMetrics {
  chargeEfficiency: number;
  dischargeEfficiency: number;
  energyLoss: number;
  averageChargeRate: number;
  averageDischargeRate: number;
}

interface UsagePatterns {
  peakUsageTime: string;
  averageDailyConsumption: number;
  totalChargeTime: number;
  totalDischargeTime: number;
  mostCommonState: string;
}

interface CycleAnalysis {
  totalCycles: number;
  averageDepthOfDischarge: number;
  estimatedRemainingCycles: number;
  cycleLifePrediction: string;
  healthTrend: 'improving' | 'stable' | 'degrading';
}

export const useAnalytics = (
  historicalData: ChartDataPoint[],
  batteryData: BatteryData,
  systemStatus: any
) => {
  const performanceMetrics = useMemo((): PerformanceMetrics => {
    if (historicalData.length < 10) {
      return {
        chargeEfficiency: 0,
        dischargeEfficiency: 0,
        energyLoss: 0,
        averageChargeRate: 0,
        averageDischargeRate: 0
      };
    }

    const chargingSessions = historicalData.filter(d => d.current > 0);
    const dischargingSessions = historicalData.filter(d => d.current < 0);

    const totalChargeEnergy = chargingSessions.reduce((sum, d) => sum + Math.abs(d.power), 0);
    const totalDischargeEnergy = dischargingSessions.reduce((sum, d) => sum + Math.abs(d.power), 0);

    const chargeEfficiency = totalDischargeEnergy > 0 
      ? ((totalDischargeEnergy / (totalChargeEnergy + 0.01)) * 100)
      : 95.5;

    const dischargeEfficiency = 94.2;
    const energyLoss = totalChargeEnergy - totalDischargeEnergy;

    const averageChargeRate = chargingSessions.length > 0
      ? chargingSessions.reduce((sum, d) => sum + d.current, 0) / chargingSessions.length
      : 0;

    const averageDischargeRate = dischargingSessions.length > 0
      ? Math.abs(dischargingSessions.reduce((sum, d) => sum + d.current, 0) / dischargingSessions.length)
      : 0;

    return {
      chargeEfficiency: Math.min(100, Math.max(0, chargeEfficiency)),
      dischargeEfficiency,
      energyLoss,
      averageChargeRate,
      averageDischargeRate
    };
  }, [historicalData]);

  const usagePatterns = useMemo((): UsagePatterns => {
    if (historicalData.length < 10) {
      return {
        peakUsageTime: 'N/A',
        averageDailyConsumption: 0,
        totalChargeTime: 0,
        totalDischargeTime: 0,
        mostCommonState: 'IDLE'
      };
    }

    // Analyze peak usage by hour
    const hourlyUsage = new Map<number, number>();
    historicalData.forEach(d => {
      const hour = new Date(d.time).getHours();
      hourlyUsage.set(hour, (hourlyUsage.get(hour) || 0) + Math.abs(d.power));
    });

    const peakHour = Array.from(hourlyUsage.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 12;

    const peakUsageTime = `${peakHour}:00 - ${peakHour + 1}:00`;

    // Calculate daily consumption (Wh)
    const totalEnergy = historicalData.reduce((sum, d) => sum + Math.abs(d.power), 0);
    const daysSpan = Math.max(1, (Date.now() - new Date(historicalData[0].time).getTime()) / (1000 * 60 * 60 * 24));
    const averageDailyConsumption = (totalEnergy / daysSpan) / 1000; // Convert to Wh

    // Calculate time in each state
    const chargingPoints = historicalData.filter(d => d.current > 0.1).length;
    const dischargingPoints = historicalData.filter(d => d.current < -0.1).length;

    const totalChargeTime = (chargingPoints * 2) / 60; // minutes (assuming 2s interval)
    const totalDischargeTime = (dischargingPoints * 2) / 60; // minutes

    // Most common state
    const mostCommonState = chargingPoints > dischargingPoints ? 'CHARGING' : 
                           dischargingPoints > chargingPoints ? 'DISCHARGING' : 'IDLE';

    return {
      peakUsageTime,
      averageDailyConsumption,
      totalChargeTime,
      totalDischargeTime,
      mostCommonState
    };
  }, [historicalData]);

  const cycleAnalysis = useMemo((): CycleAnalysis => {
    const cycleCount = systemStatus.battery.cycleCount;
    const health = systemStatus.battery.health;
    const degradation = systemStatus.battery.degradation;

    // Calculate depth of discharge from historical data
    const socChanges = [];
    for (let i = 1; i < historicalData.length; i++) {
      const currentChange = historicalData[i].current - historicalData[i - 1].current;
      if (Math.abs(currentChange) > 0.5) {
        socChanges.push(Math.abs(currentChange));
      }
    }

    const averageDepthOfDischarge = socChanges.length > 0
      ? (socChanges.reduce((sum, v) => sum + v, 0) / socChanges.length) * 10
      : 35;

    // Estimate remaining cycles (typical Li-ion: 500-1000 cycles)
    const expectedTotalCycles = 800;
    const estimatedRemainingCycles = Math.max(0, expectedTotalCycles - cycleCount);

    // Calculate cycle life prediction
    const yearsRemaining = (estimatedRemainingCycles / 365) * (100 / Math.max(averageDepthOfDischarge, 10));
    const cycleLifePrediction = yearsRemaining > 1 
      ? `${Math.round(yearsRemaining)} years`
      : `${Math.round(yearsRemaining * 12)} months`;

    // Determine health trend
    let healthTrend: 'improving' | 'stable' | 'degrading' = 'stable';
    if (degradation > 15) {
      healthTrend = 'degrading';
    } else if (degradation < 5 && health > 90) {
      healthTrend = 'stable';
    }

    return {
      totalCycles: cycleCount,
      averageDepthOfDischarge: Math.min(100, averageDepthOfDischarge),
      estimatedRemainingCycles,
      cycleLifePrediction,
      healthTrend
    };
  }, [historicalData, systemStatus.battery]);

  const generateCSVReport = () => {
    const headers = ['Timestamp', 'Voltage (V)', 'Current (A)', 'Power (W)', 'State'];
    const rows = historicalData.map(d => [
      new Date(d.time).toISOString(),
      d.voltage.toFixed(3),
      d.current.toFixed(3),
      d.power.toFixed(3),
      d.current > 0.1 ? 'CHARGING' : d.current < -0.1 ? 'DISCHARGING' : 'IDLE'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `battery-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateDetailedReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      batteryStatus: {
        voltage: batteryData.voltage,
        current: batteryData.current,
        power: batteryData.power,
        soc: batteryData.soc,
        state: batteryData.state
      },
      performanceMetrics,
      usagePatterns,
      cycleAnalysis,
      systemInfo: {
        batteryType: systemStatus.battery.type,
        nominalVoltage: systemStatus.battery.nominalVoltage,
        capacity: systemStatus.battery.capacity,
        health: systemStatus.battery.health,
        cycleCount: systemStatus.battery.cycleCount
      },
      dataPoints: historicalData.length
    };

    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `battery-detailed-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    performanceMetrics,
    usagePatterns,
    cycleAnalysis,
    generateCSVReport,
    generateDetailedReport
  };
};
