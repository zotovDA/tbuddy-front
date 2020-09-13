import 'bootstrap';

import '../stylesheets/style.scss';
import { restoreUserSession } from './auth';
import initAllBinds from './binds';
import Axios from 'axios';

Axios.defaults.baseURL = 'https://molodykh.pro/';
async function onInit() {
  await restoreUserSession();
  initAllBinds();

  document.dispatchEvent(new Event('init'));
}

document.addEventListener('DOMContentLoaded', onInit);
