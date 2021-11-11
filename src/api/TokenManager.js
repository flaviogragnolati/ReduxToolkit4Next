// import store from 'redux/store';
import LocalStorage from 'utils/localStorage';
import defaults from 'config';

export const LOGIN_URL = 'api/auth/login';
export const REGISTER_URL = 'api/auth/register';
export const REQUEST_PASSWORD_URL = 'api/auth/forgot-password';

/**
 * JWT structure:
 * {
 *  user:'USER_OBJECT',
 *  token: 'TOKEN',
 *  refreshToken: 'REFRESH_TOKEN',
 * }
 */
class TokenManager {
  // constructor() {
  //   this.dispatch = store.dispatch;
  // }

  getAccessToken() {
    const JWT = this.getJWT();
    if (!JWT) return false;
    return JWT.token;
  }

  getRefreshToken() {
    const JWT = this.getJWT();
    if (!JWT) return false;
    return JWT.refreshToken;
  }

  getUser() {
    const JWT = this.getJWT();
    if (!JWT) return false;
    return JWT.user;
  }

  getJWT() {
    return JSON.parse(LocalStorage.getItem('sessionJWT'));
  }

  setJWT(JWT) {
    LocalStorage.setItem('sessionJWT', JSON.stringify(JWT));
  }

  updateToken({ user, accessToken, refreshToken }) {
    const JWT = this.getJWT() || {};
    JWT.user = user || JWT.user;
    JWT.token = accessToken || JWT.token;
    JWT.refreshToken = refreshToken || JWT.refreshToken;
    LocalStorage.removeItem('sessionJWT');
    LocalStorage.setItem('sessionJWT', JSON.stringify(JWT));
    return JWT;
  }

  removeJWT() {
    LocalStorage.removeItem('sessionJWT');
  }

  logout() {
    this.removeJWT();
  }

  login(JWT) {
    LocalStorage.setItem(defaults.logoutKey, Date.now());
    return this.setJWT(JWT);
  }

  getAuthHeader(token) {
    return `Bearer ${token}`;
  }
}

export default new TokenManager();
