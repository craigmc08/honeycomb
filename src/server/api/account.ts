import HttpError from '@wasp/core/HttpError.js';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import * as schema from './account.schema.js';
import { GetUsername } from '@wasp/queries/types.js';
import { UpdateEmail, UpdateUsername } from '@wasp/actions/types.js';
import { Prisma } from '@prisma/client';

export const getUsername: GetUsername<void, schema.GetUsernameResponse> = async (_args, context) => {
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

  return { username: user.name };
}

export const updateUsername: UpdateUsername<schema.UpdateUsernameParams, schema.UpdateUsernameResponse> = async (userArgs, context) => {
  if (!context.user) { throw new HttpError(401); }

  let args;
  try {
    args = schema.UpdateUsernameParams.parse(userArgs);
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
      name: args.username,
    },
  });
}

export const updateEmail: UpdateEmail<schema.UpdateEmailParams, schema.UpdateEmailResponse> = async (userArgs, context) => {
  if (!context.user) { throw new HttpError(401); }
  let args;
  try {
    args = schema.UpdateEmailParams.parse(userArgs);
  } catch (e) {
    if (e instanceof ZodError) {
      throw new HttpError(400, fromZodError(e));
    }
    throw e;
  }

  try {
    await context.entities.User.update({
      where: {
        id: context.user.id,
      },
      data: {
        username: args.email,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        throw new HttpError(400, 'Email already in use');
      }
    }
    throw e;
  }
}
