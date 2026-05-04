const { getSupabaseClient } = require('../lib/supabase');
const { AppError } = require('../utils/errors');

async function authMiddleware(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError('UNAUTHORIZED', '인증이 필요합니다.', 401);
    }

    const token = header.slice(7);
    const supabase = getSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError('UNAUTHORIZED', '유효하지 않은 토큰입니다.', 401);
    }

    req.userId = user.id;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authMiddleware };
