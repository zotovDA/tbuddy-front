import 'bootstrap';

import '../stylesheets/style.scss';
import { restoreUserSession } from './auth';
import initAllBinds from './binds';
import Axios from 'axios';

Axios.defaults.baseURL = 'https://molodykh.pro/';
function onInit() {
  restoreUserSession();
  initAllBinds();
}

document.addEventListener('DOMContentLoaded', onInit);
