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
