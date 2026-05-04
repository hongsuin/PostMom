const { createClient } = require('@supabase/supabase-js');
const { AppError } = require('../utils/errors');

let supabaseClient = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new AppError('CONFIG_ERROR', 'Supabase 환경변수가 설정되지 않았습니다.', 500);
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

module.exports = { getSupabaseClient };
