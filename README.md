# DABubble

DABubble is a Slack-like business chat, built as the final project at the Developer Akademie.
It follows the Figma design and the project checklist of the Akademie.

## Features

- **Account:** sign up with avatar selection, log in with e-mail, Google or as a guest, reset the password
- **Profile:** edit your own name and avatar, view the profile cards of other members
- **Online status:** active, away or offline – updated in real time on every avatar
- **Channels:** create them, edit name and description (with duplicate check), add members, leave a channel
- **Messages:** write and edit messages in channels and direct chats, emojis, reactions, mentions with `@` and `#`
- **Threads:** reply to a single message in a separate column
- **New message:** choose the recipient by `#channel`, `@person` or e-mail address
- **Search:** find messages, channels and people across the whole workspace
- **Responsive:** desktop, tablet and mobile (from 320 px) with separate menu and chat views

## Tech stack

- [Angular 21](https://angular.dev) (standalone components, signals, SCSS, strict mode)
- [Firebase](https://firebase.google.com) with AngularFire: Authentication and Cloud Firestore
- Firestore security rules in [`firestore.rules`](firestore.rules)

## Getting started

Requirements: Node.js 20 or newer and the Angular CLI.

```bash
npm install
ng serve
```

The app then runs at `http://localhost:4200/`.
The Firebase configuration is in `src/environments/environment.ts`.

Production build:

```bash
ng build
```

## Folder structure

```
src/app/
├── core/       models, services, guards, validators and helpers
├── features/   pages and areas: auth (login, sign-up …), legal, workspace
└── shared/     reusable components such as avatar and toast
public/img/     logo, icons and avatars
```

## Author

Gabriele Lerch – [GitHub](https://github.com/Zeoane)
