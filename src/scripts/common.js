import 'bootstrap';

import '../stylesheets/style.scss';
import { restoreUserSession } from './auth';
import Axios from 'axios';
import { initNavigateBackBinds, initScrollToBinds } from './view';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

Axios.defaults.baseURL = 'https://molodykh.pro/';

async function onInit() {
  if (urlParams.has('authed')) {
    document.getElementById('responsive-nav').classList.add('show');
  }

  await restoreUserSession();

  // init binds
  initNavigateBackBinds();
  initScrollToBinds();

  document.dispatchEvent(new Event('init'));
}

document.addEventListener('DOMContentLoaded', onInit);
