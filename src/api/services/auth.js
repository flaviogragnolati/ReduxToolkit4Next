import P from 'bluebird';
import Base, { env, goLocal } from './base';

const defaultPlatform = 6;
// const defaultLoginType = 5;

const AUTH_BASE_URL =
  env === 'development' && goLocal
    ? process.env.AUTH_BASE_URL || 'http://localhost:64025'
    : process.env.AUTH_BASE_URL;

const axiosOptions = {
  baseURL: BASE_URL,
};
class Auth extends Base {
  constructor() {
    super('auth', BASE_URL, axiosOptions);
  }

  login({ email, password }) {
    // const options = {
    // url: `${this.basePath}/login?with=${fullWith}`,
    //   url: `${this.basePath}/login`,
    //   data: {
    //     idPlatform: defaultPlatform,
    //     payload: { email, password },
    //   },
    // };
    // return this.post(options);
    return P.resolve({
      user: { name: 'test rodriguez', id: '1' },
      accessToken: 'TOKEN',
      refreshToken: 'REFRESH_TOKEN',
      code: 200,
    });
  }

  recoverPassword(user) {
    return P.resolve();
  }

  restoreSession({ token, refreshToken }) {
    // const options = {
    //   url: '/tokens/validate',
    //   data: { token, refreshToken },
    // };
    // return this.get(options);
    return P.resolve();
  }

  refreshToken(accessToken, refreshToken) {
    const options = {
      url: `/auth/tokens/refresh`,
      method: 'POST',
      data: {
        accessToken,
        refreshToken,
      },
    };
    return this.request(options);
  }
}

export default new Auth();
