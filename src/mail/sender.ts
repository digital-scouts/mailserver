import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport(
  'smtps://info@jannecklange.de:rCbxWmTT66votw@smtp.strato.de/?pool=true'
);

export function sendMail(to: string, subject: string, text: string) {

  transporter.sendMail({
    from: 'info@jannecklange.de',
    to,
    subject,
    text
  }, (error, info) => {
    if (error) {
      console.log(`error: ${error}`);
    }
    console.log(`Message Sent ${info.response}`);
  });
}


