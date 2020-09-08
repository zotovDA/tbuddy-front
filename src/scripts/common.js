import 'bootstrap';

import '../stylesheets/style.scss';
import { restoreUserSession } from './auth';
import initAllBinds from './binds';

function onInit() {
  // check cached user
  restoreUserSession();
  initAllBinds();
}

document.addEventListener('DOMContentLoaded', onInit);
