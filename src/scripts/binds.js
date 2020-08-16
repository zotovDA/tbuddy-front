import { handleGoBack } from './helpers';

const navigateBack = '.js-go-back';

export default function initAllBinds() {
  initNavigateBack();
}

export const initNavigateBack = () => {
  [...document.querySelectorAll(navigateBack)].forEach(item =>
    item.addEventListener('click', handleGoBack)
  );
};
