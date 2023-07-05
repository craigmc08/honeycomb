import { Ingredient, Recipe } from '@wasp/entities';
import { z } from 'zod';

export const GetRecipesParams = z.object({
  q: z.string().optional(),
  tagSlugs: z.array(z.string()).optional(),
})
export type GetRecipesParams = z.infer<typeof GetRecipesParams>
export type GetRecipesResponse = (Pick<Recipe, 'slug' | 'title' | 'description' | 'imageURI'> & {
  tagSlugs: string[],
})[]

export type GetTagsResponse = {
  slug: string,
  tag: string,
  color: string
}[]

export const GetRecipeParams = z.object({
  slug: z.string(),
})
export type GetRecipeParams = z.infer<typeof GetRecipeParams>
export type GetRecipeResponse = Omit<Recipe, 'tags'> & {
  tagSlugs: string[],
  ingredients: Omit<Ingredient, 'recipeId'>[]
}

export const CreateRecipeParams = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  time: z.string(),
  servings: z.string(),
  imageURI: z.string(),
  tagSlugs: z.array(z.string()),
  ingredients: z.array(z.object({
    text: z.string(),
  })),
  instructions: z.string(),
})
export type CreateRecipeParams = z.infer<typeof CreateRecipeParams>
export type CreateRecipeResponse = {
  slug: string,
};

export const UpdateRecipeParams = CreateRecipeParams.partial().required({ slug: true })
export type UpdateRecipeParams = z.infer<typeof UpdateRecipeParams>
export type UpdateRecipeResponse = void;

export const DeleteRecipeParams = z.object({
  slug: z.string()
})
export type DeleteRecipeParams = z.infer<typeof DeleteRecipeParams>
export type DeleteRecipeResponse = void;
