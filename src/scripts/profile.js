import { getCurrentUserId } from './auth';
import {
  drawUserProfile,
  drawUserEditProfile,
  drawUserEditProfileLoader,
  drawPageError,
} from './view';
import { fetchUser } from '../__mocks__/profile';
import { initProfileEditBinds, initProfileBinds } from './binds';
import { formDataToObj, delay } from './helpers';

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
