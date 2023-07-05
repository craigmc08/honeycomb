import HttpError from '@wasp/core/HttpError.js'
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import * as schema from './recipe.schema.js';
import { GetRecipes, GetTags, GetRecipe } from '@wasp/queries/types.js'
import { CreateRecipe, UpdateRecipe, DeleteRecipe } from '@wasp/actions/types.js'

export const getRecipes: GetRecipes<schema.GetRecipesParams, schema.GetRecipesResponse> = async (userArgs, context) => {
  if (!context.user) { throw new HttpError(401); }
  let args;
  try {
    args = schema.GetRecipesParams.parse(userArgs);
  } catch (e) {
    if (e instanceof ZodError) {
      throw new HttpError(400, fromZodError(e));
    }
    throw e;
  }

  const recipes = await context.entities.Recipe.findMany({
    where: {
      owner: { id: context.user.id },
      tags: args.tagSlugs ? { some: { slug: { in: args.tagSlugs } } } : undefined,
      title: args.q ? { contains: args.q } : undefined,
    },
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

export const getTags: GetTags<void, schema.GetTagsResponse> = async (_args, context) => {
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

export const getRecipe: GetRecipe<schema.GetRecipeParams, schema.GetRecipeResponse> = async (userArgs, context) => {
  if (!context.user) { throw new HttpError(401); }
  let args;
  try {
    args = schema.GetRecipeParams.parse(userArgs);
  } catch (e) {
    if (e instanceof ZodError) {
      throw new HttpError(400, fromZodError(e));
    }
    throw e;
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

  return {
    ...recipe,
    tags: undefined,
    tagSlugs: recipe.tags.map(t => t.slug),
  }
}

export const createRecipe: CreateRecipe<schema.CreateRecipeParams, schema.CreateRecipeResponse> = async (userArgs, context) => {
  if (!context.user) { throw new HttpError(401); }
  let args;
  try {
    args = schema.CreateRecipeParams.parse(userArgs);
  } catch (e) {
    if (e instanceof ZodError) {
      throw new HttpError(400, fromZodError(e));
    }
    throw e;
  }

  if (!authenticateTags(context, context.user.id, args.tagSlugs)) {
    throw new HttpError(400, 'invalid tags');
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
        connect: args.tagSlugs.map(ts => ({ slug: ts }))
      },
      owner: { connect: { id: context.user.id } },
    },
  });
  return { slug };
}

export const deleteRecipe: DeleteRecipe<schema.DeleteRecipeParams, schema.DeleteRecipeResponse> = async (userArgs, context) => {
  if (!context.user) { throw new HttpError(401); }
  let args;
  try {
    args = schema.DeleteRecipeParams.parse(userArgs);
  } catch (e) {
    if (e instanceof ZodError) {
      throw new HttpError(400, fromZodError(e));
    }
    throw e;
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

export const updateRecipe: UpdateRecipe<schema.UpdateRecipeParams, schema.UpdateRecipeResponse> = async (userArgs, context) => {
  if (!context.user) { throw new HttpError(401); }
  let args;
  try {
    args = schema.UpdateRecipeParams.parse(userArgs);
  } catch (e) {
    if (e instanceof ZodError) {
      throw new HttpError(400, fromZodError(e));
    }
    throw e;
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
  if (!authenticateTags(context, context.user.id, args.tagSlugs || [])) {
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
      tags: args.tagSlugs ? {
        set: args.tagSlugs.map(ts => ({ slug: ts })),
      } : undefined,
      // Ingredients will be updated in the next step
      instructions: args.instructions,
    },
  });

  // TODO: is it worth to diff old and new ingredients?
  // TODO: can this be done in 1 query along with the updating the recipe?

  // Remove old ingredients
  await context.entities.Ingredient.deleteMany({
    where: {
      recipe: { id: recipeId },
    },
  });
  // Add new ingredients
  if (args.ingredients) {
    await Promise.all(args.ingredients.map(ingredient => (
      context.entities.Ingredient.create({
        data: {
          text: ingredient.text,
          recipe: { connect: { id: recipeId } },
        },
      })
    )));
  }
}

/**
 * `authenticateTags(context, userId, tagSlugs)` returns true only when:
 *
 * 1) All tag slugs are valid tag slugs
 * 2) Each tag slug represents a tag owned by `userId`
 */
async function authenticateTags(context: any, userId: number, tagSlugs: string[]): Promise<boolean> {
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
function slugFromTitle(title: string): string {
  const alphanumeric = 'abcdefghijklmnopqrtstuvwxyzABCDEFGHIJKLMNOPQRTSTUVWXYZ0123456789';
  const kebabCase = title.replace(/[^a-zA-Z0-9]+/g, '-').replace(/-$/, '').toLowerCase();
  const randomness =
    [...new Array(10)]
      .map(() => alphanumeric[Math.floor(Math.random() * alphanumeric.length)])
      .join('')
    ;
  return `${kebabCase}-${randomness}`;
}
