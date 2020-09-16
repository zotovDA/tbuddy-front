import { getCurrentUserId } from '../auth';
import {
  formDataToObj,
  initApiErrorHandling,
  searchCity,
  TemplateManager,
  debounce,
} from '../helpers';
import Choices from 'choices.js';
import 'choices.js/public/assets/styles/choices.min.css';

import alertTemplate from '../../templates/alert.hbs';
import profileEditStep2Template from '../../templates/profile/_step2.hbs';
import profileEditStep3Template from '../../templates/profile/_step3.hbs';
import profileEditStep4Template from '../../templates/profile/_step4.hbs';

import profileSuccessEditTemplate from '../../templates/profile/editSuccessMessage.hbs';

import profileTemplate from '../../templates/profile/userProfile.hbs';
import editBuddyTemplate from '../../templates/profile/buddyEdit.hbs';
import profileEditTemplate from '../../templates/profile/profileEdit.hbs';
import processingTemplate from '../../templates/typo/processing.hbs';

import moment from 'moment';
import IMask from 'imask';

import '../common';
import Axios from 'axios';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const momentDateFormat = 'DD.MM.YYYY';

let profileContainer;
let currentUser = {
  firstname: '',
  surname: '',
  gender: '',
  dob: '',
  bio: '',
  photo: '',
  place: '',
  city: '',
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
          dob: moment(userData.dob, 'YYYY-MM-DD').format(momentDateFormat),
          bio: userData.bio,
          photo: userData.image,
          place: userData.city && userData.city.display_name,
          city: userData.city && userData.city.id,
          skills: userData.skills.map(skill => skill.activity),
          contacts: userData.contacts,

          isBuddy: userData.is_buddy,
        };
        if (userData.is_manual) {
          drawUserProfile();
        } else {
          // user didn't finish registration
          initRegistrationSteps(currentUser);
        }
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

function initRegistrationSteps(userData) {
  if (!userData) {
    // new user
    profileContainer.innerHTML = profileEditTemplate({ needCreate: true });
    document
      .getElementById('js-profile-edit-form')
      .addEventListener('submit', handleCreatingProfile);
  } else {
    // social user
    profileContainer.innerHTML = profileEditTemplate({ ...userData, needCreate: true });
    document
      .getElementById('js-profile-edit-form')
      .addEventListener('submit', e => handleCreatingProfile(e, true));
  }
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
    ...currentUser,
    age: moment().diff(moment(currentUser.dob, momentDateFormat), 'years'),
  });
  document.getElementById('js-edit-buddy').addEventListener('click', () => drawBuddyEditProfile());
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

function drawUserEditProfile() {
  profileContainer.innerHTML = profileEditTemplate({
    ...currentUser,
    isFemale: currentUser.gender !== 'male',
  });

  const currentYear = moment().get('year');
  IMask(document.querySelector('[name=dob]'), {
    mask: Date,
    pattern: momentDateFormat,
    min: new Date(currentYear - 100, 0, 1),
    max: new Date(currentYear - 17, 0, 1),

    format: function(date) {
      return moment(date).format(momentDateFormat);
    },
    parse: function(str) {
      return moment(str, momentDateFormat);
    },

    blocks: {
      YYYY: {
        mask: IMask.MaskedRange,
        from: 1970,
        to: 2030,
      },
      MM: {
        mask: IMask.MaskedRange,
        from: 1,
        to: 12,
      },
      DD: {
        mask: IMask.MaskedRange,
        from: 1,
        to: 31,
      },
    },
  });

  document.getElementById('js-profile-edit-form').addEventListener('submit', handleEditProfile);
  [...document.getElementsByClassName('js-profile-edit-cancel')].forEach(item =>
    item.addEventListener('click', drawUserProfile)
  );
}

