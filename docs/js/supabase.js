// Supabase 客户端（CDN 模块化）
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm'

const supabaseUrl = 'https://tczipjdwbjmvkkdxogml.supabase.co' // 我 Day2 给你
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjemlwamR3YmptdmtrZHhvZ21sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTEwMDUsImV4cCI6MjA3NDk4NzAwNX0.myLOB1yrdysB4nAP6U5kPRariYX1rDtRB06M8tP28iU'               // 我 Day2 给你

export const supabase = createClient(supabaseUrl, supabaseAnonKey)