import React from 'react';
import { Link } from 'react-router-dom';
import Form from '../Form';
import { useHistory } from 'react-router-dom'

import login from '@wasp/auth/login';
import Flex from '../Flex';

const MESSAGES = {
  authFailed: 'Invalid username and/or password.',
};

const LoginPage = (_props) => {
  const history = useHistory();

  const handleSubmit = async (target, flashMessage) => {
    try {
      await login(
        target.email.value, target.password.value,
      );

      history.push('/recipes');
    } catch (e) {
      flashMessage(MESSAGES.authFailed);
    }
    return true;
  }

  return (
    <Form.Page>
      <h1>Log In</h1>
      <p>No account? <Link to="/signup">Sign up</Link></p>
      <Form onSubmit={handleSubmit}>
        <Form.Text required name="email" placeholder="Email" autoFocus />
        <Form.Password required name="password" placeholder="Password" />
        <Flex flow={Flex.Row} spacing={Flex.Pack} gap="16px">
          <Form.Submit value="Log in" />
          <Link className="link-small" to="/password-reset">I forgot my password</Link>
        </Flex>
      </Form>
    </Form.Page>
  )
}

export default LoginPage;
