import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import '../reset.css';
import '../main.css';
import './account.css';

import { useQuery } from '@wasp/queries';
import getName from '@wasp/queries/getName';

import Footer from '../Footer';
import Page from '../Page';

const AccountPage = (_props) => {
  const { t } = useTranslation();

  const { data: user } = useQuery(getName);
  const name = user ? user.name : undefined;

  const startNameChange = () => {
  };
  const startDeleteAccount = () => { };
  const startLanguageChange = () => { };

  // TODO: how to get full list of supported languages?
  const languages = ['Idioma', 'Langue', '语'].join(' / ');

  return (
    <Page
      className="account-page"
      active={"/account"}
      title={t('Your Account')}
    >
      <div className="account-header">
        <h2>{t('Your Account')}</h2>
        <h1>{name}</h1>
      </div>
      <div className="account-main">
        <h2 className="account-welcome-msg">{t('Welcome, {{name}}!', { name })}</h2>

        <ul className="account-items">
          <li><button onClick={startNameChange}>{t('Change Name')}</button></li>
          <li><Link to="/manage-tags">{t('Manage Tags')}</Link></li>
          <li><button onClick={startLanguageChange}>{t('Language')}<span className="account-item-sub">{languages}</span></button></li>
          <li><button className="account-item-warn" onClick={startDeleteAccount}>{t('Delete Account')}</button></li>
        </ul>
      </div>

      <div className="footer-space"></div>
      <Footer />
    </Page>
  )
}

export default AccountPage;
