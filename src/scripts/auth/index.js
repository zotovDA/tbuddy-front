import authErrorTemplate from '../../templates/auth/authError.hbs';
import { saveUserSessionToStore } from '../auth';
import { updateNavUser } from '../view';

export function handleOAuth() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const tokenAccess = urlParams.get('access');
  const tokenRefresh = urlParams.get('refresh');
  const name = urlParams.get('name');
  const id = urlParams.get('id');

  return new Promise((resolve, reject) => {
    if ([tokenAccess, tokenRefresh].some(item => item === null)) {
      reject();
    }
    saveUserSessionToStore({ access: tokenAccess, refresh: tokenRefresh, id: id, name: name });
    resolve(name);
  })
    .then(name => updateNavUser({ name: name }))
    .then(() => window.location.replace('/'))
    .catch(drawAuthHandlerError);
}

function drawAuthHandlerError() {
  const messageNode = document.getElementById('js-auth-handler-message');

  messageNode.innerHTML = authErrorTemplate();
}
