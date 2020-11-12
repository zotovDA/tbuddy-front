import 'bootstrap';

import '../stylesheets/style.scss';
import { restoreUserSession } from './auth';
import Axios from 'axios';
import { initNavigateBackBinds, initScrollToBinds } from './view';

import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';
import { Logger } from './helpers';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

Axios.defaults.baseURL = 'https://api.travelbuddy.io/';

try {
  Sentry.init({
    dsn: 'https://6f8a890af3c243ec984be1838c161a8c@o475887.ingest.sentry.io/5514529',
    integrations: [new Integrations.BrowserTracing()],

    tracesSampleRate: 1.0,
  });
} catch (err) {
  Logger.error('Sentry init error');
}

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
