import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookPayload {
  eventType: string;
  data: any;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventType, data, timestamp }: WebhookPayload = await req.json();

    console.log("Triggering webhooks for event:", eventType);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch enabled webhooks for this event type
    const { data: webhooks, error } = await supabase
      .from("webhook_configs")
      .select("*")
      .eq("event_type", eventType)
      .eq("enabled", true);

    if (error) {
      console.error("Error fetching webhooks:", error);
      throw error;
    }

    if (!webhooks || webhooks.length === 0) {
      console.log("No webhooks configured for event type:", eventType);
      return new Response(
        JSON.stringify({ message: "No webhooks configured" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Trigger all webhooks in parallel
    const results = await Promise.allSettled(
      webhooks.map(async (webhook) => {
        try {
          const response = await fetch(webhook.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventType,
              data,
              timestamp,
              webhookId: webhook.id,
            }),
          });

          return {
            webhookId: webhook.id,
            webhookName: webhook.name,
            status: response.status,
            success: response.ok,
          };
        } catch (error: any) {
          console.error(`Error calling webhook ${webhook.name}:`, error);
          return {
            webhookId: webhook.id,
            webhookName: webhook.name,
            error: error.message,
            success: false,
          };
        }
      })
    );

    console.log("Webhook results:", results);

    return new Response(
      JSON.stringify({
        message: `Triggered ${webhooks.length} webhooks`,
        results: results.map((r) => r.status === "fulfilled" ? r.value : r.reason),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in trigger-webhooks function:", error);
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
