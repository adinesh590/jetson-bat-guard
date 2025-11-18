import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ControlCommandPayload {
  command_type: "mosfet_toggle" | "emergency_stop" | "reset_protection";
  mosfet_name?: "qc" | "qd1" | "qd2" | "qd3";
  mosfet_state?: boolean;
  data?: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const payload: ControlCommandPayload = await req.json();

    // Validate the command
    if (!payload.command_type) {
      return new Response(
        JSON.stringify({ error: "command_type is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // For MOSFET toggle commands, validate required fields
    if (payload.command_type === "mosfet_toggle") {
      if (!payload.mosfet_name || payload.mosfet_state === undefined) {
        return new Response(
          JSON.stringify({ 
            error: "mosfet_name and mosfet_state are required for mosfet_toggle commands" 
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Validate mosfet_name
      const validMosfets = ["qc", "qd1", "qd2", "qd3"];
      if (!validMosfets.includes(payload.mosfet_name)) {
        return new Response(
          JSON.stringify({ 
            error: `Invalid mosfet_name. Must be one of: ${validMosfets.join(", ")}` 
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    console.log("Creating control command:", {
      command_type: payload.command_type,
      mosfet_name: payload.mosfet_name,
      mosfet_state: payload.mosfet_state,
      user_id: user.id,
    });

    // Insert the control command
    const { data: command, error: insertError } = await supabase
      .from("control_commands")
      .insert({
        command_type: payload.command_type,
        mosfet_name: payload.mosfet_name,
        mosfet_state: payload.mosfet_state,
        data: payload.data || {},
        created_by: user.id,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting control command:", insertError);
      throw insertError;
    }

    console.log(`Control command created successfully: ${command.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        command,
        message: "Control command created successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-control-command function:", error);
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
