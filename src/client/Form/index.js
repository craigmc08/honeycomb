import React, { useState } from 'react';
import Footer from '../Footer';
import './form.css';

const Form = (props) => {
  const [flashMessage, setFlashMessage] = useState(undefined);

  if (!props.onSubmit) {
    console.error('Missing required Form onSubmit property');
    return null;
  }

  /**
   * @param {SubmitEvent} event 
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    if (props.onSubmit(event.target, setFlashMessage)) {
      setFlashMessage(undefined);
      return true;
    } else {
      return false;
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {props.children}
      {flashMessage ? <p className="form-error">{flashMessage}</p> : null}
    </form>
  );
}

Form.Page = (props) => {
  return (
    <main className="form-page">
      {props.children}
      <Footer />
    </main>
  );
}

Form.Text = (props) => {
  return (
    <input type="text" className="input-text" {...props} />
  );
}

Form.Password = (props) => {
  return (
    <input type="password" className="input-text" {...props} />
  );
}

Form.Submit = (props) => {
  return (
    <input className="cta-button" type="submit" {...props} />
  );
}

export default Form;

