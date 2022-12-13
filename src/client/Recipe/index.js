import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPencil } from '@fortawesome/free-solid-svg-icons';

import { useQuery } from '@wasp/queries';
import getRecipe from '@wasp/queries/getRecipe';
import getTags from '@wasp/queries/getTags';

import './recipe.css';
import Footer from '../Footer';
import Tag from '../Components/Tag';
import Page from '../Page';

function Recipe(props) {
  const slug = props.match.params.slug;

  const history = useHistory();
  const { data: recipe } = useQuery(getRecipe, { slug });
  const { data: tags } = useQuery(getTags);

  const pageTitle =
    !recipe
      ? 'Loading...'
      : <h1 className="recipe-page-title">{recipe.title}<Link to={`/recipe/edit?slug=${slug}`}><FontAwesomeIcon icon={faPencil} /></Link></h1>
  ;

  return (
    <Page
      className="recipe-page"
      toolbar={[]}
      active="/recipes"
      title={pageTitle}
    >
      <div className="recipe-header">
        <div className="recipe-hero">
          <img src={recipe && recipe.imageURI} />
        </div>
        <div className="recipe-buttons">
          <div className="recipe-buttons-flex">
            <button title="Back" onClick={() => history.goBack()}><FontAwesomeIcon icon={faArrowLeft} /></button>
            <Link title="Edit" to={`/recipe/edit?slug=${slug}`}><FontAwesomeIcon icon={faPencil} /></Link>
          </div>
        </div>
        <h1>{recipe ? recipe.title : 'Loading...'}</h1>
      </div>
      <main className="recipe-main">
        <div className="recipe-intro">
          <div className="recipe-info">
            <p className="recipe-description">{recipe && recipe.description}</p>
            <div className="recipe-stats">
              <div className="recipe-stat"><span className="stat-name">Time</span>{recipe && recipe.time}</div>
              <div className="recipe-stat"><span className="stat-name">Servings</span>{recipe && recipe.servings}</div>
            </div>
            <div className="recipe-tags">
              {tags && recipe && recipe.tagSlugs.map(slug => (<Tag tags={tags} slug={slug} key={slug} />))}
            </div>
          </div>
          <img src={recipe && recipe.imageURI} />
        </div>
        <div className="recipe-ingredients">
          <h2>Ingredients</h2>
          <ul>
            {recipe && recipe.ingredients.map((ingredient, i) => (<li key={i}>{ingredient.text}</li>))}
          </ul>
        </div>
        <div className="recipe-instructions">
          <h2>Instructions</h2>
          <RichText content={recipe ? recipe.instructions : ''} />
        </div>
      </main>
      <div className="footer-space"></div>
      <Footer />
    </Page>
  )
}

function RichText(props) {
  // Implement actual rich text rendering (probably markdown based) with support for
  // some formatting.
  return (
    <div className={`richtext ${props.className || ''}`}>
      {props.content.split('\n').map((para, i) => (<p key={i}>{para}</p>))}
    </div>
  )
}

RichText.propTypes = {
  content: PropTypes.string.isRequired,
  className: PropTypes.string
};

export default Recipe;
