import React, { useState}  from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import '../reset.css';
import '../main.css';
import './account.css';

import { useQuery } from '@wasp/queries';
import getUsername from '@wasp/queries/getUsername';
// import updateUsername from '@wasp/actions/updateUsername';
// import updateEmail from '@wasp/actions/updateEmail';
// import updatePassword from '@wasp/actions/updatePassword';

import Footer from '../Footer';
import Page from '../Page';

const AccountPage = (_props) => {
  const { t } = useTranslation();

  const { data: user } = useQuery(getUsername);
  const username = user ? user.username : undefined;

  const startNameChange = () => {
  };
  const startEmailChange = () => {};
  const startPasswordChange = () => {};
  const startDeleteAccount = () => {};

  return (
    <Page
      className="account-page"
      active={"/account"}
      title={t('Your Account')}
    >
      <h2>{t('Your Account')}</h2>
      <h1>{username || 'Loading...'}</h1>

      <h2 className="account-welcome-msg">{t('Welcome, {{name}}!', { name: username })}</h2>

      <ul className="account-items">
        <li><button onClick={startNameChange}>{t('Change Name')}</button></li>
        <li><button onClick={startEmailChange}>{t('Change Email')}</button></li>
        <li><button onClick={startPasswordChange}>{t('Change Password')}</button></li>
        <li><Link to="/manage-tags">{t('Manage Tags')}</Link></li>
        <li><button className="account-item-warn" onClick={startDeleteAccount}>{t('Delete Account')}</button></li>
      </ul>
    </Page>
  )
}

export default AccountPage;
