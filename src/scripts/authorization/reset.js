import '../common';
import { FormManager } from '../helpers';
import resetSuccessTemplate from '../../templates/auth/resetSuccess.hbs';
import Axios from 'axios';

document.addEventListener('DOMContentLoaded', function() {
  const formManager = new FormManager('js-reset-form');
  formManager.setHandler(handleReset);
});

/** @param {FormManager} manager */
function handleReset(manager) {
  const data = manager.getValues();
  return Axios.post('/auth/password/reset/', {
    email: data.email,
  }).then(() => {
    manager.changeTemplate(resetSuccessTemplate());
  });
}
