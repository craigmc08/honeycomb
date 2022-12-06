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

  return context.entities.User.findUnique({
    where: {
      owner: { id: context.user.id },
      slug: args.slug,
    },
    include: {
      ingredients: true,
      tags: {
        select: {
          slug: true,
        },
      },
    },
  });
}
