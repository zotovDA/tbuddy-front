import { handleGoBack } from './helpers';
import { handleLogout } from './auth';
import { initEditProfile, initUserProfileFromCache, onEditUserSubmit } from './profile';

const navigateBack = '.js-go-back';
const logout = '.js-logout';

export default function initAllBinds() {
  initNavigateBackBinds();
  initLogoutBinds();
}

export const initProfileBinds = () => {
  [...document.querySelectorAll('.js-profile-edit')].forEach(item => {
    item.removeEventListener('click', initEditProfile);
    item.addEventListener('click', initEditProfile);
  });
};

export const initProfileEditBinds = () => {
  [...document.querySelectorAll('.js-profile-edit-form')].forEach(item => {
    item.removeEventListener('submit', onEditUserSubmit);
    item.addEventListener('submit', onEditUserSubmit);
  });
  [...document.querySelectorAll('.js-profile-edit-cancel')].forEach(item => {
    item.removeEventListener('click', initUserProfileFromCache);
    item.addEventListener('click', initUserProfileFromCache);
  });
};

export const initNavigateBackBinds = () => {
  [...document.querySelectorAll(navigateBack)].forEach(item => {
    item.removeEventListener('click', handleGoBack);
    item.addEventListener('click', handleGoBack);
  });
};

export const initLogoutBinds = () => {
  [...document.querySelectorAll(logout)].forEach(item => {
    item.removeEventListener('click', handleLogout);
    item.addEventListener('click', handleLogout);
  });
};
