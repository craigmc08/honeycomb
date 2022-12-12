import React from 'react';
import PropTypes from 'prop-types';

import './page.css';
import Toolbar from '../Toolbar';

function Page(props) {
	return (
		<div className="page">
      <main className={`content ${props.className}`}>
	      {props.children}
	    </main>
		  <Toolbar active={props.active} title={props.title}>
	      {props.toolbar}
	    </Toolbar>
		</div>
	)
}

Page.propTypes = {
	className: PropTypes.string,
	toolbar: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.element), PropTypes.element]),
	active: PropTypes.string.isRequired,
	title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]).isRequired,
};

export default Page;
