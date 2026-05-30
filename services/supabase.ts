// ไฟล์ที่ใช้เชื่อมต่อไปยัง Supabase และจัดการกับการเรียก API
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ltpcupwedyroxhyozwon.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0cGN1cHdlZHlyb3hoeW96d29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NzYwMTksImV4cCI6MjA5NTE1MjAxOX0.qYR5ciFqJWxi1gfYUDlh_j_Pc0buQw1fBjjFF0WselY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
