import Joi from 'joi';

export const createFollowSchema = Joi.object({
  followingId: Joi.number().integer().positive().required().messages({
    'number.base': 'Following ID must be a number',
    'number.integer': 'Following ID must be an integer',
    'number.positive': 'Following ID must be positive',
    'any.required': 'Following ID is required',
  }),
});