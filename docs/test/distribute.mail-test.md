# Testszenarien zum Senden von Mails

## 1: Mit Berechtigung eine E-Mail an den Verteiler senden

Voraussetzung:

- Der Verteiler ist beschränkt.
- Der Absender ist freigeschaltet.
- Der Verteiler hat mehrere Empfänger
- Der Absender sendet eine Mail an den Verteiler (AN, CC oder BCC).

Erwartung:

- Die Mail wird an alle Empfänger weitergeleitet.
- Formatierung, Bildern und Dateien bleiben erhalten.
- Der Footer zum Abmelden wird hinzugefügt.
- Als Absender der Mail ist der Verteiler angegeben

## 2: Ohne Berechtigung eine Mail an den Verteiler senden

Voraussetzung:

- Der Verteiler ist beschränkt.
- Der Absender ist nicht freigeschaltet.
- Es sind Sub-Admins für den Verteiler eingetragen.
- Der Absender sendet eine Mail an den Verteiler (AN, CC oder BCC).

Erwartung:

- Die Mail wird an alle Sub-Admins weitergeleitet.
- Formatierung, Bildern und Dateien bleiben erhalten.
- Als Absender der Mail ist der originale Absender angegeben

## 3: Auf eine E-Mail des Verteilers antworten

Voraussetzung:

- Es wurde eine Mail über den Verteiler gesendet. (Fall 1 oder 2)
- Es sind Sub-Admins für den Verteiler eingetragen.
- Der Absender sendet eine Antwort-Mail an den Verteiler (AN).

Erwartung:

- Die Mail wird an den ursprünglichen Absender weitergeleitet.
- Die Sub-Admins des Verteiler erhalten die Mail als Kopie.

## 4: An einen offenen Verteiler senden

Wird vorerst nicht beachtet, alle Verteiler sind geschlossen.
