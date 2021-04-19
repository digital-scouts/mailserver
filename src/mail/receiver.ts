import logger from '../logger';

const receiver = require('mailin');
const subscription = require('./subscriptionService');
const distributor = require('./distributorService');

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
receiver.on('message', (connection: any, data: any) => {
  receiveMail(connection, data);
});

export function receiveMail(connection: any = fake_connection(), data: any = fake_email()) {
  const from = data.message ? data.message.from[0].address : data.from[0].address;
  const to = data.message ? data.message.to[0].address : data.to[0].address;
  const subject = data.message ? data.message.subject : data.subject;
  const text = data.message ? data.message.text : data.text;
  logger.debug(from + ' ' + to + ' ' + subject + ' ' + text);

  handleReceive(from, to, subject, text);
}

function handleReceive(from: string, to: string, subject: string, text: string) {
  if (to.split('@')[0] === 'subscribe') {
    subscription.handleNewSubscription(from, subject, text);
  } else if (to.split('@')[0].includes('-verteiler')) {
    distributor.handleNewDistribution(from, to, subject, text);
  }
}


function fake_connection() {
  return JSON.parse('{"message":{"id":"a6a54fb0-96ee-446a-ade8-a830489c47f4","remoteAddress":"209.85.218.48","remotePort":40615,"clientHostname":"mail-ej1-f48.google.com","openingCommand":"EHLO","hostNameAppearsAs":"mail-ej1-f48.google.com","xClient":{},"xForward":{},"transmissionType":"ESMTPS","tlsOptions":{"name":"TLS_AES_256_GCM_SHA384","standardName":"TLS_AES_256_GCM_SHA384","version":"TLSv1.3"},"envelope":{"mailFrom":{"address":"langejanneck@gmail.com","args":false},"rcptTo":[{"address":"subscribe@jannecklange.de","args":false}]},"transaction":1,"mailPath":".tmp/a6a54fb0-96ee-446a-ade8-a830489c47f4"},"level":"debug","service":"api","timestamp":"2021-04-19T19:44:33.795Z"}');
}