function drawBuddyEditProfile(needCreate) {
  profileContainer.innerHTML = editBuddyTemplate({
    ...currentUser,
    profileSkills: ['misc', 'culture', 'club', 'food', 'sport', 'tourism', 'hotel', 'shopping'].map(
      skill => ({
        label: skill,
        checked: currentUser.skills.some(item => skill === item),
      })
    ),
    needCreate: needCreate,
  });
  document
    .getElementById('js-profile-edit-form')
    .addEventListener('submit', e => handleEditBuddyProfile(e, needCreate));
  [...document.getElementsByClassName('js-profile-edit-cancel')].forEach(item =>
    item.addEventListener('click', drawUserProfile)
  );

  const citySelect = document.getElementById('profile-city');
  const choices = new Choices(citySelect, {
    noChoicesText: 'No cities found',
    duplicateItemsAllowed: false,
    searchChoices: false,
    shouldSort: false,
  });

  if (currentUser.city) {
    choices.setValue([
      {
        value: currentUser.city,
        label: currentUser.place,
      },
    ]);
  }

  citySelect.addEventListener(
    'search',
    debounce(function({ detail }) {
      const value = detail.value;
      if (!value || value.length < 2) {
        return;
      }

      searchCity(value).then(citiesList => {
        choices.setChoices(
          citiesList.map(city => ({ value: city.id, label: city.display_name })),
          'value',
          'label',
          true
        );
      });
    }, 500)
  );
}

function handleEditBuddyProfile(e, inRegister) {
  e.preventDefault();
  const target = e.target;
  target.classList.remove('was-validated');
  if (!target.checkValidity()) {
    target.classList.add('was-validated');
    return;
  }

  const formData = new FormData(target);
  const data = formDataToObj(formData);

  if (data['city'] === '') {
    target.querySelector('.choices ~ .invalid-feedback').classList.add('d-block');
    return;
  } else {
    target.querySelector('.choices ~ .invalid-feedback').classList.remove('d-block');
  }

  const submitButtonTemplate = new TemplateManager(target.querySelector('button[type=submit]'));
  submitButtonTemplate.change(processingTemplate({ text: 'Loading' }));

  Axios.patch(`/profiles/${getCurrentUserId()}/`, {
    bio: data['bio'],
    city_id: parseInt(data['city']),
    contacts: data['contacts'],
    skills:
      typeof data['skills'] === 'string'
        ? [{ activity: data['skills'] }]
        : data['skills'].map(skill => ({ activity: skill })),
  })
    .then(() => {
      currentUser = { ...currentUser, ...data };
      if (inRegister) {
        initStep4();
      } else {
        document.getElementById('form-message').innerHTML = profileSuccessEditTemplate();
        submitButtonTemplate.restore();
      }
    })
    .catch(error => {
      initApiErrorHandling(e.target, error.response.data);
      submitButtonTemplate.restore();
    });
}

/** @param {Event} e */
function handleCreatingProfile(e, hasProfile) {
  e.preventDefault();
  const target = e.target;
  target.classList.remove('was-validated');
  if (!target.checkValidity()) {
    target.classList.add('was-validated');
    return;
  }

  const formData = new FormData(target);
  const data = formDataToObj(formData);

  const currentYear = moment().get('year');
  if (
    moment(data['dob'], momentDateFormat).isBetween(
      moment()
        .set('year', currentYear - 120)
        .format(),
      moment()
        .set('year', currentYear - 14)
        .format()
    )
  ) {
    target.querySelector('[name=dob]').classList.remove('is-invalid');
  } else {
    target.querySelector('[name=dob]').classList.add('is-invalid');
    return;
  }

  const submitButtonTemplate = new TemplateManager(target.querySelector('button[type=submit]'));
  submitButtonTemplate.change(processingTemplate({ text: 'Loading' }));

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
  })
    .then(() => {
      currentUser = { ...currentUser, ...data };
      initStep2();
    })
    .catch(error => {
      initApiErrorHandling(e.target, error.response.data);
      submitButtonTemplate.restore();
    });
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

  const currentYear = moment().get('year');
  if (
    moment(data['dob'], momentDateFormat).isBetween(
      moment()
        .set('year', currentYear - 120)
        .format(),
      moment()
        .set('year', currentYear - 14)
        .format()
    )
  ) {
    this.querySelector('[name=dob]').classList.remove('is-invalid');
  } else {
    this.querySelector('[name=dob]').classList.add('is-invalid');
    return;
  }

  const submitButtonTemplate = new TemplateManager(this.querySelector('button[type=submit]'));
  submitButtonTemplate.change(processingTemplate({ text: 'Loading' }));

  Axios.patch(`/profiles/${getCurrentUserId()}/`, {
    first_name: data['firstname'],
    last_name: data['surname'],
    gender: data['gender'],
    dob: moment(data['dob'], momentDateFormat).format('YYYY-MM-DD'),
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
