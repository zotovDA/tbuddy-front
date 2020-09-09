import { updateNavUser, showPageError } from './view';
import { initLogoutBinds } from './binds';
import Axios from 'axios';

export function restoreUserSession() {
  const sessionInfo = restoreSessionFromStore();
  if (!sessionInfo) {
    updateNavUser();
    return;
  }

  refreshAccessToken(sessionInfo.refresh).then(hasAccess => {
    updateNavUser();
    if (!hasAccess) {
      showPageError([{ title: 'Authorization error', message: 'User session expired.' }]);
      return;
    }

    setInterval(() => refreshAccessToken(sessionInfo), 4.59 * (60 ^ 2) * 1000);
    initLogoutBinds();
  });
}

async function refreshAccessToken(refreshToken) {
  try {
    const token = await Axios.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });

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
  updateNavUser(null);
  delete Axios.defaults.headers.common['Authorization'];
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

export function getCurrentUserId() {
  const user = getUserFromStore();
  return user ? user.id : null;
}

export function clearUserSessionFromStore() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
}
