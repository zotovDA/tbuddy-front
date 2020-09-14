import { getCurrentUserId } from '../auth';
import { drawPageError } from '../view';
import { fetchUser } from '../../__mocks__/profile';
import { formDataToObj, delay, initApiErrorHandling, TemplateManager } from '../helpers';

import alertTemplate from '../../templates/alert.hbs';
import profileEditStep2Template from '../../templates/profile/_step2.hbs';
import profileEditStep3Template from '../../templates/profile/_step3.hbs';
import profileEditStep4Template from '../../templates/profile/_step4.hbs';

import profileSuccessEditTemplate from '../../templates/profile/editSuccessMessage.hbs';

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
let currentUser = {
  firstname: '',
  surname: '',
  gender: '',
  birthdate: '',
  bio: '',
  photo: '',
  place: '',
  skills: [],
  contacts: '',

  isBuddy: false,
};
document.addEventListener('init', function() {
  profileContainer = document.getElementById('js-user-profile');
  if (!getCurrentUserId()) {
    profileContainer.innerHTML = alertTemplate({ type: 'danger', message: 'No user id' });
    return;
  }
  if (urlParams.has('fromRegister')) {
    initRegistrationSteps();
  } else {
    Axios.get(`/profiles/${getCurrentUserId()}/`)
      .then(response => {
        const userData = response.data;
        currentUser = {
          firstname: userData.first_name,
          surname: userData.last_name,
          gender: userData.gender,
          birthdate: moment(userData.dob).format('MM/DD/YYYY'),
          bio: userData.bio,
          photo:
            userData.image ||
            'https://images.unsplash.com/photo-1509304890243-11f891c4270c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
          place: userData.city,
          skills: userData.skills,
          contacts: userData.contacts,

          isBuddy: userData.is_buddy,
        };

        drawUserProfile();
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
    moment(data['birthdate'], 'MM/DD/YYYY').isBetween(
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
    dob: moment(data['birthdate'], 'MM/DD/YYYY').format('YYYY-MM-DD'),
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
  document.getElementById('profile-photo').addEventListener('change', function() {
    if (this.files[0]) {
      var reader = new FileReader();

      reader.onload = function(e) {
        document.getElementById('js-profile-photo-preview').classList.remove('d-none');
        const previewImgs = [...document.querySelectorAll('#js-profile-photo-preview img')];
        previewImgs.forEach(item => (item.src = e.target.result));
      };
      reader.readAsDataURL(this.files[0]);
    }
  });
}

function handleEditPhoto(e) {
  e.preventDefault();
  this.classList.remove('was-validated');
  if (!this.checkValidity()) {
    this.classList.add('was-validated');
    return;
  }

  const formData = new FormData(this);

  const submitButtonTemplate = new TemplateManager(this.querySelector('button[type=submit]'));
  submitButtonTemplate.change(processingTemplate({ text: 'Loading' }));

  Axios({
    method: 'put',
    url: `/profiles/${getCurrentUserId()}/photo/`,
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
    .then(response => {
      currentUser.photo = response.data.image;
      initStep3();
    })
    .catch(error => {
      initApiErrorHandling(e.target, error.response.data);
      submitButtonTemplate.restore();
    });
}

function initStep3() {
  profileContainer.innerHTML = profileEditStep3Template();
  document.getElementById('js-step-skip').addEventListener('click', initStep4);
}

function initStep4() {
  profileContainer.innerHTML = profileEditStep4Template();
  document.getElementById('js-to-profile').addEventListener('click', function() {
    drawUserProfile();
  });
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

function drawUserProfile() {
  profileContainer.innerHTML = profileTemplate({
    ...currentUser,
    age: moment().diff(moment(currentUser.birthdate, 'DD/MM/YYYY'), 'years'),
  });
  document.getElementById('js-edit-primary').addEventListener('click', drawUserEditProfile);
  document
    .getElementById('js-photo-edit-modal-form')
    .addEventListener('submit', handleModalEditPhoto);
  document.getElementById('profile-photo').addEventListener('change', function() {
    if (this.files[0]) {
      var reader = new FileReader();

      reader.onload = function(e) {
        document.getElementById('js-profile-photo-preview').classList.remove('d-none');
        const previewImgs = [...document.querySelectorAll('#js-profile-photo-preview img')];
        previewImgs.forEach(item => (item.src = e.target.result));
      };
      reader.readAsDataURL(this.files[0]);
    }
  });
}

function handleModalEditPhoto(e) {
  e.preventDefault();
  this.classList.remove('was-validated');
  if (!this.checkValidity()) {
    this.classList.add('was-validated');
    return;
  }

  const formData = new FormData(this);

  const submitButtonTemplate = new TemplateManager(this.querySelector('button[type=submit]'));
  submitButtonTemplate.change(processingTemplate({ text: 'Loading' }));

  Axios({
    method: 'put',
    url: `/profiles/${getCurrentUserId()}/photo/`,
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
    .then(response => {
      currentUser.photo = response.data.image;
      [...document.getElementsByClassName('js-profile-image')].forEach(
        item => (item.src = currentUser.photo)
      );
      document.getElementById('form-message').innerHTML = profileSuccessEditTemplate();
      submitButtonTemplate.restore();
    })
    .catch(error => {
      initApiErrorHandling(e.target, error.response.data);
      submitButtonTemplate.restore();
    });
}

function drawUserEditProfile() {
  profileContainer.innerHTML = profileEditTemplate(currentUser);
  document.getElementById('js-profile-edit-form').addEventListener('submit', handleEditProfile);
  [...document.getElementsByClassName('js-profile-edit-cancel')].forEach(item =>
    item.addEventListener('click', drawUserProfile)
  );
}

function handleEditProfile(e) {
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
    moment(data['birthdate'], 'DD/MM/YYYY').isBetween(
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

  Axios.put(`/profiles/${getCurrentUserId()}/`, {
    first_name: data['firstname'],
    last_name: data['surname'],
    gender: data['gender'],
    dob: moment(data['birthdate'], 'MM/DD/YYYY').format('YYYY-MM-DD'),
    bio: data['bio'],
  })
    .then(() => {
      currentUser = { ...currentUser, ...data };
      document.getElementById('form-message').innerHTML = profileSuccessEditTemplate();
      submitButtonTemplate.restore();
    })
    .catch(error => {
      initApiErrorHandling(e.target, error.response.data);
      submitButtonTemplate.restore();
    });
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
