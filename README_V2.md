# ResQ v2 — mobile React prototype

This branch (`resq-v2`) contains a clean rebuild using React + Vite and plain CSS. No Tailwind or icon library is required.

## Run locally

```sh
npm install
npm run dev
```

## Build / test

```sh
npm run build
npm test
```

Entry point: `index.html` → `src/main.jsx` → `src/App.jsx`. The older AI Studio files in `src/` (App.tsx, components/, data/, etc.) are not imported by this build and can be deleted once v2 is approved.

## Included

- Full-width mobile home with Montserrat ResQ wordmark (red Q) and subtle gradients
- Swipeable presets: Get ResQ, Reach Me, Ambulance helpline, Family assistance
- Universal 5-second countdown with cancel; nothing is sent during the countdown
- One home Call 112 action plus Police, Fire, Medical, Disaster, Women, Child, Elderly and Report Bystander
- Right-swipe menu and hamburger: MediCard, family profiles, contacts, Mediclaim & hospitals, history, settings
- GPS with accuracy, manual patient address, text updates, local Video Stamps (30 s, downloadable)
- Manual share/SMS composition, end-session confirmation, history, reset data, offline state

## Boundaries

No ambulance dispatch, automated callback, automatic family alerts, live account linking or responder tracking is connected. The UI never fabricates those states. Use fictional data: localStorage is not encrypted.
