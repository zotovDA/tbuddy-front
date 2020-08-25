import 'bootstrap';

import '../stylesheets/style.scss';
import { restoreUserSession, handleOAuth } from './auth';
import initAllBinds from './binds';
import { initUserProfile } from './profile';

function onInit() {
  // check cached user
  restoreUserSession();
  initAllBinds();

  const pathname = window.location.pathname;

  if (pathname === '/profile.html') {
    initUserProfile();
  }
}

if (window.authHandler) {
  handleOAuth();
} else {
  document.addEventListener('DOMContentLoaded', onInit);
}
