/**
 *  Copyright Folksdo.com, Inc. or its affiliates. All Rights Reserved.
 */

// Imports
// import { any } from "./types";

class Logger {
  /**
   * Constructor
   */
  constructor() {}

  /**
   * Private method that uses console logger to log message using `warn` level
   * @param {string} text log message
   * @param {any} logObject an object that is converted to strings and logged with the `text`
   */
  private logError(
    service: string,
    action: string,
    text: string,
    logObject?: any  
  ): void {
    let msg = `====== service:"[${service}]" ====== action:${action} ====== text:${text}`;
    if (typeof logObject === "undefined" || !logObject) {
      console.error(msg);
    } else {
      console.error(msg, logObject);
    }
  }

  /**
   * Private method that uses console logger to log message using `warn` level
   * @param {string} text log message
   * @param {any} logObject an object that is converted to strings and logged with the `text`
   */
  private logWarn(
    service: string,
    action: string,
    text: string,
    logObject?: any
  ): void {
    let msg = `====== service:"[${service}]" ====== action:${action} ====== text:${text}`;
    if (typeof logObject === "undefined" || !logObject) {
      console.warn(msg);
    } else {
      console.warn(msg, logObject);
    }
  }

  /**
   * Private method that uses console logger to log message using `debug` level
   * @param {string} text log message
   * @param {any} logObject an object that is converted to strings and logged with the `text`
   */
  private logDebug(
    service: string,
    action: string,
    text: string,
    logObject?: any
  ): void {
    let msg = `====== service:"[${service}]" ====== action:${action} ====== text:${text}`;
    if (typeof logObject === "undefined" || !logObject) {
      console.debug(msg);
    } else {
      console.debug(msg, logObject);
    }
  }

  /**
   * Private method that uses console logger to log message using `info` level
   * @param {string} text log message
   * @param {any} logObject an object that is converted to strings and logged with the `text`
   */
  private logInfo(
    service: string,
    action: string,
    text: string,
    logObject?: any
  ): void {
    let msg = `====== service:"[${service}]" ====== action:${action} ====== text:${text}`;
    if (typeof logObject === "undefined" || !logObject) {
      console.info(msg);
    } else {
      console.info(msg, logObject);
    }
  }

  /**
   * Log message using `info` level
   * @param {string} text log message
   * @param {any} logObject an object that is converted to strings and logged with the `text`
   */
  public info(
    service: string,
    action: string,
    text: string,
    logObject?: any
  ): void {
    this.logInfo(service, action, text, logObject);
  }

  /**
   * Log message using `debug` level
   * @param {string} text log message
   * @param {any} logObject an object that is converted to strings and logged with the `text`
   */
  public debug(
    service: string,
    action: string,
    text: string,
    logObject?: any
  ): void {
    this.logDebug(service, action, text, logObject);
  }

  /**
   * Log message using `warn` level
   * @param {string} text log message
   * @param {any} logObject an object that is converted to strings and logged with the `text`
   */
  public warn(
    service: string,
    action: string,
    text: string,
    logObject?: any
  ): void {
    this.logWarn(service, action, text, logObject);
  }

  /**
   * Log message using `error` level
   * @param {string} text log message
   * @param {any} logObject an object that is converted to strings and logged with the `text`
   */
  public error(
    service: string,
    action: string,
    text: string,
    logObject?: any
  ): void {
    this.logError(service, action, text, logObject);
  }
}

export { Logger };

