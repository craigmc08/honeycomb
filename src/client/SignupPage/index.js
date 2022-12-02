import React from 'react';
import Form from '../Form';
import { useHistory } from 'react-router-dom'

import signup from '@wasp/auth/signup';
import login from '@wasp/auth/login';

const MESSAGES = {
  differentPassword: 'The passwords you entered do not match.',
  unknown: 'Something went wrong, please try again later.',
};

const SignupPage = (_props) => {
  const history = useHistory();

  const handleSubmit = async (target, flashMessage) => {
    // Validate form
    if (target.password.value !== target.confirm_password.value) {
      flashMessage(MESSAGES.differentPassword);
      return false;
    }

    try {
      await signup(
        { name: target.name.value, username: target.email.value, password: target.password.value }
      );
      await login(target.email.value, target.password.value);

      history.push('/recipes');
    } catch (e) {
      flashMessage(MESSAGES.unknown);
    }

    return true;
  }

  return (
    <Form.Page>
      <h1>Sign up</h1>
      <p>Create your free Honeycomb account!</p>
      <Form onSubmit={handleSubmit}>
        <Form.Text required name="name" placeholder="Your Name" />
        <Form.Text required name="email" placeholder="Email" />
        <Form.Password required name="password" placeholder="Password" />
        <Form.Password required name="confirm_password" placeholder="Confirm Password" />
        <Form.Submit value="Create my account" />
      </Form>
    </Form.Page>
  )
}

export default SignupPage;
