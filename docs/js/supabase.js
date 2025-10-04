// Supabase 客户端（CDN 模块化）
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm'

const supabaseUrl = 'https://your-project.supabase.co' // 我 Day2 给你
const supabaseAnonKey = 'your-anon-key'               // 我 Day2 给你

export const supabase = createClient(supabaseUrl, supabaseAnonKey)