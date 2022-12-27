import HttpError from '@wasp/core/HttpError.js';

import * as schema from './account.schema.js';

export async function getUsername(userArgs, context) {
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

export async function updateUsername(userArgs, context) {
  if (!context.user) { throw new HttpError(401); }

  let args;
  try {
    args = schema.updateUsername.validateSync(userArgs);
  } catch (e) {
    throw new HttpError(400, e.message);
  }

  await context.entities.User.update({
    where: {
      id: context.user.id,
      data: {
        name: args.username,
      },
    },
  });
}

export async function updateEmail(userArgs, context) {
  if (!context.user) { throw new HttpError(401); }
  let args;
  try {
    args = schema.updateEmail.validateSync(userArgs);
  } catch (e) {
    throw new HttpError(400, e.message);
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
    if (e.code === 'P2002') {
      throw new HttpError(400, 'Email already in use');
    } else {
      throw e;
    }
  }
}
