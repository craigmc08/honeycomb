import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faFolder } from '@fortawesome/free-regular-svg-icons';
import { faListUl } from '@fortawesome/free-solid-svg-icons';

import './toolbar.css';

const Toolbar = (props) => {
  const pages = [
    { name: 'Recipes', to: '/recipes', icon: <FontAwesomeIcon icon={faListUl} /> },
    { name: 'Menus', to: '/menus', icon: <FontAwesomeIcon icon={faFolder} /> },
    { name: 'Account', to: '/account', icon: <FontAwesomeIcon icon={faUser} /> }
  ];

  return (
    <div className="toolbar">
      <ul className="nav">
        {pages.map(page => <NavItem {...page} active={props.active} key={page.to} />)}
      </ul>
      {props.children}
    </div>
  )
}

function NavItem(props) {
  return (
    <li className={props.active === props.to ? 'nav-item active' : 'nav-item'}>
      <Link to={props.to}>
        {props.icon}
        <span className="nav-item-name">{props.name}</span>
      </Link>
    </li>
  )
}

export default Toolbar;
