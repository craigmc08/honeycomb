import React, { useState } from 'react';

import '../reset.css';
import '../main.css';
import './recipes.css';
import Nav from '../Nav';

import { useQuery } from '@wasp/queries';
import getUserTags from '@wasp/queries/getUserTags';
import getUserRecipes from '@wasp/queries/getUserRecipes';

const RecipesPage = (_props) => {
  const { data: tags, isFetching, error } = useQuery(getUserTags);

  const [q, setq] = useState('');

  return (
    <main className="page">
      <Nav title="Recipes" />
      <RecipesSearch tags={tags} q={q} setq={setq} />
      <RecipesList tags={tags} q={q} />
    </main>
  );
}

function RecipesSearch(props) {
  const tags = props.tags;

  return (
    <section className="recipes-search">
      <input type="text" value={props.q} onChange={e => props.setq(e.target.value)} placeholder="Search your recipes" />
    </section>
  );
}

function RecipesList(props) {
  const { data: recipes, isFetching, error } = useQuery(getUserRecipes);
  const filteredRecipes = recipes && recipes.filter(recipeFilter(props.q))
  return (
    <ul className="recipes-list">
      {filteredRecipes && filteredRecipes.map((recipe) => <Recipe recipe={recipe} tags={props.tags} key={recipe.slug} />)}
    </ul>
  )
};

function Recipe(props) {
  return (
    <li className="recipe-item">
      <p>{props.recipe.title}</p>
      <ul className="recipe-item-tags">
        {props.tags && props.recipe.tagSlugs.map((slug) => <Tag tags={props.tags} slug={slug} key={slug} />)}
      </ul>
    </li>
  );
}

function Tag(props) {
  const tag = props.tags.find(t => t.slug === props.slug);
  return (
    <div className="recipe-tag" style={{ '--tag-hue': tag.color }}>{tag.tag}</div>
  );
}

/**
 * 
 * @param {string} q 
 * @returns 
 */
function recipeFilter(q) {
  return (recipe) => {
    let keep = true;
    if (q) {
      keep = keep && recipe.title.toLowerCase().includes(q.toLowerCase());
    }
    return keep;
  }
}

export default RecipesPage;
