import HttpError from '@wasp/core/HttpError.js'

export async function getUserRecipes(args, context) {
  if (!context.user) { throw new HttpError(401); }

  const where = {
    owner: { id: context.user.id },
  };
  if (Array.isArray(args.tagSlugs) && args.tagSlugs.every(x => typeof x === 'string')) {
    const tagIds = await context.entities.RecipeTag.findMany({
      where: {
        owner: { id: context.user.id },
        slug: { in: args.tagSlugs },
      },
      select: { id: true },
    });
    where.tags = { in: tagIds };
  }
  if (typeof args.q === 'string') {
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

export async function getUserRecipe(args, context) {
  if (!context.user) { throw new HttpError(401); }
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

export function createUserRecipe(args, context) {
  if (!context.user) { throw new HttpError(401); }

  // TODO: check to make sure context.user is owner of all tagSlugs used
  // (if not owner/not exist, respond with BAD REQUEST)

  // TODO: insert recipe fields, and insert ingredients
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
