import Flex from '../Flex';
import './footer.css';

const Footer = (_props) => {
  return (
    <footer className="footer">
      <Flex flow={Flex.Row} spacing={Flex.Between}>
        <p>© 2022 Craig McIlwrath</p>
        <p>Made with <a href="https://wasp-lang.dev">Wasp ={'}'}</a></p>
      </Flex>
    </footer>
  )
}

export default Footer;
