import 'bootstrap';

import '../stylesheets/style.scss';
import { restoreUserSession, handleOAuth } from './auth';
import initAllBinds from './binds';

function onInit() {
  // check cached user
  restoreUserSession();
  initAllBinds();
}

if (window.authHandler) {
  handleOAuth();
} else {
  document.addEventListener('DOMContentLoaded', onInit);
}
