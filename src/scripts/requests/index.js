import '../common';
import '../../stylesheets/requests.scss';
import IMask from 'imask';
import { Modal } from 'bootstrap';
import 'choices.js/public/assets/styles/choices.min.css';
import moment from 'moment';
import {
  parsePrice,
  TemplateManager,
  User,
  formatUser,
  formatRequest,
  FormManager,
  parseApiErrors,
} from '../helpers';

import { requestsCategories } from '../constants';

// templates
import unauthorizedTemplate from '../../templates/requests/_unauthorized.hbs';
import createRequest from '../../templates/requests/create.hbs';
import createRequestSuccess from '../../templates/requests/_createSuccess.hbs';
import requestsList from '../../templates/requests/requestsList.hbs';
import requestItem from '../../templates/requests/requestItem.hbs';
import requestBuddy from '../../templates/requests/_requestBuddy.hbs';
import buddyCandidates from '../../templates/requests/_buddyCandidates.hbs';
import { getCurrentUserId } from '../auth';
import Axios from 'axios';
import { initCitySearchInput, showPageError } from '../view';

// DOM ANCHORS
const CREATE_REQUEST_FORM_ID = 'create-request-form';

const USER_REQUESTS_CONTAINER_ID = 'user-requests';
const BUDDY_REQUESTS_CONTAINER_ID = 'buddy-requests';

const REQUESTS_CONTAINER_CLASSNAME = 'js-requests-list-container';
const REQUESTS_LIST_CLASSNAME = 'js-requests-list';

// badges
const OPEN_REQUEST_BADGE_CLASSNAME = 'js-open-badge';
const PROGRESS_REQUEST_BADGE_CLASSNAME = 'js-progress-badge';
const APPLIED_REQUEST_BADGE_CLASSNAME = 'js-apply-badge';
// buddy
const APPLY_REQUEST_BUTTON_CLASSNAME = 'js-apply-button';
const SUCCESS_APPLY_MODAL_ID = 'applySuccess';
// user
const SOLVE_BUTTON_CLASSNAME = 'js-solve-button';
const SHOW_CANDIDATES_BUTTON_CLASSNAME = 'js-show-buddy-candidates';
const CANCEL_REQUEST_BUTTON_CLASSNAME = 'js-cancel-request';
// service
const SCROLL_TO_REQUESTS_BUTTON_ID = 'to-user-requests';
const BUDDY_CITY_LABEL_ID = 'buddy-city';
const CREATE_MORE_BUTTON_ID = 'request-create-more';

const user = new User();

/** @type {{ place: string, cityId: number }} */
let lastLocation;
let lastDateFrom;
let lastDateTo;
/** @type {TemplateManager} */
let bannerContainer;

let userRequests = [];

// CHECK IF USER IS FIRST TIME VISITER
if (!localStorage.getItem('COVID_TEST_PASSED')) {
  localStorage.setItem('COVID_TEST_PASSED', 'true');
  window.location = '/about.html';
}

document.addEventListener('init', async function() {
  bannerContainer = new TemplateManager(document.getElementById('banner-container'));

  const userId = getCurrentUserId();
  if (!userId) {
    bannerContainer.change(unauthorizedTemplate());
    return;
  } else {
    await Axios.get(`/profiles/${userId}/`)
      .then(response => {
        const userData = response.data;
        user.setData(formatUser(userData));
      })
      .catch(() => {
        bannerContainer.change(unauthorizedTemplate());
        return;
      });
  }
  if (!user.isVerified()) {
    document.getElementById('email-verify').classList.remove('d-none');
    return;
  }
  if (!user.hasProfile()) {
    document.getElementById('profile-create').classList.remove('d-none');
    return;
  }

  // if user is all right
  drawCreateRequest();

  // TODO: add pagination
  Axios.get(`/claims/`, { params: { limit: 100 } })
    .then(response => {
      const data = response.data;
      data.results.forEach(request => {
        userRequests.push(formatRequest(request));
      });

      if (userRequests.length) {
        drawUserRequests(userRequests);
      }
    })
    .catch(error => {
      showPageError([
        {
          title: 'Getting claims error',
          message: parseApiErrors(error.response.data),
        },
      ]);
      return;
    });
  if (user.isBuddy()) {
    // TODO: add pagination
    Axios.get(`/claims/buddy/`, { params: { limit: 100 } })
      .then(response => {
        const data = response.data;
        let buddyRequests = [];
        data.results.forEach(request => {
          buddyRequests.push(formatRequest(request));
        });

        if (buddyRequests.length) {
          drawBuddyRequests(buddyRequests);
        }
      })
      .catch(error => {
        showPageError([
          {
            title: 'Getting claims for buddy error',
            message: parseApiErrors(error.response.data),
          },
        ]);
        return;
      });
  }
});

