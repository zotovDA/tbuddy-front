import '../common';
import { TemplateManager, formDataToObj, initApiErrorHandling } from '../helpers';
import processingTemplate from '../../templates/typo/processing.hbs';
import resetSuccessTemplate from '../../templates/auth/resetSuccess.hbs';
import Axios from 'axios';

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('js-reset-form').addEventListener('submit', handleReset);
});

/** @param {Event} e */
function handleReset(e) {
  e.preventDefault();
  this.classList.remove('was-validated');
  if (!this.checkValidity()) {
    this.classList.add('was-validated');
    return;
  }

  const submitButtonTemplate = new TemplateManager(this.querySelector('button[type=submit]'));
  submitButtonTemplate.change(processingTemplate({ text: 'Loading' }));

  const formData = new FormData(this);
  const data = formDataToObj(formData);

  return Axios.post('/auth/password/reset/', {
    email: data.email,
  })
    .then(() => {
      e.target.outerHTML = resetSuccessTemplate();
    })
    .catch(error => {
      initApiErrorHandling(e.target, error.response.data);
      submitButtonTemplate.restore();
    });
}
