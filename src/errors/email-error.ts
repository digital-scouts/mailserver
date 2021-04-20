export default class EmailError extends Error {
  message: string;

  responseCode: number;

  // WRONG_MAIL_ERROR_CODE = 550;
  // AUTHENTICATION_ERROR_CODE = 530;

  constructor(responseCode: 550 | 530, message: string = 'EMail Error') {
    super();
    this.message = message;
    this.responseCode = responseCode;
  }
}
