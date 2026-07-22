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
  name: "get_daily_summary",
  title: "Get daily carb summary",
  description: "Get total carbs and insulin doses for the signed-in user on a given date (YYYY-MM-DD, UTC). Defaults to today.",
  inputSchema: {
    date: z.string().optional().describe("Date in YYYY-MM-DD (UTC). Omit for today."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ date }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const day = date ?? new Date().toISOString().slice(0, 10);
    const start = `${day}T00:00:00.000Z`;
    const end = `${day}T23:59:59.999Z`;
    const { data, error } = await supabaseForUser(ctx)
      .from("meal_logs")
      .select("carbs_estimate, insulin_dose")
      .eq("user_id", ctx.getUserId())
      .gte("timestamp", start)
      .lte("timestamp", end);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const totals = (data ?? []).reduce(
      (acc, r: any) => ({
        carbs: acc.carbs + Number(r.carbs_estimate ?? 0),
        insulin: acc.insulin + Number(r.insulin_dose ?? 0),
        count: acc.count + 1,
      }),
      { carbs: 0, insulin: 0, count: 0 },
    );
    const summary = { date: day, ...totals };
    return {
      content: [{ type: "text", text: JSON.stringify(summary) }],
      structuredContent: summary,
    };
  },
});
