import processingBtn from '../../templates/buttons/processing.hbs';

import subscribeSuccess from '../../templates/landing/subscribeSuccess.hbs';
import subscribeError from '../../templates/landing/subscribeError.hbs';

import '../common';

function onInit() {
  initSubscribeBinds();
}

const subscribeWrapperClass = 'js-subscription-wrapper';
const subscribeBtnClass = 'js-subscription-button';

let subscribeFormState;

/** @param {Event} e */
export function handleSubscribeSubmit(e) {
  e.preventDefault();
  this.classList.add('was-validated');
  if (!this.checkValidity()) {
    return;
  }

  subscribeFormState = this.outerHTML;
  drawBtnLoading();

  const formData = new FormData(this);
  formData.append('ajax', 'true');

  fetch(this.action, { method: 'post', body: formData })
    .then(response => {
      return response.json();
    })
    .then(json => {
      drawSubscribeState(json.result);
    });
}

function drawBtnLoading() {
  [...document.getElementsByClassName(subscribeBtnClass)].forEach(item => {
    item.innerHTML = processingBtn({ text: 'Sending' });
  });
}

function drawSubscribeState(errorMessage) {
  const isSuccess = !errorMessage;
  const subscribeWrappers = [...document.getElementsByClassName(subscribeWrapperClass)];

  if (isSuccess) {
    subscribeWrappers.forEach(item => (item.innerHTML = subscribeSuccess()));
  } else {
    subscribeWrappers.forEach(item => (item.innerHTML = subscribeError({ text: errorMessage })));
    [...document.getElementsByClassName('js-subscribe-again')].forEach(item => {
      item.addEventListener('click', restoreSubscribeForm);
    });
  }
}

function restoreSubscribeForm() {
  [...document.getElementsByClassName(subscribeWrapperClass)].forEach(
    item => (item.innerHTML = subscribeFormState)
  );
  initSubscribeBinds();
}

const initSubscribeBinds = () => {
  [...document.querySelectorAll('.js-subscription-form')].forEach(item => {
    item.addEventListener('submit', handleSubscribeSubmit);
  });
};

document.addEventListener('DOMContentLoaded', onInit);
