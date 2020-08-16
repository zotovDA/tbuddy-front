import 'bootstrap';

import '../stylesheets/style.scss';
import { restoreSessionFromStore } from './auth';
import initAllBinds from './binds';

function onInit() {
  initAllBinds();

  // check cached user
  restoreSessionFromStore();
}

document.addEventListener('DOMContentLoaded', onInit);
