[![Docker Image](https://github.com/JanneckLange/mailserver/actions/workflows/pushToDocker.yml/badge.svg?branch=master)](https://hub.docker.com/repository/docker/sapza/mailserver)

[![wakatime](https://wakatime.com/badge/user/f75702c6-6ecd-478f-a765-9c0a07c62d50/project/211f7cb7-35d5-4675-a4ba-91e94c2bcdfc.svg)](https://wakatime.com/@f75702c6-6ecd-478f-a765-9c0a07c62d50)

# Mailserver

Dieser Mail-Server ist zur einfachen Weiterleitung von E-Mails an Opt-In Nutzer gedacht.

## I. Development

### Start dev server

Starting the dev server also starts MongoDB and a fake mail server as a service in a docker container using the compose script at `docker-compose.dev.yml`.

```$ npm run nodemon```
Running the above commands results in

* 🌏 **API Server** running at `http://localhost:3000`
* ⚙️**Swagger UI** at `http://localhost:3000/dev/api-docs`
* 🛢️ **MongoDB** running at `mongodb://localhost:27017`

### Environment

To edit environment variables, create a file with name `.env` and copy the contents from `.env.default` to start with.

| Var Name  | Type  | Default | Description  |
|---|---|---|---|
| NODE_ENV  | string  | `development` |API runtime environment. eg: `staging`  |
|  PORT | number  | `3000` | Port to run the API server on |
|  HOST | string  | `example.com:3000` | Hostname the mail footer refers to, to unsubscribe |
|  MONGO_URL | string  | `localhost` | URL for MongoDB |
|  MONGO_USER | string  | `someUsername` | Username the MongoDB will be accessed |
|  MONGO_PASS | string  | `somePassword` | Password the MongoDB will be accessed |
|  MONGO_PORT | string  | `27017` | PORT for MongoDB |
|  MAIL_HOST | string  | `localhost` | URL for Mailserver to send mails |
|  MAIL_PORT | number  | `1025` | Port for Mailserver |
|  MAIL_USER | string  | `project.1` | Username for Mailserver login |
|  MAIL_PASS | string  | `secure.1` | Password for Mailserver login |
|  MAIL_SECURE | boolean  | `false` | Wherever the Mailserver is in secure mode. Most local dev servers are not. |
|  MAIL_IMAP_HOST | string  | `imap.strato.de` | Mailserver host name to receive mails |
|  MAIL_IMAP_PORT | string  | `993` | Mailserver port name to receive mails |

It is possible to observe multiple mailboxes on one server. To do so, add them to env/mails.json

```json
[
  {
    "user": "mailboxA@server.com",
    "password": "Password"
  },
  {
    "user": "mailboxB@server.com",
    "password": "Password"
  }
]
```

## II. Architecture

## III. Aufgaben

### MVP

* [X] Am Verteiler mittels Opt-In anmelden
* [X] E-Mails mit Formatierung
* [ ] E-Mails mit Anhängen
* [ ] Verteiler Einstellungen ändern (Von bestehenden abmelden, neue anmelden)
* [ ] Antworten auf E-Mails an den Absender weiterleiten
* Administrative Oberfläche
  * [ ] Absender zulassen (ID des Verteilers im User eintragen)
  * [ ] Verteiler hinzufügen
  * [ ] Absender entfernen
  * [ ] Empfänger einsehen

### Spätere Aufgaben

* [ ] Spamschutz
* [ ] E-Mail Historie
* [ ] Sendungsstatus zu E-Mails und Empfängern
* [ ] HTML Templates

## IV. Funktionen

* Nutzer können sich selbstständig im Verteiler eintragen (Opt-In)
  * Dazu wird eine Bestätigungs-Mail versendet.
* Es können E-Mails an eine Verteiler-Adresse gesendet werden.
  * E-Mail wird an alle Opt-In Nutzer weitergeleitet, wenn der Absender zugelassen ist.
