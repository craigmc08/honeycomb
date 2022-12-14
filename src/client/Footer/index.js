import Flex from '../Flex';
import { useTranslation, Trans } from 'react-i18next';

import './footer.css';

const Footer = (_props) => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <Flex flow={Flex.Row} spacing={Flex.Between}>
        <p>© 2022 Craig McIlwrath</p>
        <p><Trans>
          Made with <a href="https://wasp-lang.dev">Wasp ={'}'}</a>
        </Trans></p>
      </Flex>
    </footer>
  )
}

export default Footer;
