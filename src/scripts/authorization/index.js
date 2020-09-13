import authErrorTemplate from '../../templates/auth/authError.hbs';
import { saveUserSessionToStore } from '../auth';

import '../../stylesheets/style.scss';
import Axios from 'axios';
import { getUserFromToken, parseApiErrors } from '../helpers';

Axios.defaults.baseURL = 'https://molodykh.pro/';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

document.addEventListener('DOMContentLoaded', function() {
  if (urlParams.has('fromMail')) handleLocalAuth();
  else if (urlParams.has('state')) handleOAuth();
});

function handleOAuth() {
  const code = urlParams.get('code');
  const provider = urlParams.get('state');

  if (!code || !provider) drawAuthHandlerError('Invalid URL params.');

  Axios.post('/auth/token/obtain/social/', {
    provider: provider,
    code: code,
  })
    .then(response => {
      const userSession = response.data;
      const userData = getUserFromToken(userSession.token);

      saveUserSessionToStore({
        access: userSession.token,
        refresh: userSession.refresh,
        name: userData.name,
        id: userData.id,
      });
      window.location.replace('/profile.html?fromRegister');
    })
    .catch(error => drawAuthHandlerError(parseApiErrors(error.response.data)));
}

function handleLocalAuth() {
  const uidb64 = urlParams.get('uidb64');
  const token = urlParams.get('token');

  if (!uidb64 || !token) drawAuthHandlerError('Invalid URL params.');

  Axios.post('/auth/email/verify/confirm/', {
    token: token,
    uidb64: uidb64,
  })
    .then(() => {
      window.location.replace('/profile.html?fromRegister');
    })
    .catch(error => drawAuthHandlerError(parseApiErrors(error.response.data)));
}

function drawAuthHandlerError(details) {
  const messageNode = document.getElementById('js-auth-handler-message');

  messageNode.innerHTML = authErrorTemplate({ details });
}
