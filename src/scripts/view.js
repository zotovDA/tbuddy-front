import Toast from 'bootstrap/js/dist/toast';

import unauthorizedTemplate from '../templates/header/_unauthorized.hbs';
import authorizedTemplate from '../templates/header/_authorized.hbs';
import authErrorTemplate from '../templates/auth/authError.hbs';
import toastTemplate from '../templates/pageToast.hbs';

const TOASTS_WRAPPER_ID = 'js-toasts-content';

function showToasts() {
  var toastElList = [].slice.call(document.querySelectorAll('.toast'));
  toastElList.forEach(function(toastEl) {
    return new Toast(toastEl).show();
  });
}

/**
 * add toasts in dom and init them
 * @param {{title: string, message: string}[]} errorsList
 */
export function showPageError(errorsList) {
  const wrapperNode = document.getElementById(TOASTS_WRAPPER_ID);
  wrapperNode.innerHTML = errorsList.reduce((result, errorItem) => {
    return (result += toastTemplate(errorItem));
  }, '');
  showToasts();
}

/**
 * Update profile control in nav menu
 * @param {{name: string} | null} user
 */
export function updateNavUser(user) {
  const profileNavControl = document.getElementById('js-nav-profile');
  if (!profileNavControl) {
    return null;
  } else {
    if (!user) {
      profileNavControl.innerHTML = unauthorizedTemplate();
    } else {
      profileNavControl.innerHTML = authorizedTemplate({
        name: user.name,
      });
    }
  }
}

export function drawAuthHandlerError() {
  const messageNode = document.getElementById('js-auth-handler-message');

  messageNode.innerHTML = authErrorTemplate();
}
