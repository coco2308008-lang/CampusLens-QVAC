import express from "express";
import multer from "multer";
import fs from "node:fs/promises";
import {
  loadModel,
  completion,
  unloadModel,
  LLAMA_3_2_1B_INST_Q4_0
} from "@qvac/sdk";

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }
});

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

let modelId = null;
let loadingPromise = null;

async function getModel() {
  if (modelId) return modelId;
  if (loadingPromise) return loadingPromise;

  loadingPromise = loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0,
    modelConfig: { ctx_size: 4096 },
    onProgress: (p) => {
      if (p?.percentage != null) {
        console.log(`QVAC model: ${p.percentage.toFixed(0)}%`);
      }
    }
  });

  try {
    modelId = await loadingPromise;
    console.log("QVAC model loaded:", modelId);
    return modelId;
  } finally {
    loadingPromise = null;
  }
}

function buildPrompt(documentText) {
  return `Analyze this college notice/document for a student.

Return exactly these sections:
SUMMARY
IMPORTANT DATES
ACTION ITEMS
QUICK QUIZ

Rules:
- Keep the summary concise.
- Extract dates/deadlines only when present in the document.
- Give practical action items.
- Create 3 multiple-choice questions and include the correct answer.
- Do not invent facts that are not present.
- If a section has no information, say "None found."

DOCUMENT:
${documentText}`;
}

app.get("/api/status", (_req, res) => {
  res.json({
    ok: true,
    sdk: "@qvac/sdk 0.20.0",
    inference: "on-device",
    modelLoaded: Boolean(modelId)
  });
});

app.post("/api/analyze", upload.single("document"), async (req, res) => {
  let text = String(req.body?.text || "").trim();

  if (req.file) {
    const name = req.file.originalname.toLowerCase();
    if (!name.endsWith(".txt")) {
      return res.status(400).json({
        error: "This fast demo accepts .txt documents. PDF/OCR can be added as a later extension."
      });
    }
    text = req.file.buffer.toString("utf8").trim();
  }

  if (!text) {
    return res.status(400).json({ error: "Paste text or upload the sample .txt notice." });
  }

  if (text.length > 12000) {
    text = text.slice(0, 12000);
  }

  try {
    const id = await getModel();

    const result = completion({
      modelId: id,
      history: [
        {
          role: "system",
          content: "You are CampusLens, a local college document assistant. Analyze only the supplied document."
        },
        {
          role: "user",
          content: buildPrompt(text)
        }
      ],
      stream: false
    });

    const final = await result.final;
    const output = final?.contentText ?? final?.raw?.fullText ?? "";

    res.json({
      output,
      local: true,
      model: "Llama 3.2 1B Q4",
      qvacFunction: "loadModel() + completion()",
      inputCharacters: text.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error?.message || String(error),
      hint: "On first use QVAC downloads the model. Ensure Node.js 22.17+ is installed."
    });
  }
});

async function shutdown() {
  if (modelId) {
    try {
      await unloadModel({ modelId });
    } catch {}
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.listen(PORT, () => {
  console.log(`CampusLens AI: http://localhost:${PORT}`);
  console.log("QVAC inference is local to this machine.");
});
