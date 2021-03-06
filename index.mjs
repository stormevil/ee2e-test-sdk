
import axios from 'axios';

export class E2eeSDK {
    constructor(opt) {
        if (!(this instanceof E2eeSDK)) {
          return new E2eeSDK(opt);
        }
    
        opt = opt || {};
    
        if (!opt.url) {
          throw new OptionsException("url is required");
        }
    
    
        if (!opt.accessToken) {
          throw new OptionsException("accessToken is required");
        }
    
        this._setDefaultsOptions(opt);
      }

       getE2EEKey(phone,cb) {
        return this.post('e2ee/key',{phone})
      }

      sendE2EEZNSMessage(phone, templateId,templateData) {
        return this.post('message/e2ee',{
          phone,template_id:templateId,template_data:templateData
        })
      }
    
      /**
       * Set default options
       *
       * @param {Object} opt
       */
      _setDefaultsOptions(opt) {
        this.url = opt.url;
        this.isHttps = /^https/i.test(this.url);
        this.accessToken = opt.accessToken;
        this.encoding = opt.encoding || "utf8";
        this.queryStringAuth = opt.queryStringAuth || false;
        this.port = opt.port || "";
        this.timeout = opt.timeout;
        this.axiosConfig = opt.axiosConfig || {};
      }

      /**
   * Parse params object.
   *
   * @param {Object} params
   * @param {Object} query
   */
  _parseParamsObject(params, query) {
    for (const key in params) {
      const value = params[key];

      if (typeof value === "object") {
        for (const prop in value) {
          const itemKey = key.toString() + "[" + prop.toString() + "]";
          query[itemKey] = value[prop];
        }
      } else {
        query[key] = value;
      }
    }

    return query;
  }

  /**
   * Normalize query string for oAuth
   *
   * @param  {String} url
   * @param  {Object} params
   *
   * @return {String}
   */
   _normalizeQueryString(url, params) {
    // Exit if don't find query string.
    if (url.indexOf("?") === -1 && Object.keys(params).length === 0) {
      return url;
    }

    const query = new Url(url, null, true).query;
    const values = [];

    let queryString = "";

    // Include params object into URL.searchParams.
    this._parseParamsObject(params, query);

    for (const key in query) {
      values.push(key);
    }
    values.sort();

    for (const i in values) {
      if (queryString.length) {
        queryString += "&";
      }

      queryString += encodeURIComponent(values[i])
        .replace(/%5B/g, "[")
        .replace(/%5D/g, "]");
      queryString += "=";
      queryString += encodeURIComponent(query[values[i]]);
    }

    return url.split("?")[0] + "?" + queryString;
  }

  /**
   * Get URL
   *
   * @param  {String} endpoint
   * @param  {Object} params
   *
   * @return {String}
   */
  _getUrl(endpoint, params) {
    let url = this.url.slice(-1) === "/" ? this.url : this.url + "/";

    url = url + endpoint;

    // Include port.
    if (this.port !== "") {
      const hostname = new Url(url).hostname;

      url = url.replace(hostname, hostname + ":" + this.port);
    }

    if (!this.isHttps) {
      return this._normalizeQueryString(url, params);
    }

    return url;
  }

    /**
   * Do requests
   *
   * @param  {String} method
   * @param  {String} endpoint
   * @param  {Object} data
   * @param  {Object} params
   *
   * @return {Object}
   */
     _request(method, endpoint, data, params = {}) {
        const url = this._getUrl(endpoint, params);
    
        const headers = {
          Accept: "application/json",
          access_token:this.accessToken
        };

        let options = {
          url: url,
          method: method,
          responseEncoding: this.encoding,
          timeout: this.timeout,
          responseType: "json",
          headers
        };
  
    
        if (data) {
          options.headers["Content-Type"] = "application/json;charset=utf-8";
          options.data = JSON.stringify(data);
        }
    
        // Allow set and override Axios options.
        options = { ...options, ...this.axiosConfig };
    
        return axios(options);
      }

       /**
   * GET requests
   *
   * @param  {String} endpoint
   * @param  {Object} params
   *
   * @return {Object}
   */
  get(endpoint, params = {}) {
    return this._request("get", endpoint, null, params);
  }

  /**
   * POST requests
   *
   * @param  {String} endpoint
   * @param  {Object} data
   * @param  {Object} params
   *
   * @return {Object}
   */
  post(endpoint, data, params = {}) {
    return this._request("post", endpoint, data, params);
  }

  /**
   * PUT requests
   *
   * @param  {String} endpoint
   * @param  {Object} data
   * @param  {Object} params
   *
   * @return {Object}
   */
  put(endpoint, data, params = {}) {
    return this._request("put", endpoint, data, params);
  }

  /**
   * DELETE requests
   *
   * @param  {String} endpoint
   * @param  {Object} params
   * @param  {Object} params
   *
   * @return {Object}
   */
  delete(endpoint, params = {}) {
    return this._request("delete", endpoint, null, params);
  }

  /**
   * OPTIONS requests
   *
   * @param  {String} endpoint
   * @param  {Object} params
   *
   * @return {Object}
   */
  options(endpoint, params = {}) {
    return this._request("options", endpoint, null, params);
  }
}


/**
 * Options Exception.
 */
 export class OptionsException {
    /**
     * Constructor.
     *
     * @param {String} message
     */
     constructor(message) {
      this.name = "Options Error";
      this.message = message;
    }
  }
  