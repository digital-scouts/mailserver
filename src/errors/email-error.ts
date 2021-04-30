export default class EmailError extends Error {
  message: string;

  responseCode: number;

  // 550 // email not found on server - Die Adresse wurde nicht gefunden
  // 530 // user blocked / no permission - Die Nachricht wurde nicht zugestellt

  constructor(responseCode: 550 | 530, message: string = 'EMail Error') {
    super();
    this.message = message;
    this.responseCode = responseCode;
  }
}
