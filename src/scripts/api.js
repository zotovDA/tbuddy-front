// eslint-disable-next-line no-unused-vars
import axios, { AxiosRequestConfig, AxiosPromise } from 'axios';
import { getAccessToken } from './auth';

let _axios = null;

export function initApi() {
  const options = {
    // TODO: move path to env
    baseURL: 'http://path-to-server',
  };

  const userToken = getAccessToken();
  if (userToken) {
    options.headers = { Authorization: `Bearer ${userToken}` };
  }
  _axios = axios.create(options);
}

/**
 *
 * @param {AxiosRequestConfig} options
 * @returns {AxiosPromise}
 */
export function request(options) {
  if (!_axios) {
    throw 'need to init axios first';
  }

  return _axios(options);
}
