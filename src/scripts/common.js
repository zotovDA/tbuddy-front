import 'bootstrap';

import '../stylesheets/style.scss';
import { restoreUserSession } from './auth';
import initAllBinds from './binds';
import Axios from 'axios';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

Axios.defaults.baseURL = 'https://molodykh.pro/';
async function onInit() {
  if (urlParams.has('authed')) {
    document.getElementById('navbar-nav').classList.add('show');
  }

  await restoreUserSession();
  initAllBinds();

  document.dispatchEvent(new Event('init'));
}

document.addEventListener('DOMContentLoaded', onInit);
