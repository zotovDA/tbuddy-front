import { updateNavUser, showPageError } from './view';
import { initLogoutBinds } from './binds';

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
    .then(initLogoutBinds);
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

export function getAccessToken() {
  return localStorage.getItem('access');
}

export function clearUserSessionFromStore() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
}
