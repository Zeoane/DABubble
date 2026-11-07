# DABubble

DABubble ist ein Business-Chat im Stil von Slack, entstanden als Abschlussprojekt an der Developer Akademie.
Die Umsetzung folgt der Figma-Vorgabe und der Projekt-Checkliste der Akademie.

## Funktionen

- **Konto:** Registrierung mit Avatar-Auswahl, Login per E-Mail, Google oder als Gast, Passwort zurücksetzen
- **Profil:** eigenen Namen und Avatar bearbeiten, Profilkarten anderer Mitglieder ansehen
- **Online-Status:** aktiv, abwesend oder offline – in Echtzeit an allen Avataren
- **Channels:** erstellen, Name und Beschreibung bearbeiten (mit Duplikat-Prüfung), Mitglieder hinzufügen, Channel verlassen
- **Nachrichten:** in Channels und Direktnachrichten schreiben und bearbeiten, Emojis, Reaktionen, Erwähnungen mit `@` und `#`
- **Threads:** auf einzelne Nachrichten in einer eigenen Spalte antworten
- **Neue Nachricht:** Empfänger per `#channel`, `@person` oder E-Mail-Adresse wählen
- **Suche:** Nachrichten, Channels und Personen im ganzen Workspace finden
- **Responsive:** Desktop, Tablet und Mobil (ab 320 px) mit eigener Menü- und Chat-Ansicht

## Technik

- [Angular 21](https://angular.dev) (Standalone Components, Signals, SCSS, Strict Mode)
- [Firebase](https://firebase.google.com) mit AngularFire: Authentication und Cloud Firestore
- Sicherheitsregeln für Firestore in [`firestore.rules`](firestore.rules)

## Projekt starten

Voraussetzungen: Node.js 20 oder neuer und die Angular CLI.

```bash
npm install
ng serve
```

Danach läuft die App unter `http://localhost:4200/`.
Die Firebase-Konfiguration steht in `src/environments/environment.ts`.

Produktions-Build:

```bash
ng build
```

## Ordnerstruktur

```
src/app/
├── core/       Modelle, Services, Guards, Validatoren und Hilfsfunktionen
├── features/   Seiten und Bereiche: auth (Login, Registrierung …), legal, workspace
└── shared/     wiederverwendbare Komponenten, z. B. Avatar und Toast
public/img/     Logo, Icons und Avatare
```

## Autorin

Gabriele Lerch – [GitHub](https://github.com/Zeoane)