function fake_email() {
  return JSON.parse(`{
"message":{
  "html":"<div id='__MailbirdStyleContent' style='font-size: 10pt;font-family: Arial,serif;color: #000000;text-align: left' dir='ltr'>asdasd<div class='mb_sig'></div></div>",
  "text":"asdasd",
  "headers":{
    "received":["by mail-ej1-f48.google.com with SMTP id n2so54732019ejy.7 for <subscribe@jannecklange.de>; Mon, 19 Apr 2021 12:44:33 -0700 (PDT)","from [192.168.178.21] (149.224.151.78.dynamic-pppoe.dt.ipv4.wtnet.de. [149.224.151.78]) by smtp.gmail.com with ESMTPSA id n17sm2774507eds.72.2021.04.19.12.44.32 for <subscribe@jannecklange.de> (version=TLS1_2 cipher=ECDHE-ECDSA-AES128-GCM-SHA256 bits=128/128); Mon, 19 Apr 2021 12:44:32 -0700 (PDT)"],
    "dkim-signature":"v=1; a=rsa-sha256; c=relaxed/relaxed; d=gmail.com; s=20161025; h=mime-version:date:message-id:subject:from:to:user-agent; bh=77RSezrcGFM8jGb5u82LGUu+eD0RJLPleES6jfc6sIk=; b=hvsvxko7EtL1fSUMncmi4V4r+sh0SeF3e0rQMgT0Acs9fXYgI6dvwtc+oONbUCK/bh vBbs/6SHssWBQJGqnErQTCP033zY8NMZFYaJr53qs2DEIIvYVmzSl88ark0O9PVxmVV9 8yjg+guyxuuZmVQMV/IKIrYqrLUtZ74XxNB7gSLPjePMnoZXIs72SIAULKEmycz+2r9a zkTN31xTGC9zk1hfRo70HXgyjrYtkPvNg6WTr9k+MDncc3DPZMulp3m83lVDYleIshO8 ZvKA/nVvX6ajJ7uHJwWwdE88bF19QOVa43ScReFL2lau/8yM6KR/ULvU5YkCFUkiMuqU SK7g==",
    "x-google-dkim-signature":"v=1; a=rsa-sha256; c=relaxed/relaxed; d=1e100.net; s=20161025; h=x-gm-message-state:mime-version:date:message-id:subject:from:to :user-agent; bh=77RSezrcGFM8jGb5u82LGUu+eD0RJLPleES6jfc6sIk=; b=cPT2pMdLprCrm5R6HFTmk6PcznDFOVC1MQZv8H7uwD8HvDoNV3B8C+mpGqMDZw0vT2 F+PsOxKnO5BgDFHerReGyqTgmmiyrbwoIZb+G6VPkqP7cFlQNm6dL48Xvd0YTigcYZ0K xgNcnDg1H2hm+5xXWOE1sJNaxeYmg6F0uYE4rlThljVXSuWes95KtDmIxpwGn/K1FPXX CVASjpZwV97licc4cO9ba4+szkN1CnUeG1gWuxW7Mjpn2gIcEV4R4R/2Z7GTPT3z2IXK A7A6lcBFmtNssjZglYFQsQKEYYthSpk3bZu5eT4/cqYE0CLkOtQ3cRaEtu0RCRvVsuNo NvMg==",
    "x-gm-message-state":"AOAM531ZxLrImde9+xeL3+TweraCm8RpQSKLIdjiUbUkZpkEb45VFTTR nI2RzkfC0tZZqD9ykQvkvDCQfzvQHXmbVA==",
    "x-google-smtp-source":"ABdhPJyYoaM9qzkpgo8yz0mVsrqt2TOkHq6LBF0I1Fl7/l1YpqPPusYCcVv4QRVuawv3t9d0P1uwkQ==",
    "x-received":"by 2002:a17:906:dbd5:: with SMTP id yc21mr23873906ejb.29.1618861472762; Mon, 19 Apr 2021 12:44:32 -0700 (PDT)",
    "return-path":"<langejanneck@gmail.com>",
    "content-type":"multipart/alternative; boundary='----=_NextPart_41013555.930413681176'",
    "mime-version":"1.0",
    "date":"Mon, 19 Apr 2021 21:44:31 +0200",
    "message-id":"<Mailbird-e864fc83-1f69-4a49-bf2d-980e61e7acda@gmail.com>",
    "subject":"Test",
    "from":"'Janneck Lange' <langejanneck@gmail.com>",
    "to":"'' <subscribe@jannecklange.de>",
    "user-agent":"Mailbird/2.9.27.0",
    "x-mailbird-id":"Mailbird-e864fc83-1f69-4a49-bf2d-980e61e7acda@gmail.com"
  },
  "subject":"Test",
  "messageId":"Mailbird-e864fc83-1f69-4a49-bf2d-980e61e7acda@gmail.com",
  "priority":"normal",
  "from":[
    {"address":"langejanneck@gmail.com","name":"Janneck Lange"}
  ],
  "to":[
    {"address":"subscribe@jannecklange.de","name":""}
  ],
  "date":"2021-04-19T19:44:31.000Z",
  "receivedDate":"2021-04-19T19:44:33.000Z",
  "dkim":"pass",
  "spf":"failed",
  "spamScore":0,
  "language":"portuguese",
  "cc":[],
  "attachments":[],
  "connection":{
    "id":"a6a54fb0-96ee-446a-ade8-a830489c47f4",
    "remoteAddress":"209.85.218.48",
    "remotePort":40615,
    "clientHostname":"mail-ej1-f48.google.com",
    "openingCommand":"EHLO",
    "hostNameAppearsAs":"mail-ej1-f48.google.com",
    "xClient":{},
    "xForward":{},
    "transmissionType":"ESMTPS",
    "tlsOptions":{
      "name":"TLS_AES_256_GCM_SHA384",
      "standardName":"TLS_AES_256_GCM_SHA384",
      "version":"TLSv1.3"
    },
    "envelope":{
      "mailFrom":{
        "address":"langejanneck@gmail.com",
        "args":false
      },
      "rcptTo":[{
        "address":"subscribe@jannecklange.de",
        "args":false
      }]
    },
    "transaction":1,
    "mailPath":".tmp/a6a54fb0-96ee-446a-ade8-a830489c47f4"
  },
  "envelopeFrom":{
    "address":"langejanneck@gmail.com",
    "args":false
  },
  "envelopeTo":[{
    "address":"subscribe@jannecklange.de",
    "args":false
  }]
},
"level":"debug",
"service":"api",
"timestamp":"2021-04-19T19:44:33.795Z"}`);
}
