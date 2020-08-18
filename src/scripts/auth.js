import { updateNavUser, drawAuthHandlerError } from './view';

export function restoreSessionFromStore() {
  // TODO: restore update token and update access token

  // restore cached user info
  const userPlain = localStorage.getItem('user');
  let user = null;
  try {
    user = JSON.parse(userPlain);
  } catch (e) {
    // null
  }

  // draw changes
  updateNavUser(user);

  return user;
}

export function handleOAuth() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const tokenAccess = urlParams.get('access');
  const tokenRefresh = urlParams.get('refresh');
  const name = urlParams.get('name');

  return new Promise((resolve, reject) => {
    if ([tokenAccess, tokenRefresh].some(item => item === null)) {
      reject();
    }
    saveUserSessionToStore({ access: tokenAccess, refresh: tokenRefresh, name: name });
    resolve(name);
  })
    .then(name => updateNavUser({ name: name }))
    .then(() => window.location.replace('/'))
    .catch(drawAuthHandlerError);
}

/**
 * to local storage
 * @param {{access: string, refresh: string, name: string}} sessionInfo
 */
export function saveUserSessionToStore(sessionInfo) {
  localStorage.setItem('access', sessionInfo.access);
  localStorage.setItem('refresh', sessionInfo.refresh);
  localStorage.setItem('user', JSON.stringify({ name: sessionInfo.name }));
}
