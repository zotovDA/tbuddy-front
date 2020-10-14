import '../common';
import '../../stylesheets/requests.scss';
import IMask from 'imask';
import { Modal } from 'bootstrap';
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
import requestBuddy from '../../templates/requests/_requestBuddy.hbs';
import buddyCandidates from '../../templates/requests/_buddyCandidates.hbs';
import { getCurrentUserId } from '../auth';
import Axios from 'axios';
import { showPageError } from '../view';

/** @type {{id: number, firstname: string, location:string}} */
let currentUser = {
  id: getCurrentUserId(),
};

let lastLocation;
let lastDateFrom;
let lastDateTo;
/** @type {Element} */
let bannerContainer;

let userRequests = [];

document.addEventListener('init', async function() {
  bannerContainer = document.getElementById('banner-container');

  let isBuddy = false;
  const isAuth = !!currentUser.id;
  // TODO: fetch verify status
  const isVerified = true;
  let isProfileCreated = false;

  // FIXME: isAuth is true when user session expired
  if (!isAuth) {
    bannerContainer.innerHTML = unauthorizedTemplate();
    return;
  } else {
    await Axios.get(`/profiles/${currentUser.id}/`)
      .then(response => {
        const userData = response.data;
        currentUser.firstname = userData.first_name;
        currentUser.location = userData.city && userData.city.display_name;

        isBuddy = userData.is_buddy;
        isProfileCreated = userData.is_manual;
      })
      .catch(() => {
        bannerContainer.innerHTML = unauthorizedTemplate();
        return;
      });
  }
  // FIXME: handle verify error
  if (!isVerified) {
    document.getElementById('email-verify').classList.remove('d-none');
    return;
  }
  if (!isProfileCreated) {
    document.getElementById('profile-create').classList.remove('d-none');
    return;
  }

  function _formatClaim(request) {
    // TODO: add isApplied if user applied
    const formattedClaim = {
      id: request.id,
      isOpen: request.status === 0,
      isProgress: request.status === 1,
      isClosed: request.status === 3,
      name: request.applicant_profile.first_name,
      price: parseInt(request.price),
      description: request.details,
      activities: (request.activities || []).map(activity => activity.type),
      location: request.city.display_name,
      dateFrom: moment(request.begins_at, 'YYYY-MM-DD').format('DD.MM.YYYY'),
      dateTo: moment(request.ends_at, 'YYYY-MM-DD').format('DD.MM.YYYY'),
      buddy:
        (request.candidate_accepted && {
          id: request.candidate_accepted.id,
          name: request.candidate_accepted.respondent_profile.first_name,
          contacts: request.candidate_accepted.respondent_profile.contacts,
        }) ||
        undefined,
      buddiesCount: request.candidate_count || 0,
    };

    return formattedClaim;
  }

  drawCreateRequest();
  // TODO: add pagination
  Axios.get(`/claims/`, { params: { limit: 100 } })
    .then(response => {
      const data = response.data;
      data.results.forEach(request => {
        userRequests.push(_formatClaim(request));
      });

      if (userRequests.length) {
        drawUserRequests(userRequests);
      }
    })
    .catch(error => {
      showPageError([
        {
          title: 'Getting claims error',
          message: error.response.data && error.response.data.detail,
        },
      ]);
      return;
    });
  if (isBuddy) {
    // TODO: add pagination
    Axios.get(`/claims/buddy/`, { params: { limit: 100 } })
      .then(response => {
        const data = response.data;
        let buddyRequests = [];
        data.results.forEach(request => {
          buddyRequests.push(_formatClaim(request));
        });

        if (buddyRequests.length) {
          drawBuddyRequests(buddyRequests);
        }
      })
      .catch(error => {
        showPageError([
          {
            title: 'Getting claims for buddy error',
            message: error.response.data && error.response.data.detail,
          },
        ]);
        return;
      });
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
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - 1);
  IMask(document.querySelector('[name=dateFrom]'), {
    mask: Date,
    min: minDate,
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
  [...document.querySelectorAll('#user-requests .js-solve-button')].forEach(btn =>
    btn.addEventListener('click', handleSolveForRequest)
  );
  [...document.querySelectorAll('#user-requests .js-show-buddy-candidates')].forEach(btn =>
    btn.addEventListener('click', handleShowBuddyCandidatesForRequest)
  );
}

function drawBuddyRequests(requests) {
  document.getElementById('buddy-city').innerHTML = currentUser.location;
  document.getElementById('buddy-requests').classList.remove('d-none');
  document.getElementById('buddy-requests-list-container').innerHTML = requestsList({
    // TODO: forBuddy if not apply
    requests: requests.map(request => ({ ...request, forBuddy: true, isApplied: false })),
  });
  [...document.querySelectorAll('#buddy-requests .request-item .js-apply-button')].forEach(btn =>
    btn.addEventListener('click', handleApplyForRequest)
  );
}

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

  Axios.post('/claims/', {
    city_id: lastLocation.cityId,
    begins_at: moment(data['dateFrom'], 'DD.MM.YYYY')
      .hours(moment().get('hour'))
      .minutes(moment().get('minute') + 1)
      .format(),
    ends_at: moment(data['dateTo'], 'DD.MM.YYYY')
      .hours(23)
      .format(),
    details: data['description'],
    price: formatPrice(data['price']),
    activities: data['activities']
      ? typeof data['activities'] === 'string'
        ? [{ type: data['activities'] }]
        : data['activities'].map(skill => ({ type: skill }))
      : [],
  })
    .then(() => {
      bannerContainer.innerHTML = createRequestSuccess();

      if (!userRequests.length) {
        drawUserRequests([]);
      }
      const requestsList = document.querySelector('#user-requests .js-user-requests-list');
      const requestItemNode = document.createElement('div');
      requestItemNode.className = 'col-lg-3 col-md-4 col-sm-6 col-12 mb-3';
      requestItemNode.innerHTML = requestItem({
        id: Math.random(),
        isOpen: true,
        isProgress: false,
        isClosed: false,
        name: currentUser.firstname,
        dateFrom: data['dateFrom'],
        dateTo: data['dateTo'],
        activities:
          typeof data['activities'] === 'string' ? [data['activities']] : data['activities'],
        price: formatPrice(data['price']),
        description: data['description'],
        location: lastLocation.place,
        buddiesCount: 0,
      });
      requestsList.prepend(requestItemNode);

      document.getElementById('request-create-more').addEventListener('click', drawCreateRequest);
    })
    .catch(error => {
      // TODO: initApiErrorHandling
      showPageError([
        {
          title: 'Getting claims for buddy error',
          message: error.response.data && error.response.data.detail,
        },
      ]);
      submitButtonTemplate.restore();
    });
}

function handleApplyForRequest() {
  const targetId = this.dataset['request'];
  const price = this.dataset['price'];
  // TODO: handle price input on payment system integration
  Axios.post(`/claims/${targetId}/candidates/`, {
    price: price,
  })
    .then(() => {
      const successModal = new Modal(document.getElementById('applySuccess'));
      successModal.show();
      this.classList.add('d-none');
      document
        .querySelector(`#buddy-requests .request-item[data-id='${targetId}'] .js-apply-badge`)
        .classList.remove('d-none');
    })
    .catch(error => {
      showPageError([
        {
          title: 'Apply for request failed',
          message:
            error.response.data &&
            (error.response.data.detail || error.response.data.non_field_errors),
        },
      ]);
      return;
    });
}

function handleSolveForRequest() {
  const targetId = this.dataset['request'];

  Axios.patch(`/claims/${targetId}/`, {
    status: 2, // close request
  })
    .then(() => {
      // remove solve btn
      this.classList.add('d-none');

      // change header bg
      const requestHeader = document.querySelector(
        `#user-requests .request-item[data-id='${targetId}'] .card-header`
      );
      requestHeader.classList.remove('bg-primary');
      requestHeader.classList.add('bg-success');

      // remove status badges
      document
        .querySelector(`#user-requests .request-item[data-id='${targetId}'] .js-progress-badge`)
        .classList.add('d-none');
    })
    .catch(error => {
      showPageError([
        {
          title: "Can't close request",
          message:
            (error.response.data &&
              (error.response.data.detail || error.response.data.non_field_errors)) ||
            JSON.stringify(error.response.data),
        },
      ]);
      return;
    });
}

function handleShowBuddyCandidatesForRequest() {
  const requestId = this.dataset.requestId;
  const buddiesCandidatesModal = new Modal(document.getElementById('chooseBuddy'));
  const candidatesListTemplate = new TemplateManager(document.getElementById('buddy-candidates'));

  buddiesCandidatesModal.show();
  document
    .getElementById('chooseBuddy')
    .addEventListener('hidden.bs.modal', () => candidatesListTemplate.restore());

  Axios.get(`/claims/${requestId}/candidates/`)
    .then(response => {
      candidatesListTemplate.change(
        buddyCandidates({
          buddyCandiadates: response.data.results.map(candidate => ({
            requestId: requestId,
            candidateId: candidate.id,
            name: candidate.respondent_profile.first_name,
            photo: candidate.respondent_profile.image,
            skills: candidate.respondent_profile.activities.map(activity => activity.type),
            bio: candidate.respondent_profile.bio,
            contacts: candidate.respondent_profile.contacts,
          })),
        })
      );

      [...document.querySelectorAll('.js-choose-buddy')].forEach(btn =>
        btn.addEventListener('click', function() {
          const candidateId = this.dataset.candidate;
          const name = this.dataset.name;
          const contacts = this.dataset.contacts;
          Axios.patch(`/claims/${requestId}/candidates/${candidateId}`, {
            is_accepted: true,
          })
            .then(() => {
              handleChooseBuddyForRequest(requestId, name, contacts);
              buddiesCandidatesModal.hide();
            })
            .catch(error => {
              showPageError([
                {
                  title: 'Something wrong',
                  message:
                    error.response.data &&
                    (error.response.data.detail || error.response.data.non_field_errors),
                },
              ]);
              return;
            });
        })
      );
    })
    .catch(error => {
      showPageError([
        {
          title: 'Something wrong',
          message:
            error.response.data &&
            (error.response.data.detail || error.response.data.non_field_errors),
        },
      ]);
      return;
    });
}

function handleChooseBuddyForRequest(targetId, name, contacts) {
  document.querySelector(
    `#user-requests .request-item[data-id='${targetId}'] .card-footer`
  ).innerHTML = requestBuddy({
    id: targetId,
    name: name,
    contacts: contacts,
    isDone: false,
  });
  [
    ...document.querySelectorAll(
      `#user-requests .request-item[data-id='${targetId}'] .js-solve-button`
    ),
  ].forEach(btn => btn.addEventListener('click', handleSolveForRequest));

  // add progress badge
  document
    .querySelector(`#user-requests .request-item[data-id='${targetId}'] .js-open-badge`)
    .classList.add('d-none');
  document
    .querySelector(`#user-requests .request-item[data-id='${targetId}'] .js-progress-badge`)
    .classList.remove('d-none');
}
