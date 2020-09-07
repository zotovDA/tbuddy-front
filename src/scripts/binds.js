import { handleGoBack } from './helpers';
import { handleLogout } from './auth';
import { initEditProfile, initUserProfileFromCache, onEditUserSubmit } from './profile';
import animateScrollTo from 'animated-scroll-to';
import { handleSubscribeSubmit } from './pages/landing';

const navigateBack = '.js-go-back';
const logout = '.js-logout';

function updateBinds(target, eventType, bindFunc) {
  target.removeEventListener(eventType, bindFunc);
  target.addEventListener(eventType, bindFunc);
}

export default function initAllBinds() {
  initNavigateBackBinds();
  initLogoutBinds();
  initScrollToBinds();
}

export const initScrollToBinds = () => {
  [...document.querySelectorAll('.js-scroll-to')].forEach(item => {
    const scrollTarget = item.dataset.target;
    if (!scrollTarget) throw 'no scroll target';

    updateBinds(item, 'click', () => animateScrollTo(document.getElementById(scrollTarget)));
  });
};

export const initProfileBinds = () => {
  [...document.querySelectorAll('.js-profile-edit')].forEach(item => {
    updateBinds(item, 'click', initEditProfile);
  });
};

export const initProfileEditBinds = () => {
  [...document.querySelectorAll('.js-profile-edit-form')].forEach(item => {
    updateBinds(item, 'submit', onEditUserSubmit);
  });
  [...document.querySelectorAll('.js-profile-edit-cancel')].forEach(item => {
    updateBinds(item, 'click', initUserProfileFromCache);
  });
};

export const initNavigateBackBinds = () => {
  [...document.querySelectorAll(navigateBack)].forEach(item => {
    updateBinds(item, 'click', handleGoBack);
    item.removeEventListener('click', handleGoBack);
    item.addEventListener('click', handleGoBack);
  });
};

export const initLogoutBinds = () => {
  [...document.querySelectorAll(logout)].forEach(item => {
    updateBinds(item, 'click', handleLogout);
  });
};

export const initSubscribeBinds = () => {
  [...document.querySelectorAll('.js-subscription-form')].forEach(item => {
    updateBinds(item, 'submit', handleSubscribeSubmit);
  });
};
