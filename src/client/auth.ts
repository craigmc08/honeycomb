import waspUseAuth from '@wasp/auth/useAuth';
import { useHistory } from 'react-router-dom';

/**
 * Wrapper around `@wasp/auth/useAuth`. Checks that the user's account has been
 * fully set up.
 */
export const useCheckAccountStatus = () => {
  const history = useHistory();
  const authResult = waspUseAuth();
  if (authResult.data) {
    if (!authResult.data.name) {
      setTimeout(() => history.push(`/account-setup?`), 0);
    }
  }
  return authResult;
}
