// Script logic helpers

import Axios from 'axios';
import jwt_decode from 'jwt-decode';

import {
  FORM_ERROR_CLASSNAME,
  FORM_ERROR_CONTAINER_QUERY,
  FORM_VALIDATION_STATE_CLASSNAME,
  INVALID_FIELD_CLASSNAME,
} from './constants';

import processingTemplate from '../templates/typo/processing.hbs';

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

/** Logger */
export class Logger {
  static error(text) {
    console.error(text);
  }
  static log(text) {
    // eslint-disable-next-line no-console
    console.log(text);
  }
}

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

/** Manage Form state
 * @exports
 * @class FormManager
 */
export class FormManager {
  /** Init form manager by ID
   * @param {string} formId
   */
  constructor(formId) {
    this.formId = formId;
    this.form = document.getElementById(formId);
  }

  /** Set submit event handler
   * @param {() => Promise} submitHandler
   * @param {{
   * disableValidation?: boolean
   * loadingText?: string
   * }} options
   */
  setHandler(submitHandler, options = {}) {
    const that = this;
    this.form.addEventListener('submit', function(e) {
      e.preventDefault();

      // clear previous errors
      this.classList.remove(FORM_VALIDATION_STATE_CLASSNAME);
      [...this.querySelectorAll('[name]')].forEach(
        input => input && input.classList.remove(INVALID_FIELD_CLASSNAME)
      );
      const formErrorContainer = this.querySelector(FORM_ERROR_CONTAINER_QUERY);
      formErrorContainer && formErrorContainer.classList.remove('d-block');

      // bootstrap validate html5 form
      if (!options.disableValidation)
        if (!this.checkValidity()) {
          this.classList.add(FORM_VALIDATION_STATE_CLASSNAME);
          return;
        }

      const submitButtonTemplate = new TemplateManager(this.querySelector('button[type=submit]'));
      submitButtonTemplate.change(processingTemplate({ text: options.loadingText || 'Loading' }));

      const submitHandlerResult = submitHandler.apply(this, arguments);

      if (!submitHandlerResult) {
        Logger.log(`submitHandlerResult for ${that.formId} is null`);
        return submitButtonTemplate.restore();
      }

      submitHandlerResult
        .catch(error => {
          if (typeof error === 'string') {
            Logger.error(error);
            return that.showFormError(error);
          }

          const response = error.response && error.response.data;

          // check is error from API
          if (response) {
            Logger.error(JSON.stringify(response));

            // if non field errors
            if (response.detail || response.non_field_errors) {
              const errorsList = response.non_field_errors || [''];
              return that.showFormError(response.detail || errorsList.join('\n'));
            }

            // handle fields errors
            const unknowFieldErrors = [];
            Object.keys(response).forEach(field => {
              try {
                that.showFieldError(field, response[field]);
              } catch (e) {
                unknowFieldErrors.push(`${field}: ${response[field]}`);
              }
            });

            if (unknowFieldErrors.length > 0) {
              that.showFormError(unknowFieldErrors.join('\n'));
            }
          } else {
            // js evaluation error
            const rawError = JSON.stringify(error);
            Logger.error(rawError);
            that.showFormError(rawError);
          }
        })
        .finally(() => {
          submitButtonTemplate.restore();
        });
    });
  }

  /** Display field error
   * @param {string} fieldName
   * @param {string?} errorText
   */
  showFieldError(fieldName, errorText) {
    if (errorText) {
      const fieldErrorTextNode = this.form.querySelector(
        `[name=${fieldName}] + .${FORM_ERROR_CLASSNAME}`
      );
      if (fieldErrorTextNode) {
        fieldErrorTextNode.innerHTML = errorText;
      } else {
        throw 'no field error container for' + fieldName;
      }
    }

    this.form.querySelector(`[name=${fieldName}]`).classList.add(INVALID_FIELD_CLASSNAME);
  }

  /** Display form error
   * @param {string?} errorText
   */
  showFormError(errorText) {
    const formErorr = this.form.querySelector(FORM_ERROR_CONTAINER_QUERY);
    if (!formErorr) throw 'no form error container for #' + this.formId;
    if (errorText) {
      formErorr.innerHTML = errorText;
    }

    formErorr.classList.add('d-block');
  }

  /** Get form values as object */
  getValues() {
    const formData = new FormData(this.form);
    return formDataToObj(formData);
  }

  /** Get form values as FormData */
  getFormData() {
    const formData = new FormData(this.form);
    return formData;
  }
}
