# Alwarid v2 (Next.js)

This repository now contains the Next.js version of Alwarid as the primary application.
The legacy static HTML/CSS/JS prototype was removed to keep a single source of truth.

## Stack

- Next.js 16 (App Router)
- React 19
- Three.js / React Three Fiber / Drei
- ESLint

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Main Routes

One sign in for everyone: the app detects doctor (INPE) or patient (CNIE) from the identifier.

- `/` sign in (try `INPE 45219` for a doctor, `AB123456` for a patient, or the Démo buttons)
- `/confirm?role=doctor|patient` "Est-ce bien vous ?" confirmation with a one-time code

Doctor space
- `/doctor` home: search, patients to examine
- `/doctor/patient` patient file with the interactive 3D body (rotate, zoom, muscles / skeleton / organs, click a zone for its exams)
- `/doctor/patient/report` review a WassIA memory report
- `/doctor/patient/team` care team, clinics, access requests
- `/doctor/patient/labs` lab results compared over time
- `/doctor/patient/rx` deliberate prescription: choose each medicine, safety check, signature, QR
- `/doctor/patient/note` consultation note with autosave, signature and amendments
- `/doctor/results` results to review: owner, deadline, backup, decision
- `/doctor/mode/urgence|consultation|suivi|transfert` the four clinical modes (with the AI assistant)
- `/doctor/epidemie` epidemic surveillance dashboard

Patient space
- `/patient` patient platform (dossier, prescriptions, appointments)
- `/patient/privacy` who sees my record (Nom, Notes or Masqué, per doctor)
- `/patient/access` access log and access requests

The old routes (`/role`, `/search`, `/mode`, `/dashboard`, `/epidemie`, `/body_visualization`) redirect to the new ones.

## Shared demo state

`src/lib/platformStore.js` keeps privacy choices, access requests, reviewed results, the prescription and the note in `localStorage`, so the doctor and patient screens stay consistent (for example, a doctor's access request appears in the patient's access log).

## 3D body

`public/models/body-opt.glb` is `body.glb` with its 826 meshes merged by material and re-compressed (8 MB to 0.9 MB, loads in under a second). The organs are stylised shapes placed inside the rib cage and abdomen (`src/components/Body3D.js`). Zones and their exams are in `src/data/bodyZones.js`. The Draco decoder is served from `public/draco`.

## Screens

The doctor and patient screens in `src/screens` were converted from the Claude Design boards. Each has a `.module.css` next to it.

## API Routes

- `/api/ai` streams Mistral responses (requires `MISTRAL_API_KEY` in `.env.local`)
- `/api/patient-ai` patient chat endpoint backed by Mistral using filtered patient context
- `/api/ecg` ECG inference endpoint with offline fallback when Flask API is unavailable

## Environment Variables

Create `.env.local` from `.env.example` and set:

- `MISTRAL_API_KEY` your private Mistral key
- `MISTRAL_MODEL` optional, default is `mistral-small-latest`

## Quality Check

```bash
npm run lint
npm run build
```

If `npm install` fails with `EPERM` inside OneDrive, pause OneDrive sync or copy the project to a folder outside OneDrive first.

Build should complete successfully before deployment.