function drawCreateRequest() {
  bannerContainer.change(
    createRequest({
      categories: requestsCategories,
      dateFrom: lastDateFrom,
      dateTo: lastDateTo,
    })
  );

  const formManager = new FormManager(CREATE_REQUEST_FORM_ID, function() {
    initCitySearchInput(
      'request-city',
      lastLocation ? { value: lastLocation.cityId, label: lastLocation.place } : undefined,
      function(choice) {
        lastLocation = {
          place: choice.detail.choice.label,
          cityId: choice.detail.choice.value,
        };
      }
    );

    // init mask fields
    // TODO: add calendar range
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
  });
  formManager.setHandler(handleCreateRequest);
}

function drawUserRequests(requests) {
  const requestsContainer = document.getElementById(USER_REQUESTS_CONTAINER_ID);

  document.getElementById(SCROLL_TO_REQUESTS_BUTTON_ID).classList.remove('d-none');
  requestsContainer.classList.remove('d-none');

  // fill requests
  requestsContainer.getElementsByClassName(
    REQUESTS_CONTAINER_CLASSNAME
  )[0].innerHTML = requestsList({
    requests: requests,
  });

  // init binds
  [...requestsContainer.getElementsByClassName(SOLVE_BUTTON_CLASSNAME)].forEach(btn =>
    btn.addEventListener('click', handleSolveForRequest)
  );
  [...requestsContainer.getElementsByClassName(SHOW_CANDIDATES_BUTTON_CLASSNAME)].forEach(btn =>
    btn.addEventListener('click', handleShowBuddyCandidatesForRequest)
  );
  [...requestsContainer.getElementsByClassName(CANCEL_REQUEST_BUTTON_CLASSNAME)].forEach(btn =>
    btn.addEventListener('click', handleCancelRequest)
  );
}

function drawBuddyRequests(requests) {
  const requestsContainer = document.getElementById(BUDDY_REQUESTS_CONTAINER_ID);

  document.getElementById(BUDDY_CITY_LABEL_ID).innerHTML = user.getData().place;
  requestsContainer.classList.remove('d-none');

  // fill requests
  requestsContainer.getElementsByClassName(
    REQUESTS_CONTAINER_CLASSNAME
  )[0].innerHTML = requestsList({
    // TODO: forBuddy if not apply
    requests: requests.map(request => ({ ...request, forBuddy: true, isApplied: false })),
  });

  // init binds
  [...requestsContainer.getElementsByClassName(APPLY_REQUEST_BUTTON_CLASSNAME)].forEach(btn =>
    btn.addEventListener('click', handleApplyForRequest)
  );
}

/** Handle form submit to Create request
 * @param {FormManager} manager
 */
