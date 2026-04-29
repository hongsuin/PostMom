const { z } = require('zod');

const uuidParamSchema = z.object({
  id: z.uuid(),
});

const commentIdParamSchema = z.object({
  commentId: z.uuid(),
});

const postCreateBodySchema = z.object({
  region: z.enum(['위례', '태평']),
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
  linkUrl: z.string().trim().url().optional(),
  author: z.string().trim().min(1).optional(),
  userType: z.enum(['student', 'parent', 'academy']).optional(),
});

const postUpdateBodySchema = z.object({
  region: z.enum(['위례', '태평']),
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
  linkUrl: z.string().trim().url().optional(),
});

const commentCreateBodySchema = z.object({
  content: z.string().trim().min(1),
  author: z.string().trim().min(1).optional(),
  userType: z.enum(['student', 'parent', 'academy']).optional(),
});

module.exports = {
  uuidParamSchema,
  commentIdParamSchema,
  postCreateBodySchema,
  postUpdateBodySchema,
  commentCreateBodySchema,
};
