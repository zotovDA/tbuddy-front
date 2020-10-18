import '../common';
import { FormManager, getURLParams } from '../helpers';
import resetSuccessTemplate from '../../templates/auth/resetConfirmSuccess.hbs';
import Axios from 'axios';

document.addEventListener('DOMContentLoaded', function() {
  const formManager = new FormManager('js-reset-confirm-form');
  formManager.setHandler(handleResetConfirm);
});

/** @param {FormManager} manager */
function handleResetConfirm(manager) {
  const urlParams = getURLParams();
  const data = manager.getValues();

  if (data['password'] !== data['password-repeat']) {
    manager.showFieldError('password-repeat');
  }

  return Axios.post('/auth/password/reset/confirm/', {
    new_password: data.password,
    uidb64: urlParams.get('uidb64'),
    token: urlParams.get('token'),
  }).then(() => {
    // TODO: obtain token after resetting
    manager.changeTemplate(resetSuccessTemplate());
  });
}
