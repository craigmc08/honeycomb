import React, { useState, createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

import './OverflowMenu.css';
import { useDocumentListener } from '../documentListener';

const OverflowMenuContext = createContext({});

const useOverflowMenu = () => useContext(OverflowMenuContext);

function OverflowMenuProvider(props) {
  const [state, setState] = useState({ open: false, holder: null, positionedOver: null, items: [] });

  useDocumentListener('click', () => {
    if (state.open) {
      setState({ ...state, open: false });
    }
  });

  return (
    <OverflowMenuContext.Provider value={[state, setState]}>
      {props.children}
      <OverflowMenu />
    </OverflowMenuContext.Provider>
  );
}

function OverflowMenu(props) {
  const [{ open, positionedOver, items }] = useOverflowMenu();

  let x, y;
  if (positionedOver !== null) {
    const bb = positionedOver.getBoundingClientRect();
    x = (bb.left + bb.width / 2) + 'px';
    y = bb.bottom + 'px';
  }

  return (
    <ul className="overflow-menu" aria-hidden={!open} style={{ '--om-x': x, '--om-y': y }}>
      {items.map((item, i) => (<Item {...item} key={i} />))}
    </ul>
  )
}

function OverflowMenuButton(props) {
  const self = Symbol('overflow-menu');
  /**
   * Depending on the combination of `open` and `holder`, do different things
   * when `toggleOpen` is called:
   * (1) open && holder === self: close the menu
   * (2) open && holder !== self: keep menu open, but change the menu to be pointing to this button
   * (3) !open: open the menu as this button
   * 
   * In the implementation below, (2) and (3) are combined into the else branch
   */
  const [{ open, holder }, setState] = useOverflowMenu();

  const toggleOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (open && holder === self) {
      // Case (1)
      setState({ open: false });
    } else {
      // Case (2) or (3)
      setState({ open: true, holder: self, positionedOver: e.target, items: props.items });
    }
  }

  return (
    <button className={`overflow-menu-btn ${props.className}`} onClick={e => toggleOpen(e)}>
      <FontAwesomeIcon icon={faEllipsisV} />
    </button>
  )
}

OverflowMenuButton.propTypes = {
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

export {
  OverflowMenuProvider,
  OverflowMenuButton,
};

