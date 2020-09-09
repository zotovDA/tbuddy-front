import authErrorTemplate from '../../templates/auth/authError.hbs';
import { saveUserSessionToStore } from '../auth';

import '../../stylesheets/style.scss';
import Axios from 'axios';

Axios.defaults.baseURL = 'https://molodykh.pro/';

document.addEventListener('DOMContentLoaded', handleOAuth);

export function handleOAuth() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const code = urlParams.get('code');
  const provider = urlParams.get('state');

  if (!code || !provider) drawAuthHandlerError();

  Axios.post('/auth/token/obtain/social/', {
    provider: provider,
    code: code,
  })
    .then(response => {
      saveUserSessionToStore({ ...response, name: response.email });
      window.location.replace('/');
    })
    .catch(drawAuthHandlerError);
}

function drawAuthHandlerError() {
  const messageNode = document.getElementById('js-auth-handler-message');

  messageNode.innerHTML = authErrorTemplate();
}
