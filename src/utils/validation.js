import Joi from 'joi';

export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

export const registerSchema = Joi.object({
  username: Joi.string().min(4).max(25).required(),
  password: Joi.string().min(8).required()
});
