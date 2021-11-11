import P from 'bluebird';
import _ from 'lodash';
import axios from 'axios';
import { methods } from 'http-constants';
import store from 'redux/store';
import { logout } from 'redux/slices/authSlice';
import { updateToken } from 'redux/slices/tokenSlice';

// Check environment to get API Gateway base URL
export const goLocal = process.env.GO_LOCAL;
export const env =
  process.env.NODE_ENV || (goLocal && 'development') || 'testing';
const ENVIRONMENT =
  env === 'testing' || env === 'development'
    ? '-test'
    : env === 'staging'
    ? '-stag'
    : '';
export const BASE_URL = process.env.BASE_URL || `https://api${ENVIRONMENT}.com`;

console.log('ENV=>', env, 'REACT_APP_BASE_URL=>', BASE_URL);

const REFRESH_ENDPOINT = '/auth/token/refresh';

const axiosDefaultInstanceOptions = {
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { apikey: process.env.API_KEY },
  // withCredentials: true,
  // ?Custom req & res transform handlers
  // transformRequest: [
  //   (data, headers) => {
  //     return data;
  //   },
  // ],
  // transformResponse: [
  //   (data) => {
  //     return data;
  //   },
  // ],
};

const axiosRequestDefaultOptions = {
  crossDomain: true,
  normalize: true,
  json: true,
};

const mapAxiosKeys = {
  baseUrl: 'baseURL',
  uri: 'url',
  qs: 'params',
  body: 'data',
};
class Api {
  constructor(name, basePath, options = {}) {
    this.name = name;
    this.basePath = basePath || `/${name}`;
    this.options = options;
    this.instance = axios.create(
      _.merge({}, axiosDefaultInstanceOptions, options)
    );
    console.log(
      'MERGE OPTS ',
      this.name,
      _.merge({}, axiosDefaultInstanceOptions, options)
    );
    // add request interceptors to include Auth headers
    this.requestInterceptors = this.instance.interceptors.request.use(
      (config) => {
        const { accessToken } = this.getTokens();
        if (accessToken) {
          config.headers['Authorization'] = this.getAuthHeader(accessToken);
        }
        return config;
      },
      (error) => P.reject(error)
    );
    // Add response interceptors to handle NON refreshed tokens
    this.responseInterceptors = this.instance.interceptors.response.use(
      (response) => P.resolve(response),
      async (error) => {
        console.log('AXIOS INTERCEPTOR RESPONSE ERROR', error.config);
        const originalConfig = error.config;
        if (error.response) {
          // check if last request was made to refresh the token
          // if so and still error => logout
          if (
            originalConfig.url === `${REACT_APP_BASE_URL}${REFRESH_ENDPOINT}`
          ) {
            console.log(
              'ERROR RESPONSE CHECK IF LAST CALL WAS REFRESH_ENDPOINT'
            );
            this.logout();
            P.reject(error);
          }
          console.log('ERROR.RESPONSE STATUS', error.response?.status);
          // check if error is 401 and NO previous request has been made => refresh token
          if (error.response?.status === 401 && !originalConfig._retry) {
            originalConfig._retry = true; // avoid infinite loop

            const { accessToken, refreshToken } = this.getTokens();
            if (!accessToken || !refreshToken) {
              console.log(
                'ERROR 401 & !RETRY, BUT NO TOKENS TO TRY TO REFRESH. ERROR WITH LOGIN'
              );
              // this.logout();
              return P.reject(error);
            }
            console.log('ERROR.RESPONSE 401 AND NO RETRY');
            return this.refreshToken(accessToken, refreshToken).then(
              (newToken) => {
                // save new token
                this.updateToken(newToken);
                // update instance auth headers
                this.instance.defaults.headers.common.Authorization =
                  this.getAuthHeader(newToken);
                // update original config auth header with new refreshed token and resend request
                originalConfig.headers.Authorization =
                  this.getAuthHeader(newToken);
                return this.instance.request(originalConfig);
              }
            );
          }
          // handle specific errors differently
        }
        return P.reject(error);
      }
    );
  }

  clearInterceptors(req, res) {
    req && this.instance.interceptors.request.eject(this.requestInterceptors);
    res && this.instance.interceptors.response.eject(this.responseInterceptors);
    return P.resolve();
  }

  request(method, options) {
    console.log('START AXIOS REQUEST', method, options);
    return P.bind(this).then(() => {
      return new P((resolve, reject) => {
        const opts = this.prepareOptions(method, options);
        return this.instance
          .request(opts)
          .then((res) => resolve(opts.raw ? res : res.data))
          .catch((error) => reject(error));
      });
    });
  }

  refreshToken(accessToken, refreshToken) {
    console.log('REFRESHING TOKEN');
    const options = {
      url: `${REFRESH_ENDPOINT}`,
      method: 'POST',
      data: {
        accessToken,
        refreshToken,
      },
    };
    return this.instance.request(options);
  }

  getTokens() {
    const state = store.getState();
    const {
      token: { accessToken, refreshToken },
    } = state;
    const tokens = {
      accessToken,
      refreshToken,
    };
    console.log('GET MEMORY TOKENS AXIOS', tokens);
    return tokens;
  }

  updateToken(newToken) {
    store.dispatch(updateToken(newToken));
  }

  logout() {
    store.dispatch(logout());
  }

  prepareOptions(method, options) {
    if (_.isString(options)) {
      options = {
        url: options,
      };
    }
    options.method = method || 'get';
    options = _.defaultsDeep(
      {},
      _.mapKeys(options, (value, key) => mapAxiosKeys[key] || key),
      axiosRequestDefaultOptions
    );

    return options;
  }

  getAuthHeader(token, prefix = 'Bearer ') {
    console.log('GET AUTH HEADER');
    return `${prefix}${token}`;
  }
}

_.forEach(
  _.map(methods, (method) => method.toLowerCase()),
  (method) => {
    Api.prototype[method] = function (options) {
      return this.request(method, options);
    };
  }
);

export default Api;
