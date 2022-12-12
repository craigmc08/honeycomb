import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faPlus, faX, faPencil } from '@fortawesome/free-solid-svg-icons';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';

import '../reset.css';
import '../main.css';
import './recipes.css';
import Toolbar from '../Toolbar';

import { useQuery } from '@wasp/queries';
import getUserTags from '@wasp/queries/getUserTags';
import getUserRecipes from '@wasp/queries/getUserRecipes';
import Footer from '../Footer';
import { OverflowMenuProvider, OverflowMenuButton } from '../Components/OverflowMenu';
import { ModalProvider, useModal } from '../Components/Modal';
import Tag from '../Components/Tag';
import Page from '../Page';

const RecipesPage = (_props) => {
  const { data: tags } = useQuery(getUserTags);
  const { data: recipes } = useQuery(getUserRecipes);

  const [q, setq] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  return (
    <ModalProvider>
      <OverflowMenuProvider>
        <Page
          className="recipes-page"
          toolbar={<RecipesSearch toolbar tags={tags} q={q} setq={setq} selectedTags={selectedTags} setSelectedTags={setSelectedTags} />}
          active={"/recipes"}
          title={"Recipes"}
        >
          <h1>Recipes</h1>
          <RecentRecipes tags={tags} recipes={recipes} />
          <RecipesSearch tags={tags} q={q} setq={setq} selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
          <RecipesList recipes={recipes} tags={tags} q={q} selectedTags={selectedTags} />
          <div className="footer-space"></div>
          <Footer />
        </Page>
      </OverflowMenuProvider>
    </ModalProvider>
  );
}

function RecentRecipes(props) {
  // TODO unimplemented (and unstyled)
  // TODO: implement API endpoint for this and grab the data from there;
  const recentRecipes = [
    { slug: 'pigs-in-a-blanket-gd4hzl52kb', imageURI: 'https://hips.hearstapps.com/delish/assets/18/08/1519247372-delish-pigs-in-a-blanket.jpg', tagSlugs: ['appetizer-dl648gjx9f', 'cheap-d85jgz856l'] }
  ];

  const coloredRecentRecipes = recentRecipes && recentRecipes.map(recipe => {
    let color = '0';
    if (props.tags && recipe.tagSlugs.length >= 1) {
      const tag = props.tags.find(t => t.slug === recipe.tagSlugs[0]);
      if (tag) { color = tag.color; }
    }
    return { ...recipe, color };
  });

  return (
    <div className="recipes-recent">
      <h2>Recent Recipes</h2>
      {recentRecipes && (
        recentRecipes.length === 0
          ? (<p>No recent activity</p>)
          : (
            <ul className="recent-list">
              {coloredRecentRecipes.map(({ slug, imageURI, color }) => (
                <li key={slug}>
                  <Link className="recent-item" to={`/recipe/${slug}`} style={{ '--tag-hue': color }}>
                    <img src={imageURI} />
                  </Link>
                </li>
              ))}
            </ul>
          )
      )}
    </div>
  )
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
      setSelectedTags(selectedTags.filter(s => s !== slug));
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
  const actuallyDeleteRecipe = () => {
    console.log(`deleting recipe ${props.recipe.slug}`);
  }
  const deleteModal = useModal((closeModal) => ({
    title: 'Delete Recipe?',
    body: (<p>Once you delete a recipe, it's gone forever. There is no undo.</p>),
    actions: [
      <button className="modal-action warn" onClick={() => { closeModal(); actuallyDeleteRecipe(); }}>Delete</button>,
      <button className="modal-action" onClick={closeModal}>Cancel</button>
    ],
  }));
  const deleteRecipe = () => {
    deleteModal.open();
  };

  const overflowOptions = [
    { name: 'Edit', target: { type: 'link', to: `/recipe/edit?slug=${props.recipe.slug}` }, icon: faPencil },
    { name: 'Delete', target: { type: 'button', onClick: deleteRecipe }, icon: faTrashCan },
  ];

  return (
    <li className="recipe-item">
      <Link className="recipe-item-link" to={`/recipe/${props.recipe.slug}`}>
        <div className="recipe-thumbnail">
          <img src={props.recipe.imageURI} alt="" />
        </div>
        <div className="recipe-content">
          <h2>{props.recipe.title}</h2>
          <ul className="recipe-item-tags">
            {props.tags && props.recipe.tagSlugs.map((slug) => <Tag tags={props.tags} slug={slug} key={slug} />)}
          </ul>
          <p>{props.recipe.description}</p>
        </div>
      </Link>
      <OverflowMenuButton items={overflowOptions} className="recipe-item-overflow" />
    </li>
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
