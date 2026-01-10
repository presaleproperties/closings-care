import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tool definitions for the AI to use
const tools = [
  {
    type: "function",
    function: {
      name: "create_deal",
      description: "Create a new real estate deal/transaction. Use this when the user wants to add a new deal, client, or transaction.",
      parameters: {
        type: "object",
        properties: {
          client_name: { type: "string", description: "Name of the client" },
          deal_type: { type: "string", enum: ["BUYING", "SELLING", "BOTH"], description: "Type of deal" },
          property_type: { type: "string", enum: ["PRESALE", "RESALE"], description: "Whether this is a presale or resale property" },
          city: { type: "string", description: "City where the property is located, default Vancouver" },
          address: { type: "string", description: "Property address if known" },
          project_name: { type: "string", description: "Project name for presale properties" },
          sale_price: { type: "number", description: "Sale price of the property" },
          gross_commission_est: { type: "number", description: "Estimated gross commission amount" },
          close_date_est: { type: "string", description: "Estimated closing date in YYYY-MM-DD format" },
          advance_date: { type: "string", description: "Advance commission date for presale (YYYY-MM-DD)" },
          advance_commission: { type: "number", description: "Advance commission amount for presale" },
          completion_date: { type: "string", description: "Completion date for presale (YYYY-MM-DD)" },
          completion_commission: { type: "number", description: "Completion commission for presale" },
          notes: { type: "string", description: "Any additional notes about the deal" },
          lead_source: { type: "string", description: "Where the lead came from" },
          buyer_type: { type: "string", description: "Type of buyer (e.g., First-time, Investor)" },
        },
        required: ["client_name", "deal_type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_expense",
      description: "Create a new expense entry. Use this when the user wants to add an expense, cost, or bill.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "Category of expense (e.g., Marketing, Office, Travel, Professional Fees, Vehicle, Taxes, Insurance, Personal, Other)" },
          amount: { type: "number", description: "Amount of the expense in CAD" },
          month: { type: "string", description: "Month the expense applies to in YYYY-MM format" },
          recurrence: { type: "string", enum: ["one-time", "weekly", "monthly", "yearly"], description: "How often this expense recurs" },
          notes: { type: "string", description: "Description or notes about the expense" },
        },
        required: ["category", "amount", "month"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_other_income",
      description: "Create other income entries like rental income, revenue share, etc.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Name/description of the income source" },
          amount: { type: "number", description: "Amount in CAD" },
          recurrence: { type: "string", enum: ["one-time", "monthly", "yearly"], description: "How often this income occurs" },
          start_month: { type: "string", description: "Start month in YYYY-MM format" },
          end_month: { type: "string", description: "End month in YYYY-MM format (optional for recurring)" },
          notes: { type: "string", description: "Additional notes" },
        },
        required: ["name", "amount", "start_month", "recurrence"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_deals_summary",
      description: "Get a summary of the user's deals and transactions",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_payouts_summary",
      description: "Get a summary of upcoming and past payouts/commissions",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_expenses_summary",
      description: "Get a summary of expenses for the current or specified month",
      parameters: {
        type: "object",
        properties: {
          month: { type: "string", description: "Month in YYYY-MM format (defaults to current month)" },
        },
        required: [],
      },
    },
  },
];

const systemPrompt = `You are a helpful AI assistant for a real estate commission tracking app used by Vancouver real estate agents. You help users:
- Add new deals and transactions
- Track expenses and income
- Understand their financial situation
- Manage their commission payouts

Be conversational, friendly, and concise. When users want to add data, use the appropriate tools. Always confirm what was created.

Important context:
- All amounts are in CAD (Canadian dollars)
- Property types are either PRESALE (new construction) or RESALE (existing homes)
- Deal types are BUYING, SELLING, or BOTH
- Presale deals can have advance commission (paid at contract signing) and completion commission (paid at closing)
- Resale deals typically have a single commission paid at closing

When adding deals:
- Always ask for essential info if not provided: client name, deal type, and at least an estimated commission or sale price
- For presale, ask about advance and completion dates/amounts
- For resale, ask about closing date and commission

Be proactive in asking clarifying questions but don't ask too many at once. Keep it conversational.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create Supabase client with user's auth for RLS
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    // First AI call with tools
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools,
        tool_choice: "auto",
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices[0].message;

    // Check if AI wants to call tools
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults: Array<{ role: string; tool_call_id: string; content: string }> = [];

      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        let result: Record<string, unknown>;

        try {
          switch (functionName) {
            case "create_deal": {
              const dealData = {
                client_name: args.client_name,
                deal_type: args.deal_type,
                property_type: args.property_type || "RESALE",
                city: args.city || "Vancouver",
                address: args.address || null,
                project_name: args.project_name || null,
                sale_price: args.sale_price || null,
                gross_commission_est: args.gross_commission_est || null,
                close_date_est: args.close_date_est || null,
                advance_date: args.advance_date || null,
                advance_commission: args.advance_commission || null,
                completion_date: args.completion_date || null,
                completion_commission: args.completion_commission || null,
                notes: args.notes || null,
                lead_source: args.lead_source || null,
                buyer_type: args.buyer_type || null,
                status: "PENDING",
                user_id: userId,
              };

              const { data: deal, error } = await supabase
                .from("deals")
                .insert(dealData)
                .select()
                .single();

              if (error) throw error;

              // Create payouts for the deal
              const payouts = [];
              if (args.property_type === "PRESALE") {
                if (args.advance_commission && args.advance_date) {
                  payouts.push({
                    deal_id: deal.id,
                    user_id: userId,
                    payout_type: "Advance",
                    amount: args.advance_commission,
                    due_date: args.advance_date,
                    status: "PROJECTED",
                  });
                }
                if (args.completion_commission && args.completion_date) {
                  payouts.push({
                    deal_id: deal.id,
                    user_id: userId,
                    payout_type: "Completion",
                    amount: args.completion_commission,
                    due_date: args.completion_date,
                    status: "PROJECTED",
                  });
                }
              } else if (args.gross_commission_est && args.close_date_est) {
                payouts.push({
                  deal_id: deal.id,
                  user_id: userId,
                  payout_type: "Completion",
                  amount: args.gross_commission_est,
                  due_date: args.close_date_est,
                  status: "PROJECTED",
                });
              }

              if (payouts.length > 0) {
                await supabase.from("payouts").insert(payouts);
              }

              result = { success: true, deal_id: deal.id, client_name: deal.client_name, message: "Deal created successfully" };
              break;
            }

            case "create_expense": {
              const expenseData = {
                category: args.category,
                amount: args.amount,
                month: args.month,
                recurrence: args.recurrence || "one-time",
                notes: args.notes || null,
                user_id: userId,
              };

              const { data: expense, error } = await supabase
                .from("expenses")
                .insert(expenseData)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, expense_id: expense.id, category: expense.category, amount: expense.amount };
              break;
            }

            case "create_other_income": {
              const incomeData = {
                name: args.name,
                amount: args.amount,
                recurrence: args.recurrence,
                start_month: args.start_month,
                end_month: args.end_month || null,
                notes: args.notes || null,
                user_id: userId,
              };

              const { data: income, error } = await supabase
                .from("other_income")
                .insert(incomeData)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, income_id: income.id, name: income.name, amount: income.amount };
              break;
            }

            case "get_deals_summary": {
              const { data: deals, error } = await supabase
                .from("deals")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(10);

              if (error) throw error;
              
              const totalDeals = deals?.length || 0;
              const pendingDeals = deals?.filter(d => d.status === "PENDING").length || 0;
              const closedDeals = deals?.filter(d => d.status === "CLOSED").length || 0;
              
              result = {
                total_deals: totalDeals,
                pending: pendingDeals,
                closed: closedDeals,
                recent_deals: deals?.slice(0, 5).map(d => ({
                  client: d.client_name,
                  type: d.deal_type,
                  status: d.status,
                  commission: d.gross_commission_est,
                })),
              };
              break;
            }

            case "get_payouts_summary": {
              const { data: payouts, error } = await supabase
                .from("payouts")
                .select("*, deal:deals(client_name)")
                .order("due_date", { ascending: true });

              if (error) throw error;

              const upcoming = payouts?.filter(p => p.status === "PROJECTED" && new Date(p.due_date) >= new Date()) || [];
              const paid = payouts?.filter(p => p.status === "PAID") || [];
              
              result = {
                upcoming_count: upcoming.length,
                upcoming_total: upcoming.reduce((sum, p) => sum + Number(p.amount), 0),
                paid_count: paid.length,
                paid_total: paid.reduce((sum, p) => sum + Number(p.amount), 0),
                next_payouts: upcoming.slice(0, 3).map(p => ({
                  client: p.deal?.client_name,
                  amount: p.amount,
                  due_date: p.due_date,
                  type: p.payout_type,
                })),
              };
              break;
            }

            case "get_expenses_summary": {
              const targetMonth = args.month || new Date().toISOString().slice(0, 7);
              const { data: expenses, error } = await supabase
                .from("expenses")
                .select("*")
                .eq("month", targetMonth);

              if (error) throw error;

              const total = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
              const byCategory = expenses?.reduce((acc, e) => {
                acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
                return acc;
              }, {} as Record<string, number>) || {};

              result = {
                month: targetMonth,
                total_expenses: total,
                by_category: byCategory,
                expense_count: expenses?.length || 0,
              };
              break;
            }

            default:
              result = { error: "Unknown function" };
          }
        } catch (err) {
          console.error(`Error executing ${functionName}:`, err);
          result = { error: err instanceof Error ? err.message : "Unknown error" };
        }

        toolResults.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }

      // Second AI call with tool results
      const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            assistantMessage,
            ...toolResults,
          ],
        }),
      });

      if (!followUpResponse.ok) {
        throw new Error("Failed to get follow-up response");
      }

      const followUpData = await followUpResponse.json();
      
      return new Response(JSON.stringify({
        message: followUpData.choices[0].message.content,
        tool_calls: assistantMessage.tool_calls.map((tc: any) => ({
          name: tc.function.name,
          result: toolResults.find(tr => tr.tool_call_id === tc.id)?.content,
        })),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // No tool calls, just return the message
    return new Response(JSON.stringify({
      message: assistantMessage.content,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI Assistant error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "An error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
