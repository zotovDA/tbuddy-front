import 'bootstrap';

import '../stylesheets/style.scss';
import { restoreSessionFromStore, handleOAuth } from './auth';
import initAllBinds from './binds';

function onInit() {
  initAllBinds();

  // check cached user
  restoreSessionFromStore();
}

if (window.authHandler) {
  handleOAuth();
} else {
  document.addEventListener('DOMContentLoaded', onInit);
}
