import React from 'react';
import { useHistory } from 'react-router-dom';
import Flex from '../Flex';
import Footer from '../Footer';
import '../reset.css';
import '../main.css';
import honeycombImg from './honeycomb.jpg';
import { Link } from 'react-router-dom';
import useAuth from '@wasp/auth/useAuth';

// major issue: can't put static assets anywhere, e.g. if I want to use an image in css instead of here
// see the mess of landing.css for what has to be done to get an image as a background...

const LandingPage = (_props) => {
  const history = useHistory();
  const { data: user } = useAuth();
  if (user) {
    history.push('/recipes');
  }
  return (
    <main className="landing-page">
      <div className="landing-hero">
        <img className="landing-bg-img" src={honeycombImg} />
        <h1>Honeycomb</h1>
        <p>The smart recipe book.</p>
      </div>
      <div className="landing-group">
        <p><em>Get started today for free</em></p>
        <Flex flow={Flex.Row} spacing={Flex.Between}>
          <Link to="/signup" className="cta-button">Sign Up</Link>
          <Link to="/login" className="landing-tiny-link">I already have an account</Link>
        </Flex>
      </div>
      <hr />
      <div className="landing-group">
        <p>All your recipes. Accessible anywhere.</p>
        <img className="placeholder" width="300px" height="500px" />
      </div>
      <div className="landing-alternate-group">
        <p>Easily add new recipes from the web.</p>
        <img className="placeholder" width="300px" height="500px" />
      </div>
      <div className="landing-group">
        <p>100% free, forever. No limits, no paywalls, no ads.</p>
        <Link to="/signup" className="cta-button">Sign Up</Link>
      </div>
      <Footer />
    </main>
  );
};

export default LandingPage
