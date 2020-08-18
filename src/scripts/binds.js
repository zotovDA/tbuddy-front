import { handleGoBack } from './helpers';
import { handleLogout } from './auth';

const navigateBack = '.js-go-back';
const logout = '.js-logout';

export default function initAllBinds() {
  initNavigateBack();
  initLogout();
}

export const initNavigateBack = () => {
  [...document.querySelectorAll(navigateBack)].forEach(item =>
    item.addEventListener('click', handleGoBack)
  );
};

export const initLogout = () => {
  [...document.querySelectorAll(logout)].forEach(item =>
    item.addEventListener('click', handleLogout)
  );
};
