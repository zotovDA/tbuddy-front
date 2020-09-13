import { getCurrentUserId } from '../auth';
import { drawPageError } from '../view';
import { fetchUser } from '../../__mocks__/profile';
import { formDataToObj, delay, initApiErrorHandling, TemplateManager } from '../helpers';

import alertTemplate from '../../templates/alert.hbs';
import profileEditStep2Template from '../../templates/profile/_step2.hbs';

import profileTemplate from '../../templates/profile/userProfile.hbs';
import profileEditTemplate from '../../templates/profile/profileEdit.hbs';
import saveLoadingButtonTemplate from '../../templates/buttons/processing.hbs';
import processingTemplate from '../../templates/typo/processing.hbs';

import moment from 'moment';

import '../common';
import { updateBinds } from '../binds';
import Axios from 'axios';

/**
 * TODO List:
 * - param in url to continue registration
 * - fetch user data
 * - edit photo
 * - becomde buddy
 */

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

let profileContainer;
let currentUser = {};

document.addEventListener('init', function() {
  profileContainer = document.getElementById('js-user-profile');
  if (!getCurrentUserId()) {
    profileContainer.innerHTML = alertTemplate({ type: 'danger', message: 'No user id' });
    return;
  }
  if (urlParams.has('fromRegister')) {
    initRegistrationSteps();
  } else {
    Axios.get(`/profiles/${getCurrentUserId()}`)
      .then(() => {
        // TODO: draw edit user
        // TODO: cache data from response
      })
      .catch(error => {
        if (error.response.status === 404) {
          initRegistrationSteps();
        } else {
          profileContainer.innerHTML = alertTemplate({
            type: 'danger',
            message: "Can't load user data",
          });
        }
      });
  }
});

function initRegistrationSteps() {
  profileContainer.innerHTML = profileEditTemplate({ needCreate: true });
  document.getElementById('js-profile-edit-form').addEventListener('submit', handleCreatingProfile);
}

/** @param {Event} e */
function handleCreatingProfile(e) {
  e.preventDefault();
  this.classList.remove('was-validated');
  if (!this.checkValidity()) {
    this.classList.add('was-validated');
    return;
  }

  const formData = new FormData(this);
  const data = formDataToObj(formData);

  const dobRegex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;
  const currentYear = moment().get('year');
  if (
    dobRegex.test(data['birthdate']) &&
    moment(data['birthdate']).isBetween(
      moment()
        .set('year', currentYear - 120)
        .format(),
      moment()
        .set('year', currentYear - 14)
        .format()
    )
  ) {
    this.querySelector('[name=birthdate]').classList.remove('is-invalid');
  } else {
    this.querySelector('[name=birthdate]').classList.add('is-invalid');
    return;
  }

  const submitButtonTemplate = new TemplateManager(this.querySelector('button[type=submit]'));
  submitButtonTemplate.change(processingTemplate({ text: 'Loading' }));

  Axios.post('/profiles/', {
    first_name: data['firstname'],
    last_name: data['surname'],
    gender: data['gender'],
    dob: moment(data['birthdate']).format('YYYY-MM-DD'),
    bio: data['bio'],
  })
    .then(() => {
      currentUser = { ...data };
      initStep2();
    })
    .catch(error => {
      initApiErrorHandling(e.target, error.response.data);
      submitButtonTemplate.restore();
    });
}

function initStep2() {
  profileContainer.innerHTML = profileEditStep2Template();
  document.getElementById('js-profile-edit-form').addEventListener('submit', handleEditPhoto);
  document.getElementById('js-profile-step2-skip').addEventListener('click', initStep3);
}

function handleEditPhoto() {
  // TODO: handle photo change
}

function initStep3() {
  // TODO: step3 template
}

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

const initProfileBinds = () => {
  [...document.querySelectorAll('.js-profile-edit')].forEach(item => {
    updateBinds(item, 'click', initEditProfile);
  });
};

const initProfileEditBinds = () => {
  [...document.querySelectorAll('.js-profile-edit-form')].forEach(item => {
    updateBinds(item, 'submit', onEditUserSubmit);
  });
  [...document.querySelectorAll('.js-profile-edit-cancel')].forEach(item => {
    updateBinds(item, 'click', initUserProfileFromCache);
  });
};
