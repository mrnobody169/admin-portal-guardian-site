
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = "https://wvyleuiwbmbpfpmrstgg.supabase.co";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const url = new URL(req.url);
    const path = url.pathname.split("/api")[1];

    // User Management API
    if (path === "/users") {
      if (req.method === "GET") {
        const { data, error } = await supabase.from("users").select();
        
        if (error) throw error;
        
        return new Response(JSON.stringify({ users: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      if (req.method === "POST") {
        const body = await req.json();
        const { data, error } = await supabase.from("users").insert(body).select();
        
        if (error) throw error;
        
        return new Response(JSON.stringify({ user: data[0] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201,
        });
      }
    }
    
    // Bank Accounts API
    if (path.startsWith("/bank-accounts")) {
      // Get all bank accounts
      if (path === "/bank-accounts" && req.method === "GET") {
        const { data, error } = await supabase.from("bank_accounts").select();
        
        if (error) throw error;
        
        return new Response(JSON.stringify({ accounts: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      // Get specific bank account
      if (path.match(/\/bank-accounts\/\d+/) && req.method === "GET") {
        const id = path.split("/")[2];
        const { data, error } = await supabase.from("bank_accounts").select().eq("id", id).single();
        
        if (error) throw error;
        
        return new Response(JSON.stringify({ account: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      // Create bank account
      if (path === "/bank-accounts" && req.method === "POST") {
        const body = await req.json();
        const { data, error } = await supabase.from("bank_accounts").insert(body).select();
        
        if (error) throw error;
        
        return new Response(JSON.stringify({ account: data[0] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201,
        });
      }
    }
    
    // Logs API
    if (path === "/logs") {
      if (req.method === "GET") {
        const { data, error } = await supabase.from("logs").select().order("created_at", { ascending: false });
        
        if (error) throw error;
        
        return new Response(JSON.stringify({ logs: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      if (req.method === "POST") {
        const body = await req.json();
        const { data, error } = await supabase.from("logs").insert({
          ...body,
          created_at: new Date().toISOString(),
        }).select();
        
        if (error) throw error;
        
        return new Response(JSON.stringify({ log: data[0] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201,
        });
      }
    }

    // Authentication API
    if (path === "/auth/login") {
      if (req.method === "POST") {
        const { email, password } = await req.json();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        return new Response(JSON.stringify({ session: data.session, user: data.user }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    // Default response for undefined routes
    return new Response(JSON.stringify({ error: "Not Found" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 404,
    });
  } catch (error) {
    console.error("API error:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
