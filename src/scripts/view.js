import Toast from 'bootstrap/js/dist/toast';
import moment from 'moment';

import unauthorizedTemplate from '../templates/header/_unauthorized.hbs';
import authorizedTemplate from '../templates/header/_authorized.hbs';
import authErrorTemplate from '../templates/auth/authError.hbs';
import toastTemplate from '../templates/pageToast.hbs';

import alertTemplate from '../templates/alert.hbs';

import profileTemplate from '../templates/profile/userProfile.hbs';
import profileEditTemplate from '../templates/profile/profileEdit.hbs';
import saveLoadingButtonTemplate from '../templates/buttons/saveLoading.hbs';

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

// ----- PROFILE

/**
 * @param {{name: string, photo: string, bio: string, birthdate: string, skills: string[]}} user fetched user
 */
export function drawUserProfile(user) {
  const profileNode = document.getElementById('js-user-profile');
  profileNode.innerHTML = profileTemplate({ ...user, age: moment(user.birthdate).toNow(true) });
}

export function drawUserEditProfile(user) {
  const profileNode = document.getElementById('js-user-profile');
  profileNode.innerHTML = profileEditTemplate(user);
}

export function drawUserEditProfileLoader() {
  const profileNode = document.getElementById('js-profile-edit-form-submit');
  profileNode.innerHTML = saveLoadingButtonTemplate();
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

// ------ COMMON
export function drawPageError(message) {
  const pageErrorNode = document.getElementById('js-page-error');
  pageErrorNode.innerHTML = alertTemplate({ type: 'danger', message: message });
}
