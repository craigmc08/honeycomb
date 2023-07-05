import HttpError from '@wasp/core/HttpError.js';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import * as schema from './account.schema.js';
import { GetName } from '@wasp/queries/types.js';
import { UpdateName } from '@wasp/actions/types.js';
import { Prisma } from '@prisma/client';

export const getName: GetName<void, schema.GetNameResponse> = async (_args, context) => {
  if (!context.user) { throw new HttpError(401); }

  const user = await context.entities.User.findUnique({
    where: {
      id: context.user.id,
    },
    select: {
      name: true,
    },
  });

  if (!user) {
    // IE001: Impossible, a logged in user can't have an ID that doesn't exist
    throw new HttpError(500, 'IE001');
  }

  return { name: user.name };
}

export const updateName: UpdateName<schema.UpdateNameParams, schema.UpdateNameResponse> = async (userArgs, context) => {
  if (!context.user) { throw new HttpError(401); }

  let args;
  try {
    args = schema.UpdateNameParams.parse(userArgs);
  } catch (e) {
    if (e instanceof ZodError) {
      throw new HttpError(400, fromZodError(e));
    }
    throw e;
  }

  await context.entities.User.update({
    where: {
      id: context.user.id,
    },
    data: {
      name: args.name,
    },
  });
}
