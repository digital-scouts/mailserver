// import receiver from 'receiver';
const receiver = require('mailin');
const bridge = require('./bridge');

receiver.start({
  port: 25,
  disableWebhook: true, // Disable the webhook posting.
  SMTPBanner: 'Hi from a custom Mailin instance'
});

/* Access simplesmtp server instance. */
receiver.on('authorizeUser', (connection: any, username: string, password: string, done: (arg0: Error, arg1: boolean) => void) => {
  if (username === 'johnsmith' && password === 'mysecret') {
    done(null, true);
  } else {
    done(new Error('Unauthorized!'), false);
  }
});

/* Event emitted after a message was received and parsed. */
receiver.on('message', (connection: any, data: { text: string; subject: string; from: string; to: string; date: any; }) => {
  console.log({
    text: data.text,
    subject: data.subject,
    from: data.from,
    to: data.to,
    date: data.date
  });
  bridge.receive(data.from, data.to, data.subject, data.text);
});
