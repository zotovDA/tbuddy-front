import 'bootstrap';

import '../stylesheets/style.scss';
import { restoreUserSession } from './auth';
import { handleOAuth } from './auth/index';
import initAllBinds from './binds';
import { initUserProfile } from './profile';

// PAGES
import './landing';

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
