import Joi from 'joi';

export const createHashtagSchema = Joi.object({
  tag: Joi.string().required().min(1).max(255).pattern(/^[a-zA-Z0-9_]+$/).messages({
    'string.empty': 'Hashtag is required',
    'string.min': 'Hashtag must be at least 1 character long',
    'string.max': 'Hashtag cannot exceed 255 characters',
    'string.pattern.base': 'Hashtags can only contain letters, numbers and underscores',
  }),
});

export const updateHashtagSchema = Joi.object({
  tag: Joi.string().min(1).max(255).pattern(/^[a-zA-Z0-9_]+$/).messages({
    'string.min': 'Hashtag must be at least 1 character long',
    'string.max': 'Hashtag cannot exceed 255 characters',
    'string.pattern.base': 'Hashtags can only contain letters, numbers and underscores',
  }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });