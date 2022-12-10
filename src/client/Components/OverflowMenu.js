import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

import './OverflowMenu.css';

function OverflowMenu(props) {
  const [open, setOpen] = useState(false);

  const toggleOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(!open);
  }
  document.addEventListener('click', () => {
    if (open) setOpen(false);
  });

  return (
    <div className={`overflow-menu-group ${props.className}`}>
      <button className="overflow-menu-btn" onClick={e => toggleOpen(e)}>
        <FontAwesomeIcon icon={faEllipsisV} />
      </button>
      <ul className="overflow-menu" data-open={open} aria-hidden={!open}>
        {props.items.map((item, i) => (<Item {...item} key={i} />))}
      </ul>
    </div >
  )
}

OverflowMenu.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    target: PropTypes.oneOfType([
      PropTypes.shape({
        type: PropTypes.oneOf(['link']).isRequired,
        to: PropTypes.string.isRequired,
      }),
      PropTypes.shape({
        type: PropTypes.oneOf(['button']).isRequired,
        onClick: PropTypes.func.isRequired,
      })
    ]).isRequired,
    icon: PropTypes.any,
    disabled: PropTypes.bool,
  })).isRequired,
  className: PropTypes.string,
};

function Item(props) {
  const icon = props.icon ? <FontAwesomeIcon icon={props.icon} /> : (<div></div>);

  if (props.target.type === 'link') {
    return (
      <li className="overflow-menu-item">
        <Link to={props.target.to} disabled={props.disabled}>
          {icon}
          {props.name}
        </Link>
      </li>
    );
  } else if (props.target.type === 'button') {
    return (
      <li className="overflow-menu-item">
        <button onClick={props.target.onClick} disabled={props.disabled}>
          {icon}
          {props.name}
        </button>
      </li>
    );
  } else {
    throw new Error(`OverflowMenu: unknown item target type '${props.target.type}' for '${props.name}'`)
  }
}

export default OverflowMenu;
