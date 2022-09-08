# Mailserver

Dieser Mail-Server ist zur einfachen Weiterleitung von E-Mails an Opt-In Nutzer gedacht.

## I. Development

### Start dev server

Starting the dev server also starts MongoDB as a service in a docker container using the compose script at `docker-compose.dev.yml`.

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
|  HOST | string  | `example.com:3000` | ? |
|  MONGO_URL | string  | `mongodb://localhost:27017/mailserver` | URL for MongoDB |
|  MAIL_HOST | string  | `localhost` | URL for Mailserver |
|  MAIL_PORT | number  | `1025` | Port for Mailserver |
|  MAIL_USER | string  | `project.1` | Username for Mailserver login |
|  MAIL_PASS | string  | `secure.1` | Password for Mailserver login |

## II. Architecture

## III. Aufgaben

### MVP

* [X] Am Verteiler mittels Opt-In anmelden
* [X] Senden an mehrere Verteiler gleichzeitig
* [ ] Verteiler Einstellungen ändern (Von bestehenden abmelden, neue anmelden)
* [ ] Administrative Oberfläche
  * [ ] Absender zulassen (ID des Verteilers im User eintragen)
  * [ ] Verteiler hinzufügen
  * [ ] Absender entfernen (ID des Verteilers im User entfernen)
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
