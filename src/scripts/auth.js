import { updateNavUser, drawAuthHandlerError, showPageError } from './view';
import { initLogout } from './binds';

export function restoreUserSession() {
  return new Promise((resolve, reject) => {
    const sessionInfo = restoreSessionFromStore();
    if (sessionInfo !== null) {
      resolve(sessionInfo);
    } else {
      reject();
    }
  })
    .then(({ user }) => {
      // TODO: update access token
      const tokenValid = true;

      if (!tokenValid) {
        throw 'Сессия пользователя истекла';
      }

      return user;
    })
    .catch(message => {
      if (message) {
        showPageError([{ title: 'Ошибка авторизации', message: message }]);
      }
    })
    .then(updateNavUser)
    .then(initLogout);
}

function getUserFromStore() {
  const userPlain = localStorage.getItem('user');
  let user = null;
  try {
    user = JSON.parse(userPlain);
  } catch (e) {
    // null
  }
  return user;
}

export function restoreSessionFromStore() {
  // restore cached user info
  const access = localStorage.getItem('access');
  const refresh = localStorage.getItem('refresh');
  const user = getUserFromStore();

  return (
    access && {
      access: access,
      refresh: refresh,
      user: user,
    }
  );
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

export function handleLogout() {
  clearUserSessionFromStore();
  updateNavUser(null);
}

/**
 * to local storage
 * @param {{access: string, refresh: string, id: number, name: string}} sessionInfo
 */
export function saveUserSessionToStore(sessionInfo) {
  localStorage.setItem('access', sessionInfo.access);
  localStorage.setItem('refresh', sessionInfo.refresh);
  localStorage.setItem('user', JSON.stringify({ id: sessionInfo.id, name: sessionInfo.name }));
}

export function getCurrentUserId() {
  const user = getUserFromStore();
  return user ? user.id : null;
}

export function clearUserSessionFromStore() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
}
