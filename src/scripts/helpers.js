// Script logic helpers

import Axios from 'axios';
import jwt_decode from 'jwt-decode';
import moment from 'moment';

import {
  FORM_ERROR_CLASSNAME,
  FORM_ERROR_CONTAINER_QUERY,
  FORM_VALIDATION_STATE_CLASSNAME,
  INVALID_FIELD_CLASSNAME,
  momentDateFormat,
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
 * @param {any} responseData
 * @returns {string}
 */
export function parseApiErrors(responseData) {
  if (!responseData) return '';

  const rawError = JSON.stringify(responseData);
  Logger.error(rawError);

  // if non field errors
  if (responseData.detail || responseData.non_field_errors) {
    const errorsList = responseData.non_field_errors || [''];
    return responseData.detail || errorsList.join('\n');
  }

  // handle fields errors
  const unknowFieldErrors = [];
  Object.keys(responseData).forEach(field => {
    unknowFieldErrors.push(`${field}: ${responseData[field]}`);
  });

  if (unknowFieldErrors.length > 0) {
    return unknowFieldErrors.join('\n');
  }

  return rawError;
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

// ---------- API MODELS

/** User model
 * @typedef {Object} userModel
 * @property {boolean} isVerified
 * @property {boolean} isProfileCreated
 * @property {boolean} isBuddy
 * traveler fields:
 * @property {string} firstname
 * @property {string} surname
 * @property {string} gender
 * @property {string} dob
 * @property {number} age
 * @property {string} photo
 * @property {string} bio
 * buddy fields:
 * @property {string[]} activities
 * @property {string} place city display name
 * @property {number} city city id
 * @property {string} contacts
 */

const initialUser = {
  firstname: '',
  surname: '',
  gender: '',
  dob: '',
  age: '',
  bio: '',
  photo: '',
  place: '',
  city: '',
  activities: [],
  contacts: '',

  isBuddy: false,
  isVerified: false,
  isProfileCreated: false,
};

/** Format api user to user
 * @param {any} data
 * @returns {userModel}
 */
export function formatUser(data) {
  try {
    const userData = {
      firstname: data.first_name,
      surname: data.last_name,
      gender: data.gender,
      dob: moment(data.dob, 'YYYY-MM-DD').format(momentDateFormat),
      age: moment().diff(moment(data.dob, 'YYYY-MM-DD'), 'years'),
      bio: data.bio,
      photo: data.image,
      place: data.city && data.city.display_name,
      city: data.city && data.city.id,
      activities: data.activities && data.activities.map(activity => activity.type),
      contacts: data.contacts,

      isBuddy: data.is_buddy,
      isVerified: data.user && data.user.is_email_verified,
      isProfileCreated: data.is_manual,
    };
    return userData;
  } catch (error) {
    Logger.error(error);
    return initialUser;
  }
}

/** Request model
 * @typedef {Object} requestModel
 * @property {number} id
 * @property {boolean} isOpen
 * @property {boolean} isProgress
 * @property {boolean} isCanceled
 * @property {boolean} isDone
 *
 * @property {string} name
 * @property {number} price
 * @property {string} description
 * @property {string[]} activities
 *
 * @property {string} location
 * @property {string} dateFrom
 * @property {string} dateTo
 *
 * @property {number} buddiesCount
 * @property {{id: number, name: string, contacts: string}} buddy
 */

/** Format request from api to requestModel
 * @param {any} request
 * @returns {requestModel}
 */
export function formatRequest(request) {
  try {
    // TODO: add isApplied if user applied
    const formattedClaim = {
      id: request.id,
      isOpen: request.status === 0,
      isProgress: request.status === 1,
      isCanceled: request.status === 3,
      isDone: request.status === 2,
      name: request.applicant_profile.first_name,
      price: parseInt(request.price),
      description: request.details,
      activities: (request.activities || []).map(activity => activity.type),
      location: request.city.display_name,
      dateFrom: moment(request.begins_at, 'YYYY-MM-DD').format('DD.MM.YYYY'),
      dateTo: moment(request.ends_at, 'YYYY-MM-DD').format('DD.MM.YYYY'),
      buddy:
        (request.candidate_accepted && {
          id: request.candidate_accepted.id,
          name: request.candidate_accepted.respondent_profile.first_name,
          contacts: request.candidate_accepted.respondent_profile.contacts,
        }) ||
        undefined,
      buddiesCount: request.candidate_count || 0,
    };
    return formattedClaim;
  } catch (error) {
    return {};
  }
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
   * @param {Function?} onFormReady actions to be done aftre form init
   */
  constructor(formId, onFormReady = () => {}) {
    this.formId = formId;
    this.form = document.getElementById(formId);
    this.formTemplateManager = new TemplateManager(this.form);
    this.onFormReady = onFormReady;
    onFormReady();
  }

  /** Set submit event handler
   * @param {(manager: this, formObj: element) => Promise} submitHandler
   * @param {{
   * disableValidation?: boolean
   * loadingText?: string
   * }} options
   */
  setHandler(submitHandler, options = {}) {
    // save passed params for future
    this.userSubmitHandler = submitHandler;
    this.userOptions = options;

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

      const submitHandlerResult = submitHandler.call(this, that);

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

  /** Change form outerHTML to new template
   * @param {string} newTemplate
   */
  changeTemplate(newTemplate) {
    this.formTemplateManager.change(newTemplate);
  }

  /** Restore form to original state */
  restoreForm() {
    this.formTemplateManager.restore();
    this.onFormReady();
  }
}

/** Manage User state */
export class User {
  constructor() {
    // initial user info
    this.user = initialUser;
  }

  /** Get user data
   * @returns {userModel}
   */
  getData() {
    return this.user;
  }

  /** Update user data
   * @param {userModel} newData
   */
  setData(newData) {
    this.user = {
      ...this.user,
      ...newData,
    };
  }

  isBuddy() {
    return this.user.isBuddy;
  }

  isNotConfirmedBuddy() {
    return !this.isBuddy() && this.user.place;
  }

  isVerified() {
    return this.user.isVerified;
  }

  hasProfile() {
    return this.user.isProfileCreated;
  }
}
