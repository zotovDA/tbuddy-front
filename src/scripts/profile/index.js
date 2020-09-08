import { getCurrentUserId } from '../auth';
import { drawPageError } from '../view';
import { fetchUser } from '../../__mocks__/profile';
import { initProfileEditBinds, initProfileBinds } from '../binds';
import { formDataToObj, delay } from '../helpers';

import profileTemplate from '../../templates/profile/userProfile.hbs';
import profileEditTemplate from '../../templates/profile/profileEdit.hbs';
import saveLoadingButtonTemplate from '../../templates/buttons/processing.hbs';

import moment from 'moment';

let currentUser = {};

export function initUserProfileFromCache() {
  drawUserProfile(currentUser);
  initProfileBinds();
}

export function initUserProfile() {
  const id = getCurrentUserId();
  return fetchUser(id)
    .then(response => {
      currentUser = { ...response };

      drawUserProfile(response);
      initProfileBinds();
    })
    .catch(error => {
      currentUser = {};
      drawPageError(error);
    });
}

export function initEditProfile() {
  drawUserEditProfile(currentUser);
  initProfileEditBinds();
}

/** @param {Event} e */
export function onEditUserSubmit(e) {
  e.preventDefault();
  drawUserEditProfileLoader();

  const formData = new FormData(e.target);
  const userInfo = formDataToObj(formData);

  return delay(1000).then(() => {
    currentUser = { ...currentUser, ...userInfo };
    initUserProfileFromCache();
  });
}

/**
 * @param {{name: string, photo: string, bio: string, birthdate: string, skills: string[]}} user fetched user
 */
function drawUserProfile(user) {
  const profileNode = document.getElementById('js-user-profile');
  profileNode.innerHTML = profileTemplate({ ...user, age: moment(user.birthdate).toNow(true) });
}

function drawUserEditProfile(user) {
  const profileNode = document.getElementById('js-user-profile');
  profileNode.innerHTML = profileEditTemplate(user);
}

function drawUserEditProfileLoader() {
  const profileNode = document.getElementById('js-profile-edit-form-submit');
  profileNode.innerHTML = saveLoadingButtonTemplate({ text: 'Saving' });
}
