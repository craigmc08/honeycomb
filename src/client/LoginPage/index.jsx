import React from 'react';
import Form from '../Form';

import { LoginForm } from '@wasp/auth/forms/Login';

const MESSAGES = {
  authFailed: 'Invalid username and/or password.',
};

const LoginPage = (_props) => {
  return (
    <Form.Page>
      <LoginForm />
    </Form.Page>
  )
}

export default LoginPage;
