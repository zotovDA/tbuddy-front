import { updateNavUser, showPageError, initLogoutBinds } from './view';
import Axios from 'axios';

export function restoreUserSession() {
  const sessionInfo = restoreSessionFromStore();
  if (!sessionInfo) {
    updateNavUser();
    return;
  }

  return refreshAccessToken(sessionInfo.refresh).then(hasAccess => {
    if (!hasAccess) {
      showPageError([{ title: 'Authorization error', message: 'User session expired.' }]);
      return;
    }
    updateNavUser({ name: sessionInfo.user.name });

    // every 4mins
    const refreshTokenInterval = setInterval(function refreshTokenPeriodicaly() {
      refreshAccessToken(sessionInfo.refresh).then(hasAccess => {
        if (!hasAccess) {
          clearInterval(refreshTokenInterval);
          showPageError([{ title: 'Authorization error', message: 'User session expired.' }]);
        }
      });
    }, 240000);

    initLogoutBinds();
  });
}

async function refreshAccessToken(refreshToken) {
  try {
    const response = await Axios.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    const token = response.data.access;
    if (typeof token !== 'string') throw 'incorrect token';
    updateAccessTokenToStore(token);
    Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    return true;
  } catch (e) {
    handleLogout();
    return false;
  }
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
  window.location = '/';
  // updateNavUser(null);
  // delete Axios.defaults.headers.common['Authorization'];
  // TODO: add redirects
}

function updateAccessTokenToStore(token) {
  localStorage.setItem('access', token);
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

export function isAuth() {
  return !!localStorage.getItem('access');
}

export function getCurrentUserId() {
  if (!isAuth()) {
    return null;
  }
  const user = getUserFromStore();
  return user ? user.id : null;
}

export function getCurrentUserName() {
  const user = getUserFromStore();
  return user ? user.name : null;
}

export function clearUserSessionFromStore() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
}
