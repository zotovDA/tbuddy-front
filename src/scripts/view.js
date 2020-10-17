// Helpers that manipulates DOM

import Toast from 'bootstrap/js/dist/toast';

import unauthorizedTemplate from '../templates/header/_unauthorized.hbs';
import authorizedTemplate from '../templates/header/_authorized.hbs';
import toastTemplate from '../templates/pageToast.hbs';

import alertTemplate from '../templates/alert.hbs';
import { handleGoBack, parseApiErrors } from './helpers';
import { handleLogout } from './auth';
import animateScrollTo from 'animated-scroll-to';
import {
  PROFILE_NAV_ID,
  PAGE_ERROR_CONTAINER_ID,
  TOASTS_WRAPPER_ID,
  NAVIGATE_BACK_QUERY,
  LOGOUT_CONTROLS_QUERY,
  SCROLL_TO_QUERY,
  FORM_ERROR_CONTAINER_QUERY,
  FORM_ERROR_CLASSNAME,
  INVALID_FIELD_CLASSNAME,
} from './constants';

function showToasts() {
  var toastElList = [].slice.call(document.querySelectorAll('.toast'));
  toastElList.forEach(function(toastEl) {
    return new Toast(toastEl).show();
  });
}

/** Add toasts in dom and init them
 * @param {{title: string, message: string}[]} errorsList
 */
export function showPageError(errorsList) {
  const wrapperNode = document.getElementById(TOASTS_WRAPPER_ID);
  wrapperNode.innerHTML = errorsList.reduce((result, errorItem) => {
    return (result += toastTemplate(errorItem));
  }, '');
  showToasts();
}

/** Update profile control in nav menu
 * @param {{name: string}} user
 */
export function updateNavUser(user) {
  const profileNavControl = document.getElementById(PROFILE_NAV_ID);
  if (!profileNavControl) {
    // no profile node
    return null;
  } else {
    if (!user) {
      // not authorized
      profileNavControl.innerHTML = unauthorizedTemplate();
      initLogoutBinds();
    } else {
      // authorized user
      profileNavControl.innerHTML = authorizedTemplate({
        name: user.name,
      });
    }
  }
}

export function drawPageError(message) {
  const pageErrorNode = document.getElementById(PAGE_ERROR_CONTAINER_ID);
  if (!pageErrorNode) throw 'No page error node provided';
  pageErrorNode.innerHTML = alertTemplate({ type: 'danger', message: message });
}

/** Handle validation in bootstrap form
 * @param {Element} form
 * @param {any} response
 * @param {boolean} forceError
 */
export function initApiErrorHandling(form, response, forceError) {
  if (!response) return null;
  const formErrorContainer = form.querySelector(FORM_ERROR_CONTAINER_QUERY);

  // clear existing errors
  [...form.querySelectorAll('[name]')].forEach(input =>
    input.classList.remove(INVALID_FIELD_CLASSNAME)
  );
  form.classList.remove('was-validated');
  formErrorContainer.classList.remove('d-block');

  // if non field errors
  if (forceError || response.detail || response.non_field_errors) {
    formErrorContainer.innerHTML = parseApiErrors(response) || 'Something unexpected happened';
    formErrorContainer.classList.add('d-block');
    return;
  }

  // handle fields errors
  Object.keys(response).forEach(field => {
    try {
      form.querySelector(`[name=${field}] + .${FORM_ERROR_CLASSNAME}`).innerHTML = response[field];
      form.querySelector(`[name=${field}]`).classList.add(INVALID_FIELD_CLASSNAME);
    } catch (e) {
      // pass
    }
  });
}

// BINDS on DOM

/** Init navigate back buttons binds */
export const initNavigateBackBinds = () => {
  [...document.querySelectorAll(NAVIGATE_BACK_QUERY)].forEach(item => {
    item.addEventListener('click', handleGoBack);
  });
};

/** Init navigate back buttons binds */
export const initLogoutBinds = () => {
  [...document.querySelectorAll(LOGOUT_CONTROLS_QUERY)].forEach(item => {
    item.addEventListener('click', handleLogout);
  });
};

/** Init scroll to buttons binds */
export const initScrollToBinds = () => {
  [...document.querySelectorAll(SCROLL_TO_QUERY)].forEach(item => {
    const scrollTarget = item.dataset.target;
    if (!scrollTarget) throw 'no scroll target';

    item.addEventListener('click', () => animateScrollTo(document.getElementById(scrollTarget)));
  });
};
