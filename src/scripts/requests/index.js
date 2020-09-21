import '../common';
import '../../stylesheets/requests.scss';
import IMask from 'imask';
import 'choices.js/public/assets/styles/choices.min.css';
import Choices from 'choices.js';
import moment from 'moment';
import { debounce, formatPrice, formDataToObj, searchCity, TemplateManager } from '../helpers';

import { requestsCategories } from '../constants';

// templates
import processingTemplate from '../../templates/typo/processing.hbs';
import unauthorizedTemplate from '../../templates/requests/_unauthorized.hbs';
import createRequest from '../../templates/requests/create.hbs';
import createRequestSuccess from '../../templates/requests/_createSuccess.hbs';
import requestsList from '../../templates/requests/requestsList.hbs';
import requestItem from '../../templates/requests/requestItem.hbs';

let lastLocation;
let lastDateFrom;
let lastDateTo;
/** @type {Element} */
let bannerContainer;

let currentUser = 'Evgeny';

document.addEventListener('DOMContentLoaded', function() {
  bannerContainer = document.getElementById('banner-container');

  // TODO: fetch user info
  const isBuddy = true;
  const isAuth = true;
  const isVerified = true;
  const isProfileCreated = true;

  if (!isAuth) {
    bannerContainer.innerHTML = unauthorizedTemplate();
    return;
  }
  if (!isVerified) {
    document.getElementById('email-verify').classList.remove('d-none');
    return;
  }
  if (!isProfileCreated) {
    document.getElementById('profile-create').classList.remove('d-none');
    return;
  }

  const userRequests = [
    {
      id: 1,
      isOpen: false,
      isProgress: true,
      isClosed: false,
      name: 'Evgeny',
      price: '1000',
      description: 'some text that need to be done',
      skills: ['misc', 'travel'],
      location: 'Ekaterinburg, Russia',
      dateFrom: moment('2020-11-01', 'YYYY-MM-DD').format('DD.MM.YYYY'),
      dateTo: moment('2020-11-11', 'YYYY-MM-DD').format('DD.MM.YYYY'),
    },
  ];

  drawCreateRequest();
  if (userRequests.length) {
    drawUserRequests(userRequests);
  }
  if (isBuddy) {
    // TODO: draw requests for buddy
  }
});

function drawCreateRequest() {
  bannerContainer.innerHTML = createRequest({
    categories: requestsCategories,
    dateFrom: lastDateFrom,
    dateTo: lastDateTo,
  });
  document.getElementById('create-request-form').addEventListener('submit', handleCreateRequest);
  // TODO: add calendar range

  // Binds
  const citySelect = document.querySelector('[name=city]');
  // TODO: refactor dublicate in profile/index.js
  const choices = new Choices(citySelect, {
    noChoicesText: 'No cities found',
    duplicateItemsAllowed: false,
    searchChoices: false,
    shouldSort: false,
  });
  if (lastLocation) {
    choices.setValue([
      {
        value: lastLocation.cityId,
        label: lastLocation.place,
      },
    ]);
  }
  citySelect.addEventListener('choice', function(choice) {
    lastLocation = {
      place: choice.detail.choice.label,
      cityId: choice.detail.choice.value,
    };
  });
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
  IMask(document.querySelector('[name=price]'), {
    mask: '$num',
    blocks: {
      num: {
        mask: Number,
        thousandsSeparator: ' ',
      },
    },
  });
  IMask(document.querySelector('[name=dateFrom]'), {
    mask: Date,
    min: new Date(),
  });
  IMask(document.querySelector('[name=dateTo]'), {
    mask: Date,
    min: new Date(),
  });
}

function drawUserRequests(requests) {
  document.getElementById('to-user-requests').classList.remove('d-none');
  document.getElementById('user-requests').classList.remove('d-none');
  document.getElementById('user-requests-list-container').innerHTML = requestsList({
    requests: requests,
  });
}

// function _hideUserRequests() {
//   document.getElementById('to-user-requests').classList.add('d-none');
//   document.getElementById('user-requests').classList.add('d-none');
// }

// function drawBuddyRequests(requests, buddyLocation) {
//   // TODO: fill #buddy-city with buddyLocation
// }

function handleCreateRequest(e) {
  e.preventDefault();
  this.classList.remove('was-validated');
  if (!this.checkValidity()) {
    this.classList.add('was-validated');
    return;
  }

  const formData = new FormData(this);
  const data = formDataToObj(formData);

  lastDateFrom = data['dateFrom'];
  lastDateTo = data['dateTo'];

  const submitButtonTemplate = new TemplateManager(this.querySelector('button[type=submit]'));
  submitButtonTemplate.change(processingTemplate({ text: 'Loading' }));

  bannerContainer.innerHTML = createRequestSuccess();

  const requestsList = document.getElementById('user-requests-list');
  const requestItemNode = document.createElement('div');
  requestItemNode.className = 'col-lg-3 col-md-4 col-sm-6 col-12 mb-3';
  requestItemNode.innerHTML = requestItem({
    id: Math.random(),
    isOpen: true,
    isProgress: false,
    isClosed: false,
    name: currentUser,
    dateFrom: data['dateFrom'],
    dateTo: data['dateTo'],
    skills: typeof data['skills'] === 'string' ? [data['skills']] : data['skills'],
    price: formatPrice(data['price']),
    description: data['description'],
    location: lastLocation.place,
  });
  requestsList.prepend(requestItemNode);

  document.getElementById('request-create-more').addEventListener('click', drawCreateRequest);
}
