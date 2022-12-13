import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus, faX } from '@fortawesome/free-solid-svg-icons';
import { faFloppyDisk } from '@fortawesome/free-regular-svg-icons';

import { useQuery } from '@wasp/queries';
import getUserRecipe from '@wasp/queries/getUserRecipe';

import './recipeedit.css';
import '../Recipe/recipe.css';
import Footer from '../Footer';
import Page from '../Page';

function RecipeEdit(props) {
  const queryParams = new URLSearchParams(props.location.search);
  if (queryParams.has('slug')) {
    return <RecipeEditorFromExisting slug={queryParams.get('slug')} />;
  } else {
    return <RecipeEditorFromNew />;
  }
}

function RecipeEditorFromExisting({ slug }) {
  const { data: recipe } = useQuery(getUserRecipe, { slug });

  if (!recipe) {
    return <h1>Loading editor...</h1>;
  } else {
    return <RecipeEditor {...recipe} />
  }
}

function RecipeEditorFromNew(props) {
  const newRecipe = {
    title: '',
    description: '',
    imageURI: '',
    time: '',
    servings: '',
    ingredients: [],
    instructions: '',
  };

  return <RecipeEditor {...newRecipe} />;
}

function RecipeEditor(props) {
  const history = useHistory();

  const [modified, setModified] = useState(false);
  const [title, setTitle] = useState(props.title);
  const [description, setDescription] = useState(props.description);
  const [imageURI, setImageURI] = useState(props.imageURI);
  const [time, setTime] = useState(props.time);
  const [servings, setServings] = useState(props.servings);
  const [ingredients, setIngredients] = useState(props.ingredients);
  const [instructions, setInstructions] = useState(props.instructions);

  const saveIfModified = async () => {
    if (modified) {
      if (props.slug) {
        // TODO: call save endpoint
        console.log(`saving to ${props.slug}`);
      } else {
        // TODO: call create endpoint
        console.log(`saving new recipe`);
        // TODO: redirect to edit page for newly created recipe (if save) succeeds
      }
    }
    // If not modified, do nothing
  }
  const set = (newValue, setter, changed) => {
    setModified(modified || changed);
    setter(newValue);
  }
  const update = (e, old, setter) => {
    const changed = e.target.value !== old;
    set(e.target.value, setter, changed);
  }

  const titleInput = (
      <input type="text" value={title} onChange={e => update(e, title, setTitle)} />
  );
  const saveButton = (
    <button title={props.slug ? 'Save' : 'Create recipe'} onClick={() => saveIfModified()} disabled={!modified}>
      <FontAwesomeIcon icon={faFloppyDisk} />
    </button>
  );
  
  return (
    <Page
      className="recipe-page"
      toolbat={[]}
      active="/recipes"
      title={<h1 className="recipe-page-title">{titleInput}{saveButton}</h1>}
    >
      <div className="recipe-header">
        <div className="recipe-hero">
          <img src={imageURI} />
        </div>
        <div className="recipe-buttons">
          <div className="recipe-buttons-flex">
            <button title="Back" onClick={() => history.goBack()}><FontAwesomeIcon icon={faArrowLeft} /></button>
            {saveButton}
          </div>
        </div>
        <h1>{titleInput}</h1>
      </div>
      <main className="recipe-main">
        <div className="recipe-intro">
          <div className="recipe-info">
            <textarea value={description} onChange={e => update(e, description, setDescription)} />
            <div className="recipe-stats">
              <div className="recipe-stat">
                <span className="stat-name">Time</span>
                <input type="text" value={time} onChange={e => update(e, time, setTime)} />
              </div>
              <div className="recipe-stat">
                <span className="stat-name">Servings</span>
                <input type="text" value={servings} onChange={e => update(e, servings, setServings)} />
              </div>
            </div>
            <div className="recipe-tags">
              {null} {/* TODO: tag editor */}
            </div>
          </div>
          <img src={imageURI} />
        </div>
        <div className="recipe-ingredients">
          <h2>Ingredients</h2>
          <IngredientsEditor ingredients={ingredients} setIngredients={setIngredients} update={set} />
        </div>
        <div className="recipe-instructions">
          <h2>Instructions</h2>
          <textarea value={instructions} onChange={e => update(e, instructions, setInstructions)} />
        </div>
      </main>
      <div className="footer-space"></div>
      <Footer />
    </Page>
  );
}

RecipeEditor.propTypes = {
  slug: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  imageURI: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  servings: PropTypes.string.isRequired,
  ingredients: PropTypes.arrayOf(PropTypes.object).isRequired,
  instructions: PropTypes.string.isRequired,
};

function IngredientsEditor(props) {
  const remove = (idx) => {
    const newIngredients = [...props.ingredients.slice(0, idx), ...props.ingredients.slice(idx + 1)];
    props.update(newIngredients, props.setIngredients, true);
  };
  const update = (newValue, idx) => {
    if (newValue === props.ingredients[idx].txt) {
      return;
    }
    
    const newIngredients = [
      ...props.ingredients.slice(0, idx),
      { ...props.ingredients[idx], text: newValue },
      ...props.ingredients.slice(idx + 1)
    ];
    props.update(newIngredients, props.setIngredients, true);
  };
  const add = () => {
    const newIngredients = [...props.ingredients, { id: uuid(), text: '' }];
    props.update(newIngredients, props.setIngredients, true);
  };
  
  // TODO: add ability to drag ingredients to reorder
  return (
    <div className="ingredients-editor">
    <ul className="ingredients-editor">
      {props.ingredients.map((ingredient, i) => (
        <li key={ingredient.id}>
          <button title="Remove ingredient" onClick={() => remove(i)}><FontAwesomeIcon icon={faX} /></button>
          <input type="text" value={ingredient.text} onChange={e => update(e.target.value, i)} />
        </li>
      ))}
    </ul>
    <button title="Add ingredient" onClick={() => add()}><FontAwesomeIcon icon={faPlus} /></button>
    </div>
  )
}

IngredientsEditor.propTypes = {
  ingredients: PropTypes.arrayOf(PropTypes.object).isRequired,
  setIngredients: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired
};

export default RecipeEdit;
