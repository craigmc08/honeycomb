import * as yup from 'yup';

import HttpError from '@wasp/core/HttpError.js'

const getUserRecipesSchema = yup.object().shape({
  q: yup.string(),
  tagSlugs: yup.array(yup.string()),
});
export async function getUserRecipes(args, context) {
  if (!context.user) { throw new HttpError(401); }
  if (!getUserRecipesSchema.isValidSync(args)) {
    throw new HttpError(400);
  }

  const where = {
    owner: { id: context.user.id },
  };
  if (args.tagSlugs) {
    const tagIds = await context.entities.RecipeTag.findMany({
      where: {
        owner: { id: context.user.id },
        slug: { in: args.tagSlugs },
      },
      select: { id: true },
    });
    where.tags = { in: tagIds };
  }
  if (args.q) {
    // TODO: get Full-Text Search working https://www.prisma.io/docs/concepts/components/prisma-client/full-text-search
    where.title = { contains: args.q };
  }

  const recipes = await context.entities.Recipe.findMany({
    where,
    select: {
      slug: true,
      title: true,
      description: true,
      imageURI: true,
      tags: {
        select: {
          slug: true,
        },
      },
    },
    orderBy: { title: 'asc' }
  });
  return recipes.map(recipe => ({
    slug: recipe.slug,
    title: recipe.title,
    description: recipe.description,
    imageURI: recipe.imageURI,
    tagSlugs: recipe.tags.map(tag => tag.slug),
  }));
}

export async function getUserTags(_args, context) {
  if (!context.user) { throw new HttpError(401); }

  return context.entities.RecipeTag.findMany({
    where: {
      owner: { id: context.user.id },
    },
    select: {
      slug: true,
      tag: true,
      color: true,
    },
  });
}

const getUserRecipeSchema = yup.object().shape({
  slug: yup.string().required(),
});
export async function getUserRecipe(args, context) {
  if (!context.user) { throw new HttpError(401); }
  if (!getUserRecipeSchema.validateSync(args)) {
    throw new HttpError(400);
  }
  const recipe = await context.entities.Recipe.findUnique({
    where: {
      slug: args.slug,
    },
    include: {
      ingredients: {
        select: {
          id: true,
          text: true,
        },
      },
      tags: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (recipe === null || recipe.ownerId !== context.user.id) {
    throw new HttpError(404);
  }

  recipe.tagSlugs = recipe.tags.map(t => t.slug);
  delete recipe.tags;

  return recipe;
}

const createUserRecipeSchema = yup.object().shape({
  title: yup.string().required(),
  description: yup.string().required(),
  time: yup.string().required(),
  servings: yup.string().required(),
  imageURI: yup.string(),
  tagSlugs: yup.array(yup.string()).required(),
  ingredients: yup.array(yup.object().shape({
    text: yup.string().required(),
  })).required(),
  instructions: yup.string().required(),
});
export async function createUserRecipe(args, context) {
  if (!context.user) { throw new HttpError(401); }

  if (!createUserRecipeSchema.isValidSync(args)) {
    throw new HttpError(400);
  }

  if (!authenticateTags(args.tagSlugs)) {
    throw new HttpError(400);
  }

  await context.entities.Recipe.create({
    data: {
      slug: slugFromTitle(args.title),
      title: args.title,
      description: args.description,
      time: args.time,
      servings: args.servings,
      imageURI: args.imageURI,
      instructions: args.instructions,
      ingredients: {
        create: args.ingredients.map(ingredient => (
          { text: ingredient.text }
        )),
      },
      tags: {
        connect: args.tagSlugs.map(ts => ({slug: ts}))
      },
    },
  });
}

export function deleteUserRecipe(args, context) {
  if (!context.user) { throw new HttpError(401); }

  // TODO: check to make sure context.user is owner of the given recipe
  // (if no ownership or it doesn't exist, respond with BAD REQUEST)  
}

export function updateUserRecipe(args, context) {
  if (!context.user) { throw new HttpError(401); }

  // TODO: check in DB if context.user is owner of the given recipe
  // TODO: check to make sure user owns all of the given tags
  // (if no ownership or any of these are missing, respond with BAD REQUEST)

  // TODO: update data in recipe entity

  // TODO: figure out ingredients list change set and update it
  // (and insert new ingredient rows when needed)
} 

/**
 * `authenticateTags(context, userId, tagSlugs)` returns true only when:
 *
 * 1) All tag slugs are valid tag slugs
 * 2) Each tag slug represents a tag owned by `userId`
 */
async function authenticateTags(context, userId, tagSlugs) {
  // Will only be `tagSlugs.length` if the conditions above are met
  const nTags = await context.entities.RecipeTag.count({
    where: {
      ownerId: userId,
      in: tagSlugs,
    },
  });
  if (nTags !== tagSlugs.length) {
    return false;
  }
  return true;
}

/**
 * Generate a slug from a title:
 * - Converts title to kebab case
 * - Appends 10 character alphanumeric string
 */
function slugFromTitle(title) {
  const alphanumeric = 'abcdefghijklmnopqrtstuvwxyzABCDEFGHIJKLMNOPQRTSTUVWXYZ0123456789';
  const kebabCase = title.replace(/[^a-zA-Z0-9]+/, '-');
  const randomness =
    [...new Array(10)]
    .map(() => alphanumeric[Math.floor(Math.random() * alphanumeric.length)])
    .join('')
  ;
  return `${kebabCase}-${randomness}`;
}
