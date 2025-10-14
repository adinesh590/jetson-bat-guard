# Hardware Integration Guide

## Overview
This guide explains how to send battery data from your Jetson device to the Battery Management System.

## Endpoint
Your Jetson should POST data to:
```
https://wbkqyibvhjstnyzxjlkf.supabase.co/functions/v1/ingest-battery-data
```

## Authentication
No authentication required - the endpoint is public and configured to accept data from any source.

## Data Format
Send a POST request with JSON payload:

```json
{
  "voltage": 12.5,
  "current": 2.3,
  "power": 28.75,
  "soc": 85,
  "soh": 98,
  "temperature": 35,
  "cell_voltages": [3.7, 3.72, 3.68, 3.71],
  "charge_status": "charging",
  "protection_status": "normal",
  "mosfet_status": {
    "charge": true,
    "discharge": true
  }
}
```

### Required Fields
- `voltage` (number): Battery voltage in volts
- `current` (number): Current in amperes (positive for charging, negative for discharging)
- `soc` (number): State of Charge percentage (0-100)

### Optional Fields
- `power` (number): Power in watts (calculated if not provided)
- `soh` (number): State of Health percentage (defaults to 100)
- `temperature` (number): Temperature in Celsius (defaults to 25)
- `cell_voltages` (array): Individual cell voltages
- `charge_status` (string): "charging", "discharging", "idle"
- `protection_status` (string): Current protection mode
- `mosfet_status` (object): MOSFET switch states

## Python Example

```python
import requests
import time
import json

# Configuration
API_ENDPOINT = "https://wbkqyibvhjstnyzxjlkf.supabase.co/functions/v1/ingest-battery-data"

def read_battery_data():
    """
    Replace this with your actual battery reading logic
    """
    # Example: Read from your BMS via UART/I2C/CAN
    return {
        "voltage": 12.5,
        "current": 2.3,
        "soc": 85,
        "temperature": 35,
    }

def send_battery_data(data):
    """
    Send battery data to the cloud platform
    """
    try:
        response = requests.post(
            API_ENDPOINT,
            json=data,
            timeout=10
        )
        response.raise_for_status()
        print(f"✓ Data sent successfully: {response.json()}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"✗ Error sending data: {e}")
        return False

def main():
    """
    Main loop - reads and sends battery data every 5 seconds
    """
    print("Starting battery data transmission...")
    print(f"Sending to: {API_ENDPOINT}")
    
    while True:
        try:
            # Read battery data
            battery_data = read_battery_data()
            
            # Send to cloud
            send_battery_data(battery_data)
            
            # Wait before next reading
            time.sleep(5)
            
        except KeyboardInterrupt:
            print("\nStopping data transmission...")
            break
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
```

## Testing from Jetson

1. Save the Python script above to your Jetson
2. Install required package: `pip3 install requests`
3. Run the script: `python3 battery_sender.py`

## Test with curl

```bash
curl -X POST https://wbkqyibvhjstnyzxjlkf.supabase.co/functions/v1/ingest-battery-data \
  -H "Content-Type: application/json" \
  -d '{
    "voltage": 12.5,
    "current": 2.3,
    "soc": 85,
    "temperature": 35
  }'
```

## Automatic Alerts
The system automatically creates alerts when:
- SOC drops below 20% (warning) or 10% (critical)
- Temperature exceeds 45°C (warning) or 50°C (critical)
- Voltage drops below 10V (warning)

## Webhook Integration
When alerts are created, configured webhooks will be triggered automatically.

## Data Visualization
Once data is being sent, the dashboard will automatically update to show:
- Real-time battery metrics
- Historical charts
- Active alerts
- System status

## Recommended Update Frequency
- Normal monitoring: Every 5-10 seconds
- Critical situations: Every 1-2 seconds
- Low power mode: Every 30-60 seconds

## Troubleshooting

### Connection Issues
- Verify Tailscale is running: `sudo tailscale status`
- Test internet connectivity: `ping -c 3 google.com`
- Check endpoint accessibility: `curl https://wbkqyibvhjstnyzxjlkf.supabase.co`

### Data Not Appearing
- Check response from API (should return success: true)
- Verify JSON format is correct
- Check Jetson system time is synchronized

### Need Help?
Check the edge function logs for detailed error messages.
