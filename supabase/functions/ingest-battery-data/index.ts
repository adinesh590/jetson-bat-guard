import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BatteryDataPayload {
  voltage: number;
  current: number;
  power?: number;
  soc: number;
  soh?: number;
  mosfet_states?: string;
  cycle_count?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: BatteryDataPayload = await req.json();

    console.log("Received battery data:", data);

    // Validate required fields
    if (
      data.voltage === undefined ||
      data.current === undefined ||
      data.soc === undefined
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: voltage, current, soc" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Determine state based on current
    let state = 'IDLE';
    if (data.current > 0.1) {
      state = 'CHARGING';
    } else if (data.current < -0.1) {
      state = 'DISCHARGING';
    }

    // Insert battery data into database
    const { error: insertError } = await supabase
      .from("battery_logs")
      .insert({
        voltage: data.voltage,
        current: data.current,
        power: data.power || data.voltage * data.current,
        soc: data.soc,
        soh: data.soh || null,
        mosfet_states: data.mosfet_states || null,
        cycle_count: data.cycle_count || null,
        state: state,
      });

    if (insertError) {
      console.error("Error inserting battery data:", insertError);
      throw insertError;
    }

    // Check for critical conditions and create alerts
    const alerts = [];

    if (data.soc < 20) {
      alerts.push({
        title: "Battery Critical",
        severity: data.soc < 10 ? "critical" : "warning",
        message: `Battery level ${data.soc < 10 ? 'critically' : ''} low: ${data.soc}%`,
      });
    }

    if (data.voltage && data.voltage < 10) {
      alerts.push({
        title: "Low Voltage",
        severity: "warning",
        message: `Low voltage detected: ${data.voltage}V`,
      });
    }

    // Insert alerts if any
    if (alerts.length > 0) {
      const { error: alertError } = await supabase
        .from("alerts")
        .insert(alerts);

      if (alertError) {
        console.error("Error inserting alerts:", alertError);
      } else {
        console.log(`Created ${alerts.length} alerts`);
        
        // Trigger webhooks for alerts
        for (const alert of alerts) {
          await supabase.functions.invoke("trigger-webhooks", {
            body: {
              eventType: alert.title.toLowerCase().replace(' ', '_'),
              data: alert,
              timestamp: new Date().toISOString(),
            },
          });
        }
      }
    }

    console.log("Battery data ingested successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Battery data received",
        alerts_created: alerts.length 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in ingest-battery-data function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
