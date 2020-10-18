import '../common';
import { getUserFromToken, FormManager, delay } from '../helpers';
import Axios from 'axios';
import { saveUserSessionToStore } from '../auth';

document.addEventListener('DOMContentLoaded', function() {
  const signInFormManager = new FormManager('js-sign-in-form');
  signInFormManager.setHandler(handleLocalSignIn, { loadingText: 'Signing in' });

  const signUpFormManager = new FormManager('js-sign-up-form');
  signUpFormManager.setHandler(handleLocalSignUp, { loadingText: 'Signing up' });

  function obtainToken(email, password) {
    return Axios.post('/auth/token/obtain/local/', {
      email: email,
      password: password,
    }).then(response => {
      const userSession = response.data;
      const userData = getUserFromToken(userSession.access);

      saveUserSessionToStore({
        access: userSession.access,
        refresh: userSession.refresh,
        name: userData.name,
        id: userData.id,
      });
      // localstorage need time to write
      return delay(100).then(() => (window.location = '/?authed'));
    });
  }

  function handleLocalSignIn() {
    const authData = signInFormManager.getValues();
    return obtainToken(authData.email, authData.password);
  }

  function handleLocalSignUp() {
    const authData = signUpFormManager.getValues();

    if (authData['password'] !== authData['password-repeat']) {
      signUpFormManager.showFieldError('password-repeat');
      return;
    }

    return Axios.post('/auth/user/', {
      email: authData.email,
      password: authData.password,
    }).then(() => {
      // verify alert will be in profile
      Axios.post('/auth/email/verify/', {
        email: authData.email,
      });
      return obtainToken(authData.email, authData.password);
    });
  }
});
