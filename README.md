# CampusLens-QVAC

CampusLens is a small local-first college document assistant powered by Tether's QVAC SDK.

## What it does

CampusLens accepts a college notice as pasted text or a `.txt` file and asks a QVAC model to produce:

- Summary
- Important dates
- Action items
- Quick quiz

The app is intentionally small so the QVAC on-device inference path is easy to verify.

## QVAC requirement

- Package: `@qvac/sdk`
- Version: `0.20.0`
- Model: `LLAMA_3_2_1B_INST_Q4_0`
- Functions used: `loadModel()`, `completion()`, `unloadModel()`
- Cloud AI inference: none

## Requirements

- Node.js 22.17 or newer
- npm 10.9 or newer

## Install

```bash
npm install
```

## Run

```bash
npm start
```

Open:

```text
http://localhost:3000
```

On the first AI request, QVAC may download the model. After the model is available locally, inference runs on this machine.

## Test

Click **Load Sample Notice**, then click **Analyze with Local AI**.

The included sample contains a fictional university examination notice and is only for testing.

## Project structure

```text
CampusLens-QVAC/
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── server.js
├── package.json
├── README.md
├── LICENSE
├── .gitignore
└── sample-notice.txt
```

## GitHub submission checklist

- [ ] Public repository
- [ ] MIT license
- [ ] At least 3 commits
- [ ] README present
- [ ] QVAC 0.20.0 declared
- [ ] `loadModel()` present
- [ ] `completion()` present
- [ ] Working screenshot/recording
- [ ] X post tags `@qvac` and links to the repository

## Privacy

The browser sends the document only to the local Node.js process. That process calls QVAC for inference. This project does not send document content to a cloud AI provider.

An internet connection may be needed initially to download the QVAC model. This is different from sending each inference request to a cloud AI service.

## License

MIT

## Demo Workflow

1. Start the app with 
pm start.
2. Open http://localhost:3000.
3. Click **Load Sample Notice**.
4. Click **Analyze with Local AI**.
5. QVAC generates a summary, important dates, action items, and a quick quiz.

### QVAC Inference

The application uses loadModel() to load the local model and completion() to generate the analysis. unloadModel() is used when the server shuts down.

The AI inference is performed locally by QVAC. No cloud AI inference API is used.
