import { parse } from 'cookie';

export class Cookie {

  static parserCookie(cookie: string) {
    return parse(cookie);
  }

  static getCookie(cookie: string, key: string) {
    const values = this.parserCookie(cookie);
    if (key in values) {
      return values[key];
    }
    return null;
  }
}