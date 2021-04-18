const sender = require('./sender');

export function receive(from: string, to: string, subject: string, text: string) {
  sender.sendMail(from, 'RE: ' + subject, text);
}
