const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('./middlewares/auth');
const { requestContext } = require('./middlewares/requestContext');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const { validate } = require('./middlewares/validate');
const { AppError } = require('./utils/errors');
const { getSupabaseClient } = require('./lib/supabase');
const { sessionIdParamsSchema, chatBodySchema } = require('./schemas/chat.schema');
const {
  uuidParamSchema,
  commentIdParamSchema,
  postCreateBodySchema,
  postUpdateBodySchema,
  commentCreateBodySchema,
} = require('./schemas/community.schema');

const app = express();
const prisma = new PrismaClient();
const RAG_URL = process.env.RAG_URL || 'http://localhost:8000';
const supabase = getSupabaseClient();

const corsOrigin = process.env.CORS_ORIGIN || /^http:\/\/localhost(:\d+)?$/;
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
const openApiDocument = YAML.load(path.join(__dirname, 'docs', 'openapi.yaml'));

app.use(helmet());
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(requestContext);
app.use('/api', apiLimiter);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

async function getPostByIdWithCounts(postId) {
  const { data, error } = await supabase.from('community_posts').select('*').eq('id', postId).maybeSingle();
  if (error) throw new AppError('DB_ERROR', error.message, 500);
  return data ?? null;
}

async function recomputeEngagement(postId) {
  const { count: likeCount, error: likeError } = await supabase
    .from('community_post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);
  if (likeError) throw new AppError('DB_ERROR', likeError.message, 500);

  const { count: commentCount, error: commentError } = await supabase
    .from('community_post_comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);
  if (commentError) throw new AppError('DB_ERROR', commentError.message, 500);

  const { error: updateError } = await supabase
    .from('community_posts')
    .update({
      likes: likeCount ?? 0,
      comments: commentCount ?? 0,
    })
    .eq('id', postId);
  if (updateError) throw new AppError('DB_ERROR', updateError.message, 500);
}

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.get(
  '/api/community/posts',
  asyncHandler(async (_req, res) => {
    const { data: posts, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new AppError('DB_ERROR', error.message, 500);
    res.json(posts);
  }),
);

app.get(
  '/api/community/posts/:id',
  validate({ params: uuidParamSchema }),
  asyncHandler(async (req, res) => {
    const post = await getPostByIdWithCounts(req.params.id);
    if (!post) {
      throw new AppError('POST_NOT_FOUND', '게시글을 찾을 수 없습니다.', 404);
    }
    res.json(post);
  }),
);

app.post(
  '/api/community/posts',
  validate({ body: postCreateBodySchema }),
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { region, title, content, linkUrl, author, userType } = req.body;
    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: req.userId,
        author: author ?? '익명',
        user_type: userType ?? null,
        region,
        title,
        content,
        link_url: linkUrl ?? null,
        link_title: linkUrl ?? null,
      })
      .select('*')
      .single();
    if (error) throw new AppError('DB_ERROR', error.message, 500);
    const created = data ?? (await getPostByIdWithCounts(data.id));
    res.status(201).json(created);
  }),
);

app.patch(
  '/api/community/posts/:id',
  validate({ params: uuidParamSchema, body: postUpdateBodySchema }),
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data: postOwner, error: ownerError } = await supabase
      .from('community_posts')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();
    if (ownerError) throw new AppError('DB_ERROR', ownerError.message, 500);
    if (!postOwner) {
      throw new AppError('POST_NOT_FOUND', '게시글을 찾을 수 없습니다.', 404);
    }
    if (postOwner.user_id !== req.userId) {
      throw new AppError('FORBIDDEN', '수정 권한이 없습니다.', 403);
    }

    const { region, title, content, linkUrl } = req.body;
    const { error: updateError } = await supabase
      .from('community_posts')
      .update({
        region,
        title,
        content,
        link_url: linkUrl ?? null,
        link_title: linkUrl ?? null,
      })
      .eq('id', id);
    if (updateError) throw new AppError('DB_ERROR', updateError.message, 500);

    const updated = await getPostByIdWithCounts(id);
    res.json(updated);
  }),
);

app.delete(
  '/api/community/posts/:id',
  validate({ params: uuidParamSchema }),
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data: postOwner, error: ownerError } = await supabase
      .from('community_posts')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();
    if (ownerError) throw new AppError('DB_ERROR', ownerError.message, 500);
    if (!postOwner) {
      throw new AppError('POST_NOT_FOUND', '게시글을 찾을 수 없습니다.', 404);
    }
    if (postOwner.user_id !== req.userId) {
      throw new AppError('FORBIDDEN', '삭제 권한이 없습니다.', 403);
    }

    const { error: deleteError } = await supabase.from('community_posts').delete().eq('id', id);
    if (deleteError) throw new AppError('DB_ERROR', deleteError.message, 500);
    res.json({ ok: true });
  }),
);

app.get(
  '/api/community/posts/:id/comments',
  validate({ params: uuidParamSchema }),
  asyncHandler(async (req, res) => {
    const { data: comments, error } = await supabase
      .from('community_post_comments')
      .select('*')
      .eq('post_id', req.params.id)
      .order('created_at', { ascending: true });
    if (error) throw new AppError('DB_ERROR', error.message, 500);
    res.json(comments);
  }),
);

