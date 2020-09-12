import jwt_decode from 'jwt-decode';

export function handleGoBack() {
  history.back();
}

export function getURLParams() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams;
}

export function formDataToObj(formData = {}) {
  let object = {};
  formData.forEach((value, key) => {
    object[key] = value;
  });

  return object;
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getUserFromToken(token) {
  const tokenData = jwt_decode(token);
  return {
    id: tokenData.user_id || tokenData.id,
    name: tokenData.name || getNameFromEmail(tokenData.email),
  };
}

export function getNameFromEmail(email) {
  return email.slice(0, email.indexOf('@'));
}

export function parseApiErrors(error) {
  if (!error) return '';

  const errorsList = error.non_field_errors || [''];
  return error.detail || errorsList.join('\n');
}

export class TemplateManager {
  /** @param {Element} element */
  constructor(element) {
    this.element = element;
    this.initialState = element.innerHTML;
  }

  change(template) {
    this.element.innerHTML = template;
  }

  restore() {
    this.element.innerHTML = this.initialState;
  }
}

export function initApiErrorHandling(form, response, forceError) {
  if (!response) return null;
  const formError = form.querySelector('.form-feedback.invalid-feedback');
  [...form.querySelectorAll('[name]')].forEach(input => input.classList.remove('is-invalid'));
  form.classList.remove('was-validated');
  formError.classList.remove('d-block');

  if (forceError || response.detail || response.non_field_errors) {
    formError.innerHTML = parseApiErrors(response) || 'Something unexpected happened';
    formError.classList.add('d-block');
    return;
  }

  Object.keys(response).forEach(field => {
    try {
      form.querySelector(`[name=${field}] + .invalid-feedback`).innerHTML = response[field];
      form.querySelector(`[name=${field}]`).classList.add('is-invalid');
    } catch (e) {
      // pass
    }
  });
}
