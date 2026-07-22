import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listMealLogs from "./tools/list-meal-logs";
import getDailySummary from "./tools/get-daily-summary";
import getProfile from "./tools/get-profile";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "carbsmart-mcp",
  title: "CarbSmart",
  version: "0.1.0",
  instructions:
    "Tools for CarbSmart — a personal carb & insulin tracker. Use `list_meal_logs` to browse recent meals, `get_daily_summary` to total carbs/insulin for a day, and `get_profile` for the user's settings. All tools act as the signed-in user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listMealLogs, getDailySummary, getProfile],
});
