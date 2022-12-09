import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faPlus, faX } from '@fortawesome/free-solid-svg-icons';

import '../reset.css';
import '../main.css';
import './recipes.css';
import Toolbar from '../Toolbar';

import { useQuery } from '@wasp/queries';
import getUserTags from '@wasp/queries/getUserTags';
import getUserRecipes from '@wasp/queries/getUserRecipes';
import Footer from '../Footer';

const RecipesPage = (_props) => {
  const { data: tags } = useQuery(getUserTags);
  const { data: recipes } = useQuery(getUserRecipes);

  const [q, setq] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  return (
    <div className="page recipes-page">
      <nav>
        <h1>Recipes</h1>
        <Toolbar active="/recipes">
          <RecipesSearch toolbar tags={tags} q={q} setq={setq} selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
        </Toolbar>
      </nav>
      <main className="recipes-main">
        <RecentRecipes recipes={recipes} />
        <RecipesSearch tags={tags} q={q} setq={setq} selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
        <RecipesList recipes={recipes} tags={tags} q={q} selectedTags={selectedTags} />
        <Footer />
      </main>
    </div>
  );
}

function RecentRecipes(props) {
  // TODO unimplemented (and unstyled)
  return null;
}

function RecipesSearch(props) {
  const tags = props.tags;

  // TODO: flow this state down from the parent
  const { selectedTags, setSelectedTags } = props;
  const toggleTag = (slug) => {
    const tagIdx = selectedTags.indexOf(slug);
    if (tagIdx === -1) {
      setSelectedTags([...selectedTags, slug].sort());
    } else {
      setSelectedTags(selectedTags.filter(s => s != slug));
    }
  }
  const tagActive = (slug) => selectedTags.includes(slug);

  // Compute tag display order: sorted alphebetically by slug (so usually by
  // name), with selected tags listed before unselected tags
  const sortedTags = [];
  if (tags) {
    sortedTags.push(...selectedTags.map(slug => tags.find(t => t.slug === slug)));
    sortedTags.push(...tags.filter(t => !tagActive(t.slug)));
  }

  return (
    <div className="recipes-search" data-toolbar={props.toolbar}>
      <div className="tag-filters-container">
        <button className="tag-filters-clear" data-show={selectedTags.length > 0} onClick={() => setSelectedTags([])}>
          <FontAwesomeIcon icon={faX} />
        </button>
        <ul className="tag-filters">
          {sortedTags.map(tag => (
            <button
              className={tagActive(tag.slug) ? 'recipe-tag active' : 'recipe-tag'}
              style={{ '--tag-hue': tag.color }} key={tag.slug}
              onClick={() => toggleTag(tag.slug)}
            >
              {tag.tag}
            </button>
          ))}
        </ul>
      </div>
      <div className="recipes-search-flow">
        <div className="searchfield-container">
          <input className="searchfield" type="text" value={props.q} onChange={e => props.setq(e.target.value)} placeholder="Search your recipes" />
          <button className="searchfield-clear" data-show={props.q !== ''} onClick={() => props.setq('')}>
            <FontAwesomeIcon icon={faX} />
          </button>
        </div>
        <button className="recipe-new"><FontAwesomeIcon icon={faPlus} /></button>
      </div>
    </div>
  );
}

function RecipesList(props) {
  const recipes = props.recipes;
  const filteredRecipes = recipes && recipes.filter(recipeFilter(props.q, props.selectedTags))
  return (
    <ul className="recipes-list">
      {filteredRecipes && filteredRecipes.map((recipe) => <Recipe recipe={recipe} tags={props.tags} key={recipe.slug} />)}
    </ul>
  )
}

function Recipe(props) {
  return (
    <li>
      <Link className="recipe-item" to={`/recipe/${props.recipe.slug}`}>
        <img className="recipe-thumbnail" src={props.recipe.imageURI} width="auto" alt="" />
        <div className="recipe-content">
          <h2>{props.recipe.title}</h2>
          <ul className="recipe-item-tags">
            {props.tags && props.recipe.tagSlugs.map((slug) => <Tag tags={props.tags} slug={slug} key={slug} />)}
          </ul>
          <p>{props.recipe.description}</p>
        </div>
        <FontAwesomeIcon icon={faEllipsisV} />
      </Link>
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
function recipeFilter(q, selectedTags) {
  return (recipe) => {
    let keep = true;
    if (q) {
      keep = keep && recipe.title.toLowerCase().includes(q.toLowerCase());
    }
    if (Array.isArray(selectedTags) && selectedTags.length > 0) {
      selectedTags.forEach(slug => {
        keep = keep && recipe.tagSlugs.includes(slug);
      });
    }
    return keep;
  }
}

export default RecipesPage;
