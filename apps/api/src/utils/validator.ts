import { ZodSchema } from 'zod';
import { HttpError } from './errors';

export function parse<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (e: any) {
    throw HttpError.badRequest('Invalid input');
  }
}