function handleCreateRequest(manager) {
  const data = manager.getValues();

  lastDateFrom = data['dateFrom'];
  lastDateTo = data['dateTo'];

  return Axios.post('/claims/', {
    city_id: lastLocation.cityId,
    begins_at: moment(data['dateFrom'], 'DD.MM.YYYY')
      .hours(moment().get('hour'))
      .minutes(moment().get('minute') + 1)
      .format(),
    ends_at: moment(data['dateTo'], 'DD.MM.YYYY')
      .hours(23)
      .format(),
    details: data['description'],
    price: parsePrice(data['price']),
    activities: data['activities']
      ? typeof data['activities'] === 'string'
        ? [{ type: data['activities'] }]
        : data['activities'].map(skill => ({ type: skill }))
      : [],
  }).then(response => {
    const id = response.data && response.data.id;
    bannerContainer.change(createRequestSuccess());

    if (!userRequests.length) {
      drawUserRequests([]);
    }

    const requestsContainer = document.getElementById(USER_REQUESTS_CONTAINER_ID);
    const requestsList = requestsContainer.getElementsByClassName(REQUESTS_LIST_CLASSNAME)[0];
    // construct new request
    const requestItemNode = document.createElement('div');
    requestItemNode.className = 'col-lg-3 col-md-4 col-sm-6 col-12 mb-3';
    requestItemNode.innerHTML = requestItem({
      id: id || Math.random(),
      isOpen: true,
      isProgress: false,
      isClosed: false,
      name: user.getData().firstname,
      dateFrom: data['dateFrom'],
      dateTo: data['dateTo'],
      activities:
        typeof data['activities'] === 'string' ? [data['activities']] : data['activities'],
      price: parsePrice(data['price']),
      description: data['description'],
      location: lastLocation.place,
      buddiesCount: 0,
    });

    // insert new request in DOM
    requestsList.prepend(requestItemNode);
    // init bind on current created element (must be first one)
    requestsContainer
      .getElementsByClassName(CANCEL_REQUEST_BUTTON_CLASSNAME)[0]
      .addEventListener('click', handleCancelRequest);

    // create more btn
    document.getElementById(CREATE_MORE_BUTTON_ID).addEventListener('click', drawCreateRequest);
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
      const successModal = new Modal(document.getElementById(SUCCESS_APPLY_MODAL_ID));
      successModal.show();
      this.classList.add('d-none');
      document
        .querySelector(
          `#${BUDDY_REQUESTS_CONTAINER_ID} .request-item[data-id='${targetId}'] .${APPLIED_REQUEST_BADGE_CLASSNAME}`
        )
        .classList.remove('d-none');
    })
    .catch(error => {
      showPageError([
        {
          title: 'Apply for request failed',
          message: parseApiErrors(error.response.data),
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
        `#${USER_REQUESTS_CONTAINER_ID} .request-item[data-id='${targetId}'] .card-header`
      );
      requestHeader.classList.remove('bg-primary');
      requestHeader.classList.add('bg-success');

      // remove status badges
      document
        .querySelector(
          `#${USER_REQUESTS_CONTAINER_ID} .request-item[data-id='${targetId}'] .${PROGRESS_REQUEST_BADGE_CLASSNAME}`
        )
        .classList.add('d-none');
    })
    .catch(error => {
      showPageError([
        {
          title: "Can't close request",
          message: parseApiErrors(error.response.data),
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
                  message: parseApiErrors(error.response.data),
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
          message: parseApiErrors(error.response.data),
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
    .querySelector(
      `#${USER_REQUESTS_CONTAINER_ID} .request-item[data-id='${targetId}'] .${OPEN_REQUEST_BADGE_CLASSNAME}`
    )
    .classList.add('d-none');
  document
    .querySelector(
      `#${USER_REQUESTS_CONTAINER_ID} .request-item[data-id='${targetId}'] .${PROGRESS_REQUEST_BADGE_CLASSNAME}`
    )
    .classList.remove('d-none');
}

function handleCancelRequest() {
  const requestId = this.dataset.requestId;

  Axios.patch(`/claims/${requestId}/`, {
    status: 3, // cancel request
  })
    .then(() => {
      const request = document.querySelector(`.request-item[data-id="${requestId}"]`);
      request.querySelector(`.${OPEN_REQUEST_BADGE_CLASSNAME}`).classList.add('d-none');
      request.querySelector('.card-header').classList.remove('bg-primary');
      request.querySelector('.card-header').classList.add('bg-dark');
    })
    .catch(error => {
      showPageError([
        {
          title: "Can't cancel request",
          message: parseApiErrors(error.response.data),
        },
      ]);
      return;
    });
}
