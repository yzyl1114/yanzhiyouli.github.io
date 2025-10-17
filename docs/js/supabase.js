import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 正确的 Supabase 配置
const supabaseUrl = 'https://tczipjdwbjmvkkdxogml.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjemlwamR3YmptdmtrZHhvZ21sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTEwMDUsImV4cCI6MjA3NDk4NzAwNX0.myLOB1yrdysB4nAP6U5kPRariYX1rDtRB06M8tP28iU';

console.log('初始化 Supabase:', supabaseUrl);
console.log('API Key 长度:', supabaseKey.length);

// 创建并导出 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});