app.get(
  '/api/community/likes/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { data: rows, error } = await supabase
      .from('community_post_likes')
      .select('post_id')
      .eq('user_id', req.userId);
    if (error) throw new AppError('DB_ERROR', error.message, 500);
    res.json(rows);
  }),
);

app.post(
  '/api/community/posts/:id/comments',
  validate({ params: uuidParamSchema, body: commentCreateBodySchema }),
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content, author, userType } = req.body;

    const { data: targetPost, error: targetError } = await supabase
      .from('community_posts')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    if (targetError) throw new AppError('DB_ERROR', targetError.message, 500);
    if (!targetPost) {
      throw new AppError('POST_NOT_FOUND', '게시글을 찾을 수 없습니다.', 404);
    }

    const { data: inserted, error: insertError } = await supabase
      .from('community_post_comments')
      .insert({
        post_id: id,
        user_id: req.userId,
        author: author ?? '익명',
        user_type: userType ?? null,
        content,
      })
      .select('*')
      .single();
    if (insertError) throw new AppError('DB_ERROR', insertError.message, 500);

    await recomputeEngagement(id);

    res.status(201).json(inserted);
  }),
);

app.delete(
  '/api/community/comments/:commentId',
  validate({ params: commentIdParamSchema }),
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { data: row, error: rowError } = await supabase
      .from('community_post_comments')
      .select('id, post_id, user_id')
      .eq('id', commentId)
      .maybeSingle();
    if (rowError) throw new AppError('DB_ERROR', rowError.message, 500);
    if (!row) {
      throw new AppError('COMMENT_NOT_FOUND', '댓글을 찾을 수 없습니다.', 404);
    }
    if (row.user_id !== req.userId) {
      throw new AppError('FORBIDDEN', '삭제 권한이 없습니다.', 403);
    }

    const { error: deleteError } = await supabase.from('community_post_comments').delete().eq('id', commentId);
    if (deleteError) throw new AppError('DB_ERROR', deleteError.message, 500);
    await recomputeEngagement(row.post_id);

    res.json({ ok: true });
  }),
);

app.post(
  '/api/community/posts/:id/likes',
  validate({ params: uuidParamSchema }),
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data: targetPost, error: targetError } = await supabase
      .from('community_posts')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    if (targetError) throw new AppError('DB_ERROR', targetError.message, 500);
    if (!targetPost) {
      throw new AppError('POST_NOT_FOUND', '게시글을 찾을 수 없습니다.', 404);
    }

    const { error: likeError } = await supabase
      .from('community_post_likes')
      .insert({ post_id: id, user_id: req.userId });
    if (likeError && likeError.code !== '23505') {
      throw new AppError('DB_ERROR', likeError.message, 500);
    }
    await recomputeEngagement(id);

    res.status(201).json({ ok: true });
  }),
);

app.delete(
  '/api/community/posts/:id/likes',
  validate({ params: uuidParamSchema }),
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error: unlikeError } = await supabase
      .from('community_post_likes')
      .delete()
      .eq('post_id', id)
      .eq('user_id', req.userId);
    if (unlikeError) throw new AppError('DB_ERROR', unlikeError.message, 500);
    await recomputeEngagement(id);

    res.json({ ok: true });
  }),
);

app.get(
  '/api/sessions',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const sessions = await prisma.chatSession.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });
    res.json(sessions);
  }),
);

app.get(
  '/api/sessions/:id/messages',
  validate({ params: sessionIdParamsSchema }),
  authMiddleware,
  asyncHandler(async (req, res) => {
    const session = await prisma.chatSession.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!session) {
      throw new AppError('SESSION_NOT_FOUND', '세션을 찾을 수 없습니다.', 404);
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
    });

    return res.json(messages);
  }),
);

app.post(
  '/api/chat',
  validate({ body: chatBodySchema }),
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { question, sessionId } = req.body;

    let session;
    if (sessionId) {
      session = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId: req.userId },
      });
      if (!session) {
        throw new AppError('FORBIDDEN', '접근 권한이 없습니다.', 403);
      }
    } else {
      session = await prisma.chatSession.create({
        data: { userId: req.userId, title: question.slice(0, 40) },
      });
    }

    await prisma.chatMessage.create({
      data: { sessionId: session.id, role: 'user', content: question },
    });

    const ragRes = await fetch(`${RAG_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    if (!ragRes.ok) {
      throw new AppError('RAG_ERROR', 'RAG 서버 오류', 502);
    }

    const ragData = await ragRes.json();

    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'bot',
        content: ragData.answer,
        sources: ragData.sources ?? [],
      },
    });

    await prisma.chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    });

    return res.json({
      sessionId: session.id,
      answer: ragData.answer,
      sources: ragData.sources ?? [],
    });
  }),
);

app.delete(
  '/api/sessions/:id',
  validate({ params: sessionIdParamsSchema }),
  authMiddleware,
  asyncHandler(async (req, res) => {
    const session = await prisma.chatSession.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!session) {
      throw new AppError('SESSION_NOT_FOUND', '세션을 찾을 수 없습니다.', 404);
    }

    await prisma.chatSession.delete({ where: { id: session.id } });
    return res.json({ ok: true });
  }),
);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app, prisma };
