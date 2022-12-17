import HttpError from '@wasp/core/HttpError.js'

import * as schema from './recipe.schema.js';

export async function getRecipes(userArgs, context) {
  if (!context.user) { throw new HttpError(401); }
  let args;
  try {
    args = schema.getRecipes.validateSync(userArgs);
  } catch (e) {
    throw new HttpError(400, e.message);
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

export async function getTags(_userArgs, context) {
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

export async function getRecipe(userArgs, context) {
  if (!context.user) { throw new HttpError(401); }
  let args;
  try {
    args = schema.getRecipe.validateSync(userArgs);
  } catch (e) {
    throw new HttpError(400, e.message);
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

export async function createRecipe(userArgs, context) {
  if (!context.user) { throw new HttpError(401); }
  let args;
  try {
    args = schema.createRecipe.validateSync(userArgs);
  } catch (e) {
    throw new HttpError(400, e.message);
  }

  if (!authenticateTags(context, context.user.id, args.tagSlugs)) {
    throw new HttpError(400);
  }

  const slug = slugFromTitle(args.title);
  await context.entities.Recipe.create({
    data: {
      slug,
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
      owner: { connect: { id: context.user.id } },
    },
  });
  return { slug };
}

export async function deleteRecipe(userArgs, context) {
  if (!context.user) { throw new HttpError(401); }
  let args;
  try {
    args = schema.deleteRecipe.validateSync(userArgs);
  } catch (e) {
    throw new HttpError(400, e.message);
  }

  // Make sure the logged in user owns the recipe
  const recipe = await context.entities.Recipe.findUnique({
    where: { slug: args.slug },
    select: { ownerId: true, id: true },
  });
  if (!recipe || recipe.ownerId !== context.user.id) {
    throw new HttpError(404);
  }

  // User owns the recipe, so its safe to delete it
  await context.entities.Ingredient.deleteMany({
    where: {
      recipe: { id: recipe.id },
    },
  });
  await context.entities.Recipe.delete({
    where: { id: recipe.id },
  });
}

export async function updateRecipe(userArgs, context) {
  if (!context.user) { throw new HttpError(401); }
  let args;
  try {
    args = schema.updateRecipe.validateSync(userArgs);
  } catch (e) {
    throw new HttpError(400, e.message);
  }

  // Check that the recipe to update exists and is owned by the logged in user
  const oldRecipe = await context.entities.Recipe.findUnique({
    where: {
      slug: args.slug,
    },
    select: {
      owner: { select: { id: true } },
      id: true,
    },
  });
  if (!oldRecipe || oldRecipe.owner.id !== context.user.id) {
    // Respond with NotFound if the recipe doesn't exist or the user doesn't have
    // privilege to modify it
    throw new HttpError(404, 'Recipe not found');
  }
  const { id: recipeId } = oldRecipe;

  // Ensure ownership and existence of tags
  if (!authenticateTags(context, context.user.id, args.tagSlugs)) {
    throw new HttpError(404, 'Tag not found');
  }

  // Update recipe data
  await context.entities.Recipe.update({
    where: {
      id: recipeId,
    },
    data: {
      title: args.title,
      description: args.description,
      time: args.time,
      servings: args.servings,
      imageURI: args.imageURI,
      tags: {
        set: args.tagSlugs.map(ts => ({ slug: ts })),
      },
      // Ingredients will be updated in the next step
      instructions: args.instructions,
    },
  });

  // TODO: is it worth to diff old and new ingredients?

  // Remove old ingredients
  await context.entities.Ingredient.deleteMany({
    where: {
      recipe: { id: recipeId },
    },
  });
  // Add new ingredients
  await Promise.all(args.ingredients.map(ingredient => (
    context.entities.Ingredient.create({
      data: {
        text: ingredient.text,
        recipe: { connect: { id: recipeId } },
      },
    })
  )));
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
      slug: {
        in: tagSlugs,
      },
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
  const kebabCase = title.replace(/[^a-zA-Z0-9]+/g, '-').replace(/-$/, '').toLowerCase();
  const randomness =
    [...new Array(10)]
    .map(() => alphanumeric[Math.floor(Math.random() * alphanumeric.length)])
    .join('')
  ;
  return `${kebabCase}-${randomness}`;
}
