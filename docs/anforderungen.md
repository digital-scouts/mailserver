# Anforderungen an ein MVP

## Absender

* Der Absender kann eine Mail von seinem privaten Account mit Text, Bildern und Anhängen an den Verteiler senden. Wenn der Verteiler öffentlich ist oder der Absender für den geschlossenen Verteiler freigeschaltet ist wird die Nachricht an alle Empänger weitergeleitet.
* Wenn der Verteiler geschlossenen und der Absender nicht freigeschaltet ist wird die Nachricht an die Sub-Administratoren weitergeleitet.
* Der Absender kann an mehrere Verteiler gleichzeitig schreiben. Ist ein Empfänger in mehreren Verteilern, erhält dieser mehrere Mails.
* Wenn eine Mail nicht zugestellt werden kann, wird der Absender benachrichtigt.
  * Muss noch geprüft werden, was für Fälle von 'Zustellung nicht möglich' existieren und abgefangen werden können.
* Die Adresse des Absenders bleibt verborgen und kann vom Empfänger nicht gesehen werden.

## Empfänger

* Um Empfänger zu werden muss ein Nutzer sich an einem Verteiler anmelden und seine Mail bestätigen.
* Der Empfänger kann am Ende jeder Mail sehen, warum er die Mail empfangen hat und wie er sich abmelden kann.
* Der Empfänger kann sich mittels eines Links am Ende jeder E-Mail vom Verteiler abmelden und weitere Verteiler abonieren.
* Der Empfänger kann auf eine Mail Antworten. Die Antwort wird an alle Sub-Adminsitratoren und den Absender weitergeleitet.

## Sub-Administrator

* Der Sub-Administrator wird über Änderungen an seinem Verteiler benachrichtigt.
* Der Sub-Administrator kann Empfänger aus dem Verteiler entfernen, um den Verteiler aktuell zu halten.
* Der Sub-Administrator kann Nutzer einladen einem Verteiler beizutreten, damit Empfänger es leichter haben.
* Der Sub-Administrator kann Absender für einen geschlossenen Verteiler hinzufügen.

## Adminsitrator

* Der Administrator kann Sub-Adminstratoren zu Verteilern hinzufügen und entfernen.
* Der Sub-Administrator hat die Rechte eines Sub-Administrators für alle Verteiler.
