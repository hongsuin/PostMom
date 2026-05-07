const { createClient } = require('@supabase/supabase-js');
const { AppError } = require('../utils/errors');

let supabaseClient = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new AppError('CONFIG_ERROR', 'Supabase 환경변수가 설정되지 않았습니다.', 500);
  }

  supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  return supabaseClient;
}

module.exports = { getSupabaseClient };
