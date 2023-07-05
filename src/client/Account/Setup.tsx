import Form from "../Form";
import { useTranslation } from 'react-i18next';
import { useLocation, useHistory } from 'react-router-dom';
import updateName from '@wasp/actions/updateName';

export default function AccountSetup(_props: {}) {
  const { t } = useTranslation();
  const history = useHistory();

  const handleSubmit = async (target: any, flashMessage: any) => {
    try {
      await updateName({ name: target.name.value });
      setTimeout(() => {
        history.push('/recipes');
      }, 500)
    } catch (e) {
      flashMessage(t('Something went wrong'));
    }
  }

  return (
    <Form.Page>
      <h1>{t('Account Setup Welcome')}</h1>
      <p>{t('Account Setup Provide some details')}</p>
      <Form onSubmit={handleSubmit}>
        <Form.Text required name="name" placeholder="Your Name" autoFocus />
        <Form.Submit value="Continue" />
      </Form>
    </Form.Page>
  )
}
