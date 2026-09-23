const file = document.querySelector("#file");
const filename = document.querySelector("#filename");
const text = document.querySelector("#text");
const sample = document.querySelector("#sample");
const analyze = document.querySelector("#analyze");
const output = document.querySelector("#output");
const empty = document.querySelector("#empty");
const model = document.querySelector("#model");
const status = document.querySelector("#status");
const dot = document.querySelector("#dot");

const sampleText = `JECRC UNIVERSITY

MID SEMESTER EXAMINATION NOTICE

All B.Tech students are informed that the Mid Semester Examinations will begin on 21 October 2026.

Important Dates:
Registration Deadline: 15 October 2026
Admit Card Release: 19 October 2026
Examination Begins: 21 October 2026

Students must complete their examination registration before the deadline.

Students are advised to carry their university identity card during examinations.`;

sample.addEventListener("click", () => {
  text.value = sampleText;
  filename.textContent = "Sample mid-semester notice loaded";
});

file.addEventListener("change", () => {
  filename.textContent = file.files?.[0]?.name || "or use the sample document";
});

async function checkStatus() {
  try {
    const response = await fetch("/api/status");
    const data = await response.json();
    status.textContent = data.modelLoaded
      ? "QVAC model loaded locally"
      : "QVAC ready • model loads on first analysis";
    dot.classList.add("ok");
  } catch {
    status.textContent = "Local server unavailable";
  }
}

analyze.addEventListener("click", async () => {
  if (!text.value.trim() && !file.files?.length) {
    text.focus();
    return;
  }

  analyze.disabled = true;
  analyze.textContent = "Running QVAC locally…";
  empty.hidden = true;
  output.hidden = false;
  output.textContent = "Loading local model and analyzing the document…";
  model.textContent = "LOCAL AI";

  const form = new FormData();
  if (file.files?.length) form.append("document", file.files[0]);
  if (text.value.trim()) form.append("text", text.value);

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      body: form
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Analysis failed.");

    output.textContent = data.output || "No AI output returned.";
    model.textContent = `${data.model} • ${data.qvacFunction}`;
  } catch (error) {
    output.textContent = `Error: ${error.message}`;
    model.textContent = "Check terminal";
  } finally {
    analyze.disabled = false;
    analyze.textContent = "Analyze with Local AI →";
    checkStatus();
  }
});

checkStatus();
