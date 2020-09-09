import 'bootstrap';

import '../stylesheets/style.scss';
import { restoreUserSession } from './auth';
import initAllBinds from './binds';
import Axios from 'axios';

// eslint-disable-next-line no-undef
Axios.defaults.baseURL = process.env.API_BASE;

function onInit() {
  // check cached user
  restoreUserSession();
  initAllBinds();
}

document.addEventListener('DOMContentLoaded', onInit);
