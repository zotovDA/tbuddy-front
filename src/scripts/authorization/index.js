import authErrorTemplate from '../../templates/auth/authError.hbs';
import { saveUserSessionToStore } from '../auth';

import '../../stylesheets/style.scss';
import Axios from 'axios';
import { getUserFromToken } from '../helpers';

Axios.defaults.baseURL = 'https://molodykh.pro/';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

document.addEventListener('DOMContentLoaded', function() {
  const isLocalAuth = urlParams.get('fromMail');

  if (isLocalAuth) handleLocalAuth();
  else handleOAuth();
});

function handleOAuth() {
  const code = urlParams.get('code');
  const provider = urlParams.get('state');

  if (!code || !provider) drawAuthHandlerError();

  Axios.post('/auth/token/obtain/social/', {
    provider: provider,
    code: code,
  })
    .then(response => {
      const userSession = response.data;
      const userData = getUserFromToken(userSession.access);

      saveUserSessionToStore({
        access: userSession.access,
        refresh: userSession.refresh,
        name: userData.name,
        id: userData.id,
      });
      window.location.replace('/');
    })
    .catch(drawAuthHandlerError);
}

function handleLocalAuth() {}

function drawAuthHandlerError() {
  const messageNode = document.getElementById('js-auth-handler-message');

  messageNode.innerHTML = authErrorTemplate();
}
