import { useMemo } from 'react';
import { TimeRange } from '@/components/dashboard/TimeRangeSelector';
import { DateRange } from 'react-day-picker';

interface ChartDataPoint {
  time: string;
  voltage: number;
  current: number;
  power: number;
}

interface Statistics {
  voltage: { avg: number; peak: number; min: number };
  current: { avg: number; peak: number; min: number };
  power: { avg: number; peak: number; min: number };
  energy: { consumed: number; stored: number };
}

export const useHistoricalData = (
  historicalData: ChartDataPoint[],
  timeRange: TimeRange,
  customDateRange?: DateRange
) => {
  const filteredData = useMemo(() => {
    if (!historicalData.length) return [];

    const now = new Date();
    let startTime: Date;

    if (timeRange === 'custom' && customDateRange?.from) {
      startTime = customDateRange.from;
      const endTime = customDateRange.to || now;
      return historicalData.filter(point => {
        const pointTime = new Date(point.time);
        return pointTime >= startTime && pointTime <= endTime;
      });
    }

    switch (timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
    }

    return historicalData.filter(point => new Date(point.time) >= startTime);
  }, [historicalData, timeRange, customDateRange]);

  const statistics = useMemo((): Statistics => {
    if (!filteredData.length) {
      return {
        voltage: { avg: 0, peak: 0, min: 0 },
        current: { avg: 0, peak: 0, min: 0 },
        power: { avg: 0, peak: 0, min: 0 },
        energy: { consumed: 0, stored: 0 }
      };
    }

    const voltages = filteredData.map(d => d.voltage);
    const currents = filteredData.map(d => d.current);
    const powers = filteredData.map(d => d.power);

    // Calculate averages
    const avgVoltage = voltages.reduce((a, b) => a + b, 0) / voltages.length;
    const avgCurrent = currents.reduce((a, b) => a + b, 0) / currents.length;
    const avgPower = powers.reduce((a, b) => a + b, 0) / powers.length;

    // Calculate peak and min values
    const peakVoltage = Math.max(...voltages);
    const minVoltage = Math.min(...voltages);
    const peakCurrent = Math.max(...currents);
    const minCurrent = Math.min(...currents);
    const peakPower = Math.max(...powers);
    const minPower = Math.min(...powers);

    // Calculate energy (Wh) - integrate power over time
    let energyConsumed = 0;
    let energyStored = 0;

    for (let i = 1; i < filteredData.length; i++) {
      const timeDiff = (new Date(filteredData[i].time).getTime() - 
                       new Date(filteredData[i-1].time).getTime()) / (1000 * 60 * 60); // hours
      const avgPowerSegment = (filteredData[i].power + filteredData[i-1].power) / 2;
      const energy = Math.abs(avgPowerSegment) * timeDiff;

      if (avgPowerSegment < 0) {
        energyConsumed += energy; // Discharging (negative power)
      } else {
        energyStored += energy; // Charging (positive power)
      }
    }

    return {
      voltage: { avg: avgVoltage, peak: peakVoltage, min: minVoltage },
      current: { avg: avgCurrent, peak: peakCurrent, min: minCurrent },
      power: { avg: avgPower, peak: peakPower, min: minPower },
      energy: { consumed: energyConsumed, stored: energyStored }
    };
  }, [filteredData]);

  return { filteredData, statistics };
};