import Joi from 'joi';

export const createLikeSchema = Joi.object({
  postId: Joi.number().integer().positive().required().messages({
    'number.base': 'Post ID must be a number',
    'number.integer': 'Post ID must be an integer',
    'number.positive': 'Post ID must be positive',
    'any.required': 'Post ID is required',
  }),
});