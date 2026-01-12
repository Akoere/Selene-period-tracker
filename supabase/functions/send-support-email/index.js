// Setup: 
// 1. supabase secrets set RESEND_API_KEY=re_123...
// 2. supabase functions deploy send-support-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email, message, user_id } = await req.json();

    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Selene Support <onboarding@resend.dev>", // Change this if you have a domain
        to: [email, "support@example.com"], // Send to user AND support
        subject: `Support Request from ${name}`,
        html: `
          <h1>Support Ticket Received</h1>
          <p>Hi ${name},</p>
          <p>We received your message:</p>
          <blockquote>${message}</blockquote>
          <p>We will get back to you shortly!</p>
          <hr />
          <p>User ID: ${user_id || 'Guest'}</p>
        `,
      }),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
