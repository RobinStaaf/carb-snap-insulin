import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_meal_logs",
  title: "List meal logs",
  description: "List the signed-in user's recent meal logs (carbs, insulin dose, timestamp).",
  inputSchema: {
    limit: z.number().int().min(1).max(200).optional().describe("Max number of logs to return (default 50)."),
    since: z.string().optional().describe("Optional ISO timestamp; only logs created at or after this time are returned."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, since }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("meal_logs")
      .select("id, timestamp, carbs_estimate, insulin_dose, insulin_ratio, created_at")
      .eq("user_id", ctx.getUserId())
      .order("timestamp", { ascending: false })
      .limit(limit ?? 50);
    if (since) query = query.gte("timestamp", since);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { logs: data ?? [] },
    };
  },
});
