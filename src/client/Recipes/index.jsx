import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faX, faPencil } from '@fortawesome/free-solid-svg-icons';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';

import '../reset.css';
import '../main.css';
import './recipes.css';

import { useQuery } from '@wasp/queries';
import getTags from '@wasp/queries/getTags';
import getRecipes from '@wasp/queries/getRecipes';
import deleteRecipe from '@wasp/actions/deleteRecipe';

import Footer from '../Footer';
import { OverflowMenuProvider, OverflowMenuButton } from '../Components/OverflowMenu';
import { Modal, ModalAction, ModalActions, ModalBody, ModalTitle } from '../Components/Modal';
import Tag from '../Components/Tag';
import Page from '../Page';
import { useCheckAccountStatus } from '../auth';

const RecipesPage = (_props) => {
  const _ = useCheckAccountStatus(); // Use auth to make sure user gets sent to setup flow after creating an account
  const { t } = useTranslation();

  const { data: tags } = useQuery(getTags);
  const { data: recipes } = useQuery(getRecipes);

  const [q, setq] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  return (
    <OverflowMenuProvider>
      <Page
        className="recipes-page"
        toolbar={<RecipesSearch toolbar tags={tags} q={q} setq={setq} selectedTags={selectedTags} setSelectedTags={setSelectedTags} />}
        active={"/recipes"}
        title={t('Recipes')}
      >
        <h1>{t('Recipes')}</h1>
        <RecentRecipes tags={tags} recipes={recipes} />
        <RecipesSearch tags={tags} q={q} setq={setq} selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
        <RecipesList recipes={recipes} tags={tags} q={q} selectedTags={selectedTags} />
        <div className="footer-space"></div>
        <Footer />
      </Page>
    </OverflowMenuProvider>
  );
}

function RecentRecipes(props) {
  const { t } = useTranslation();

  const recentRecipes = [];
  // const recentRecipes = [
  //   { slug: 'pigs-in-a-blanket-gd4hzl52kb', imageURI: 'https://hips.hearstapps.com/delish/assets/18/08/1519247372-delish-pigs-in-a-blanket.jpg', tagSlugs: ['appetizer-dl648gjx9f', 'cheap-d85jgz856l'] }
  // ];

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
      <h2>{t('Recent Recipes')}</h2>
      {recentRecipes && (
        recentRecipes.length === 0
          ? (<p>{t('No recent activity')}</p>)
          : (
            <ul className="recent-list">
              {coloredRecentRecipes.map(({ slug, imageURI, color }) => (
                <li key={slug}>
                  <Link className="recent-item" to={`/recipe/view/${slug}`} style={{ '--tag-hue': color }}>
                    <img src={imageURI} alt='' />
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
  const { t } = useTranslation();

  const tags = props.tags;

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
        <button title={t('Clear filters')} className="tag-filters-clear" data-show={selectedTags.length > 0} onClick={() => setSelectedTags([])}>
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
          <input className="searchfield" type="text" value={props.q} onChange={e => props.setq(e.target.value)} placeholder={t('Search recipes')} />
          <button title={t('Clear search')} className="searchfield-clear" data-show={props.q !== ''} onClick={() => props.setq('')}>
            <FontAwesomeIcon icon={faX} />
          </button>
        </div>
        <Link title={t('Create recipe')} to="/recipe/edit" className="recipe-new"><FontAwesomeIcon icon={faPlus} /></Link>
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
  const { t } = useTranslation();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const closeDeleteModal = () => setDeleteModalOpen(false);
  const actuallyDeleteRecipe = async () => {
    try {
      await deleteRecipe({ slug: props.recipe.slug });
    } catch (e) {
      console.warn(`Failed to delete recipe ${props.recipe.slug}: ${e}`);
    }
  }

  const overflowOptions = [
    { name: t('Edit (recipe)'), target: { type: 'link', to: `/recipe/edit?slug=${props.recipe.slug}` }, icon: faPencil },
    { name: t('Delete (recipe)'), target: { type: 'button', onClick: () => setDeleteModalOpen(true) }, icon: faTrashCan },
  ];

  return (
    <li className="recipe-item">
      <Link className="recipe-item-link" to={`/recipe/view/${props.recipe.slug}`}>
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
      <Modal
        isOpen={deleteModalOpen}
        onRequestClose={closeDeleteModal}
        contentLabel={t('Delete the recipe?')}
      >
        <ModalTitle requestClose={closeDeleteModal}>{t('Delete the recipe?')}</ModalTitle>
        <ModalBody>
          <p>{t('Delete {{recipe}} warning', { recipe: props.recipe.title })}</p>
        </ModalBody>
        <ModalActions>
          <ModalAction warn requestClose={closeDeleteModal} action={actuallyDeleteRecipe}>
            {t('Delete (recipe)')}
          </ModalAction>
          <ModalAction requestClose={closeDeleteModal}>{t('Cancel')}</ModalAction>
        </ModalActions>
      </Modal>
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
