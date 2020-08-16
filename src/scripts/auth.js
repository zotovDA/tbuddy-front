import { updateNavUser } from './view';

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
