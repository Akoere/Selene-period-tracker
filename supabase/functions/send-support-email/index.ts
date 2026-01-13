// Setup: 
// 1. supabase secrets set RESEND_API_KEY=re_123...
// 2. supabase functions deploy send-support-email

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// @ts-ignore
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
// @ts-ignore
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
// @ts-ignore
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email, message, user_id: bodyUserId } = await req.json();

    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY");
    }

    // Initialize Supabase Client to verify user
    const supabase = createClient(
      SUPABASE_URL ?? '',
      SUPABASE_ANON_KEY ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    )

    // Get the User from the Token (Secure Verification)
    const { data: { user } } = await supabase.auth.getUser();
    
    // Determine trusted identifiers
    const verifiedEmail = user?.email || email; // Fallback to body email if guest (but tag as guest)
    const verifiedUserId = user?.id || 'Guest';
    const isGuest = !user;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Selene Support <onboarding@resend.dev>", 
        // 🔴 FIX: ONLY send to yourself. Removed 'email' from this list.
        to: ["ndifonvictor4@gmail.com"], 
        subject: `Support Request from ${name}${isGuest ? ' (Guest)' : ''}`,
        // I updated the HTML so you can still see the user's email inside the message body
        html: `
          <h1>New Support Ticket</h1>
          <p><strong>From:</strong> ${name} (${verifiedEmail})</p>
          <p><strong>User ID:</strong> ${verifiedUserId} ${isGuest ? '(Unverified)' : '(Verified)'}</p>
          <hr />
          <h3>Message:</h3>
          <blockquote>${message}</blockquote>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
        console.error("Resend Error:", data);
        return new Response(JSON.stringify(data), { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});