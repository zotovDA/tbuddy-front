import 'bootstrap';

import '../stylesheets/style.scss';
import { restoreUserSession, handleOAuth } from './auth';
import initAllBinds from './binds';

function onInit() {
  initAllBinds();

  // check cached user
  restoreUserSession();
}

if (window.authHandler) {
  handleOAuth();
} else {
  document.addEventListener('DOMContentLoaded', onInit);
}
