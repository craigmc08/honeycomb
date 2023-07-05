import React from 'react';
import Form from '../Form';
import { SignupForm } from '@wasp/auth/forms/Signup'

const MESSAGES = {
  differentPassword: 'The passwords you entered do not match.',
  unknown: 'Something went wrong, please try again later.',
};

const SignupPage = (_props) => {
  return (
    <Form.Page>
      <SignupForm />
    </Form.Page>
  )
}

export default SignupPage;
