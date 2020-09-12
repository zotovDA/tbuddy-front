import '../common';
import { TemplateManager, formDataToObj, initApiErrorHandling } from '../helpers';
import processingTemplate from '../../templates/typo/processing.hbs';
import resetSuccessTemplate from '../../templates/auth/resetConfirmSuccess.hbs';
import Axios from 'axios';

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('js-reset-confirm-form').addEventListener('submit', handleResetConfirm);
});

/** @param {Event} e */
function handleResetConfirm(e) {
  e.preventDefault();
  this.classList.remove('was-validated');
  if (!this.checkValidity()) {
    this.classList.add('was-validated');
    return;
  }

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const formData = new FormData(this);
  const data = formDataToObj(formData);

  if (data['password'] !== data['password-repeat']) {
    this.querySelector('[name=password-repeat]').classList.add('is-invalid');
    return;
  }

  const submitButtonTemplate = new TemplateManager(this.querySelector('button[type=submit]'));
  submitButtonTemplate.change(processingTemplate({ text: 'Loading' }));

  return Axios.post('/auth/password/reset/confirm/', {
    new_password: data.password,
    uidb64: urlParams.get('uidb64'),
    token: urlParams.get('token'),
  })
    .then(() => {
      // TODO: obtain token after resetting
      e.target.outerHTML = resetSuccessTemplate();
    })
    .catch(error => {
      initApiErrorHandling(e.target, error.response.data, true);
      submitButtonTemplate.restore();
    });
}
