import Joi from 'joi';

export const createPostSchema = Joi.object({
  content: Joi.string().required().min(1).max(5000).messages({
    'string.empty': 'Post content is required',
    'string.min': 'Post content must be at least 1 character long',
    'string.max': 'Post content cannot exceed 5000 characters',
  }),
  hashtags: Joi.array().items(
    Joi.string().pattern(/^[a-zA-Z0-9_]+$/).messages({
      'string.pattern.base': 'Hashtags can only contain letters, numbers and underscores',
    })
  ).optional(),
});

export const updatePostSchema = Joi.object({
  content: Joi.string().min(1).max(5000).messages({
    'string.min': 'Post content must be at least 1 character long',
    'string.max': 'Post content cannot exceed 5000 characters',
  }),
  hashtags: Joi.array().items(
    Joi.string().pattern(/^[a-zA-Z0-9_]+$/).messages({
      'string.pattern.base': 'Hashtags can only contain letters, numbers and underscores',
    })
  ).optional(),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });