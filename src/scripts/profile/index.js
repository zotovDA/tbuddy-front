import Tooltip from 'bootstrap/js/src/tooltip';
import { getCurrentUserId } from '../auth';
import { formatUser, FormManager, getURLParams, User } from '../helpers';
import { initCitySearchInput, initDoBInput } from '../view';

import alertTemplate from '../../templates/alert.hbs';
import profileEditStep2Template from '../../templates/profile/_step2.hbs';
import profileEditStep3Template from '../../templates/profile/_step3.hbs';
import profileEditStep4Template from '../../templates/profile/_step4.hbs';

import profileSuccessEditTemplate from '../../templates/profile/editSuccessMessage.hbs';

import profileTemplate from '../../templates/profile/userProfile.hbs';
import editBuddyTemplate from '../../templates/profile/buddyEdit.hbs';
import profileEditTemplate from '../../templates/profile/profileEdit.hbs';

import moment from 'moment';

import '../common';
import Axios from 'axios';
import { momentDateFormat, requestsCategories } from '../constants';

const urlParams = getURLParams();

let profileContainer;
const user = new User();

document.addEventListener('init', function() {
  profileContainer = document.getElementById('js-user-profile');
  if (!getCurrentUserId()) {
    // TODO: push page error
    profileContainer.innerHTML = alertTemplate({ type: 'danger', message: 'No user id' });
    return;
  }
  if (urlParams.has('fromRegister')) {
    initRegistrationSteps();
  } else {
    Axios.get(`/profiles/${getCurrentUserId()}/`)
      .then(response => {
        const userData = response.data;
        user.setData(formatUser(userData));

        if (user.hasProfile()) {
          drawUserProfile();
        } else {
          // user didn't finish registration
          initRegistrationSteps(user.getData());
        }
      })
      .catch(error => {
        console.error(error);
        if (error.response.status === 404) {
          initRegistrationSteps();
        } else {
          // TODO: push page error
          profileContainer.innerHTML = alertTemplate({
            type: 'danger',
            message: "Can't load user data",
          });
        }
      });
  }
});

function initRegistrationSteps(userData) {
  if (!userData) {
    // new user
    profileContainer.innerHTML = profileEditTemplate({ needCreate: true });

    const registrationFormManager = new FormManager('js-profile-edit-form');
    registrationFormManager.setHandler(handleCreatingProfile);
  } else {
    // social user
    profileContainer.innerHTML = profileEditTemplate({ ...userData, needCreate: true });
    initDoBInput('[name=dob]');

    const registrationFormManager = new FormManager('js-profile-edit-form');
    registrationFormManager.setHandler(manager => handleCreatingProfile(manager, true));
  }
}

function initPhotoChangeBinds() {
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

function initStep2() {
  profileContainer.innerHTML = profileEditStep2Template();

  const formManager = new FormManager('js-profile-edit-form');
  formManager.setHandler(handleEditPhoto);

  document.getElementById('js-profile-step2-skip').addEventListener('click', initStep3);
  initPhotoChangeBinds();
}

function initStep3() {
  profileContainer.innerHTML = profileEditStep3Template();
  document
    .getElementById('js-create-buddy')
    .addEventListener('click', () => drawBuddyEditProfile(true));
  document.getElementById('js-step-skip').addEventListener('click', initStep4);
}

function initStep4() {
  profileContainer.innerHTML = profileEditStep4Template();
  document.getElementById('js-to-profile').addEventListener('click', function() {
    drawUserProfile();
  });
}

function drawUserProfile() {
  profileContainer.innerHTML = profileTemplate({
    ...user.getData(),
  });
  if (!user.isBuddy()) {
    document
      .getElementById('js-edit-buddy')
      .addEventListener('click', () => drawBuddyEditProfile());
    document.getElementById('js-edit-primary').addEventListener('click', drawUserEditProfile);

    const formManager = new FormManager('js-photo-edit-modal-form', initPhotoChangeBinds);
    formManager.setHandler(handleModalEditPhoto);
  } else {
    const buddyBadgeNode = document.querySelector('[data-toggle="tooltip"]');
    if (buddyBadgeNode) {
      new Tooltip(buddyBadgeNode);
    }
  }

  if (user.isNotConfirmedBuddy()) {
    document.getElementById('profile-moderation').classList.remove('d-none');
  }
}

function drawUserEditProfile() {
  const userData = user.getData();
  profileContainer.innerHTML = profileEditTemplate({
    ...userData,
    isFemale: userData.gender !== 'male',
  });

  const editProfileFormManager = new FormManager('js-profile-edit-form', function() {
    initDoBInput('[name=dob]');
    [...document.getElementsByClassName('js-profile-edit-cancel')].forEach(item =>
      item.addEventListener('click', drawUserProfile)
    );
  });
  editProfileFormManager.setHandler(handleEditProfile);
}

function drawBuddyEditProfile(needCreate) {
  const userData = user.getData();
  profileContainer.innerHTML = editBuddyTemplate({
    ...userData,
    profileSkills: requestsCategories.map(skill => ({
      label: skill,
      checked: userData.activities.some(item => skill === item),
    })),
    needCreate: needCreate,
  });

  const buddyEditFormManager = new FormManager('js-profile-edit-form', function() {
    [...document.getElementsByClassName('js-profile-edit-cancel')].forEach(item =>
      item.addEventListener('click', drawUserProfile)
    );

    initCitySearchInput('profile-city', { value: userData.city, label: userData.place });
  });
  buddyEditFormManager.setHandler(manager => handleEditBuddyProfile(manager, needCreate));
}

/** Edit buddy info profile
 * @param {FormManager} manager
 * @param {boolean?} inRegister
 */
function handleEditBuddyProfile(manager, inRegister) {
  const data = manager.getValues();

  if (data['city'] === '') {
    manager.showFieldError('city');
    return;
  }

  Axios.patch(`/profiles/${getCurrentUserId()}/`, {
    bio: data['bio'],
    city_id: parseInt(data['city']),
    contacts: data['contacts'],
    activities: data['activities']
      ? typeof data['activities'] === 'string'
        ? [{ type: data['activities'] }]
        : data['activities'].map(skill => ({ type: skill }))
      : [],
  }).then(() => {
    user.setData(data);

    if (inRegister) {
      initStep4();
    } else {
      drawUserProfile();
      document.getElementById('profile-edit-success').classList.remove('d-none');
    }
  });
}

/** Handle creating profile
 * @param {FormManager} manager
 * @param {boolean?} hasProfile
 */
function handleCreatingProfile(manager, hasProfile) {
  const data = manager.getValues();

  Axios({
    method: hasProfile ? 'PUT' : 'POST',
    url: hasProfile ? `/profiles/${getCurrentUserId()}/` : '/profiles/',
    data: {
      first_name: data['firstname'],
      last_name: data['surname'],
      gender: data['gender'],
      dob: moment(data['dob'], momentDateFormat).format('YYYY-MM-DD'),
      bio: data['bio'],
    },
  }).then(() => {
    user.setData(data);

    initStep2();
  });
}

/** Edit profile information
 * @param {FormManager} manager
 */
function handleEditProfile(manager) {
  const data = manager.getValues();
  Axios.patch(`/profiles/${getCurrentUserId()}/`, {
    first_name: data['firstname'],
    last_name: data['surname'],
    gender: data['gender'],
    dob: moment(data['dob'], momentDateFormat).format('YYYY-MM-DD'),
    bio: data['bio'],
  }).then(() => {
    localStorage.setItem(
      'user',
      JSON.stringify({ id: getCurrentUserId(), name: data['firstname'] })
    );
    user.setData(data);

    drawUserProfile();
    document.getElementById('profile-edit-success').classList.remove('d-none');
  });
}

/** Change profile photo
 * @param {FormManager} manager
 */
function handleEditPhoto(manager) {
  const formData = manager.getFormData();

  Axios({
    method: 'put',
    url: `/profiles/${getCurrentUserId()}/photo/`,
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(response => {
    user.setData({ photo: response.data.image });

    initStep3();
  });
}

/** Change profile photo in modal
 * @param {FormManager} manager
 */
function handleModalEditPhoto(manager) {
  const formData = manager.getFormData();

  Axios({
    method: 'put',
    url: `/profiles/${getCurrentUserId()}/photo/`,
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(response => {
    user.setData({ photo: response.data.image });

    [...document.getElementsByClassName('js-profile-image')].forEach(
      item => (item.src = response.data.image)
    );
    document.getElementById('form-message').innerHTML = profileSuccessEditTemplate();
  });
}
