import { handleGoBack } from './helpers';
import { handleLogout } from './auth';
import animateScrollTo from 'animated-scroll-to';

const navigateBack = '.js-go-back';
const logout = '.js-logout';

export function updateBinds(target, eventType, bindFunc) {
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

export const initNavigateBackBinds = () => {
  [...document.querySelectorAll(navigateBack)].forEach(item => {
    updateBinds(item, 'click', handleGoBack);
  });
};

export const initLogoutBinds = () => {
  [...document.querySelectorAll(logout)].forEach(item => {
    updateBinds(item, 'click', handleLogout);
  });
};
