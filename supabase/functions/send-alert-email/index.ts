import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertEmailRequest {
  to: string;
  alertTitle: string;
  alertMessage: string;
  severity: string;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, alertTitle, alertMessage, severity, timestamp }: AlertEmailRequest = await req.json();

    console.log("Sending alert email:", { to, alertTitle, severity });

    const emailResponse = await resend.emails.send({
      from: "Battery Monitor <onboarding@resend.dev>",
      to: [to],
      subject: `[${severity.toUpperCase()}] Battery Alert: ${alertTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: ${severity === 'critical' ? '#dc2626' : severity === 'warning' ? '#f59e0b' : '#3b82f6'};">
            Battery Alert
          </h1>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">${alertTitle}</h2>
            <p style="font-size: 16px; color: #374151;">${alertMessage}</p>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">
              <strong>Severity:</strong> ${severity}<br/>
              <strong>Time:</strong> ${new Date(timestamp).toLocaleString()}
            </p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated alert from your Battery Monitoring System.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending alert email:", error);
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
