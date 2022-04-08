/**
 * E2ee SDK
 *
 * @param {Object} opt
 */
export default class E2eeSDK {
   public getInfo() :string
}

/**
 * Options Exception.
 */
export class OptionsException {
  public name: 'Options Error'
  public message: string

  /**
   * Constructor.
   *
   * @param {String} message
   */
  constructor(message: string)
}
