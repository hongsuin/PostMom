const { z } = require('zod');

const numericId = z.coerce.number().int().positive();

const sessionIdParamsSchema = z.object({
  id: numericId,
});

const chatBodySchema = z.object({
  question: z.string().trim().min(1, '질문을 입력해주세요.'),
  sessionId: numericId.optional(),
});

module.exports = { sessionIdParamsSchema, chatBodySchema };
