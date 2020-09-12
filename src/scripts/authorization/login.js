import '../common';
import { formDataToObj, TemplateManager, initApiErrorHandling, getUserFromToken } from '../helpers';
import processingTemplate from '../../templates/typo/processing.hbs';
import Axios from 'axios';
import { saveUserSessionToStore } from '../auth';

document.addEventListener('DOMContentLoaded', function() {
  const signInForm = document.getElementById('js-sign-in-form');
  const signUpForm = document.getElementById('js-sign-up-form');

  signInForm.addEventListener('submit', handleLocalSignIn);
  signUpForm.addEventListener('submit', handleLocalSignUp);
});

function obtainToken(email, password) {
  return Axios.post('/auth/token/obtain/local/', {
    email: email,
    password: password,
  })
    .then(response => {
      const userSession = response.data;
      const userData = getUserFromToken(userSession.access);

      saveUserSessionToStore({
        access: userSession.access,
        refresh: userSession.refresh,
        name: userData.name,
        id: userData.id,
      });
    })
    .then(() => {
      window.location = '/';
    });
}

/** @param {Event} e */
function handleLocalSignIn(e) {
  e.preventDefault();
  this.classList.remove('was-validated');
  if (!this.checkValidity()) {
    this.classList.add('was-validated');
    return;
  }

  const submitButtonTemplate = new TemplateManager(this.querySelector('button[type=submit]'));
  submitButtonTemplate.change(processingTemplate({ text: 'Signing in' }));

  const formData = new FormData(this);
  const authData = formDataToObj(formData);

  obtainToken(authData.email, authData.password).catch(error => {
    initApiErrorHandling(e.target, error.response.data);
    submitButtonTemplate.restore();
  });
}

/** @param {Event} e */
function handleLocalSignUp(e) {
  e.preventDefault();
  this.classList.remove('was-validated');
  if (!this.checkValidity()) {
    this.classList.add('was-validated');
    return;
  }

  const formData = new FormData(this);
  const authData = formDataToObj(formData);

  if (authData['password'] !== authData['password-repeat']) {
    this.querySelector('[name=password-repeat]').classList.add('is-invalid');
    return;
  }

  const submitButtonTemplate = new TemplateManager(this.querySelector('button[type=submit]'));
  submitButtonTemplate.change(processingTemplate({ text: 'Signing up' }));

  Axios.post('/auth/user/', {
    email: authData.email,
    password: authData.password,
  })
    .then(() => {
      // verify alert will be in profile
      Axios.post('/auth/email/verify/', {
        email: authData.email,
      });
      return obtainToken(authData.email, authData.password);
    })
    .catch(error => {
      initApiErrorHandling(e.target, error.response.data);
      submitButtonTemplate.restore();
    });
}
