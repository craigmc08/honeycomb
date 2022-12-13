import * as yup from 'yup';

export const getRecipes = yup.object().shape({
  q: yup.string(),
  tagSlugs: yup.array(yup.string()),
});

export const getRecipe = yup.object().shape({
  slug: yup.string().required(),
});

export const createRecipe = yup.object().shape({
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

export const deleteRecipe = yup.object().shape({
  slug: yup.string().required(),
});

