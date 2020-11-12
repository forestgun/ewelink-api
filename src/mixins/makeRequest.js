const fetch = require('node-fetch');
const { _get, _empty, toQueryString } = require('../helpers/utilities');
const errors = require('../data/errors');

module.exports = {
  /**
   * Helper to make api requests
   *
   * @param method
   * @param url
   * @param uri
   * @param body
   * @param qs
   * @returns {Promise<{msg: *, error: *}|*>}
   */
  async makeRequest({ method = 'get', url, uri, body = {}, qs = {} }) {
    const { at } = this;

    if (!at) {
      await this.getCredentials();
    }

    let apiUrl = this.getApiUrl();

    if (url) {
      apiUrl = url;
    }

    const payload = {
      method,
      headers: {
        Authorization: `Bearer ${this.at}`,
        'Content-Type': 'application/json',
      },
    };

    if (!_empty(body)) {
      payload.body = JSON.stringify(body);
    }

    const queryString = !_empty(qs) ? toQueryString(qs) : '';
    const requestUrl = `${apiUrl}${uri}${queryString}`;
    
    // Bloque para evitar error de json con string < 
    let request = await fetch(requestUrl, payload);
    let contentType = request.headers.get("content-type");

    while(!(contentType && contentType.indexOf("application/json") !== -1)) {
        request = await fetch(requestUrl, payload);
        contentType = request.headers.get("content-type");
    }
    // fin Bloque

    //const request = await fetch(requestUrl, payload);

    if (!request.ok) {
      return { error: request.status, msg: errors[request.status] };
    }

    const response = await request.json();

    return response
  },
};
