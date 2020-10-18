// Helpers that manipulates DOM

import Toast from 'bootstrap/js/dist/toast';
import moment from 'moment';
import IMask from 'imask';
import Choices from 'choices.js';
import 'choices.js/public/assets/styles/choices.min.css';

import unauthorizedTemplate from '../templates/header/_unauthorized.hbs';
import authorizedTemplate from '../templates/header/_authorized.hbs';
import toastTemplate from '../templates/pageToast.hbs';

import alertTemplate from '../templates/alert.hbs';
import { debounce, handleGoBack, searchCity } from './helpers';
import { handleLogout } from './auth';
import animateScrollTo from 'animated-scroll-to';
import {
  PROFILE_NAV_ID,
  PAGE_ERROR_CONTAINER_ID,
  TOASTS_WRAPPER_ID,
  NAVIGATE_BACK_QUERY,
  LOGOUT_CONTROLS_QUERY,
  SCROLL_TO_QUERY,
} from './constants';

// ---------- View HELPERS

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

const momentDateFormat = 'DD.MM.YYYY';
/** Init Date of Birth input with IMask
 * @param {string} elementQuery
 */
export function initDoBInput(elementQuery) {
  const currentYear = moment().get('year');
  IMask(document.querySelector(elementQuery), {
    mask: Date,
    pattern: momentDateFormat,
    min: new Date(currentYear - 100, 0, 1),
    max: new Date(currentYear - 17, 0, 1),

    format: function(date) {
      return moment(date).format(momentDateFormat);
    },
    parse: function(str) {
      return moment(str, momentDateFormat);
    },

    blocks: {
      YYYY: {
        mask: IMask.MaskedRange,
        from: currentYear - 100,
        to: currentYear - 17,
      },
      MM: {
        mask: IMask.MaskedRange,
        from: 1,
        to: 12,
      },
      DD: {
        mask: IMask.MaskedRange,
        from: 1,
        to: 31,
      },
    },
  });
}

/** Init city input with fetching from Api
 * @param {string} elementId
 * @param {{ value: number, label: string }} initialCity
 */
export function initCitySearchInput(elementId, initialCity, onChangeCallback) {
  const citySelect = document.getElementById(elementId);
  const choices = new Choices(citySelect, {
    noChoicesText: 'No cities found',
    duplicateItemsAllowed: false,
    searchChoices: false,
    shouldSort: false,
  });

  if (initialCity) {
    choices.setValue([
      {
        value: initialCity.value,
        label: initialCity.label,
      },
    ]);
  }

  if (onChangeCallback) {
    citySelect.addEventListener('choice', onChangeCallback);
  }

  citySelect.addEventListener(
    'search',
    debounce(function({ detail }) {
      const value = detail.value;
      if (!value || value.length < 2) {
        return;
      }

      searchCity(value).then(citiesList => {
        choices.setChoices(
          citiesList.map(city => ({ value: city.id, label: city.display_name })),
          'value',
          'label',
          true
        );
      });
    }, 500)
  );
}

// ---------- BINDS

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

// ---------- HELPER CLASSES

/** Manage request element state */
export class RequestNode {
  /** Init request with single element query
   * @param {string} requestQuery
   */
  constructor(requestQuery) {
    this.request = document.querySelector(requestQuery);
  }
}
