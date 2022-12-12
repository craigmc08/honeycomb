import React from 'react';
import { Link, useHistory } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPencil } from '@fortawesome/free-solid-svg-icons';

import { useQuery } from '@wasp/queries';
import getUserRecipe from '@wasp/queries/getUserRecipe';
import getUserTags from '@wasp/queries/getUserTags';

import './recipe.css';
import Toolbar from '../Toolbar';
import Footer from '../Footer';
import Tag from '../Components/Tag';
import Page from '../Page';

function Recipe(props) {
  const slug = props.match.params.slug;

  const history = useHistory();
  const { data: recipe } = useQuery(getUserRecipe, { slug });
  const { data: tags } = useQuery(getUserTags);

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
            <button onClick={() => history.goBack()}><FontAwesomeIcon icon={faArrowLeft} /></button>
            <Link to={`/recipe/edit?slug=${slug}`}><FontAwesomeIcon icon={faPencil} /></Link>
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
          {recipe && recipe.instructions.split('\\n').map((para, i) => (<p key={i}>{para}</p>))}
        </div>
      </main>
      <div className="footer-space"></div>
      <Footer />
    </Page>
  )
}

export default Recipe;