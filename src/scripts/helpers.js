// Script logic helpers

import Axios from 'axios';
import jwt_decode from 'jwt-decode';

// ---------- BROWSER HELPERS

/** Go back in browser history */
export function handleGoBack() {
  history.back();
}

/** Return URLParams instance */
export function getURLParams() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams;
}

/** Format FormData to object instance
 * @param {FormData} formData
 */
export function formDataToObj(formData) {
  let object = {};
  if (!formData) return object;
  formData.forEach((value, key) => {
    if (object[key]) {
      object[key] = [object[key], value];
    } else {
      object[key] = value;
    }
  });

  return object;
}

// ---------- SCRIPTS HELPERS

/** Delay execution by given ms
 * @param {number} ms
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Get user info from jwt token
 * @param {string} token
 * @returns {{id: number, name: string}}
 */
export function getUserFromToken(token) {
  if (!token) return { id: null, name: '' };
  const tokenData = jwt_decode(token);

  function _getNameFromEmail(email) {
    return email && email.slice(0, email.indexOf('@'));
  }

  return {
    id: tokenData.user_id || tokenData.id,
    name: tokenData.name || _getNameFromEmail(tokenData.email),
  };
}

/** Execute passed function once in N ms
 * @param {Function} f
 * @param {number} ms
 */
export function debounce(f, ms) {
  let isCooldown = false;

  return function() {
    if (isCooldown) return;

    f.apply(this, arguments);

    isCooldown = true;

    setTimeout(() => (isCooldown = false), ms);
  };
}

/** Parse price into integer number
 * @param {string} price
 */
export function parsePrice(price) {
  if (!price) return 0;
  let resultPrice = price;
  if (price.indexOf('$') > -1) {
    resultPrice = price.slice(1);
  }

  resultPrice = resultPrice.replaceAll(' ', '');

  return parseInt(resultPrice);
}

// ---------- API HELPERS

/** Parse different formats of django api errors into single string
 * @see {@link https://www.django-rest-framework.org/api-guide/exceptions/#exception-handling-in-rest-framework-views} for error format docs
 * @param {any} error
 */
export function parseApiErrors(error) {
  if (!error) return '';

  const errorsList = error.non_field_errors || [''];
  return error.detail || errorsList.join('\n');
}

/** Fetch cities list from Api
 * @param {string} value
 */
export function searchCity(value) {
  return Axios.get('/geo/cities/', {
    params: {
      search: value,
    },
  })
    .then(response => {
      return response.data.results;
    })
    .catch(() => {
      return [];
    });
}

// ---------- HELPER CLASSES

/** Manage Node state
 * @exports
 * @class TemplateManager
 */
export class TemplateManager {
  /**
   * Creates an instance
   * @param {Element} element
   */
  constructor(element) {
    /** links to original element */
    this.element = element;
    /** original element content to be restored */
    this.initialState = element.innerHTML;
  }

  /**
   * insert new content to element
   * @param {string} template
   */
  change(template) {
    this.element.innerHTML = template;
  }

  /** Restores initial content to current element */
  restore() {
    this.element.innerHTML = this.initialState;
  }
}
