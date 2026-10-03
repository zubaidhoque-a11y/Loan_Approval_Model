// ===== Settings =====
// Change this to your deployed backend URL (no trailing slash), e.g. "https://my-loan-api.onrender.com"
const API_URL = "http://127.0.0.1:8000";

const form = document.getElementById("loanForm");
const submitBtn = document.getElementById("submitBtn");
const btnText = submitBtn.querySelector(".btn-text");
const errorBox = document.getElementById("error");
const resultBox = document.getElementById("result");
const stamp = document.getElementById("stamp");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");
const resetBtn = document.getElementById("resetBtn");

const numberFields = ["ApplicantIncome", "CoapplicantIncome", "LoanAmount", "Loan_Amount_Term"];

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.hidden = false;
}

function setLoading(on) {
  submitBtn.disabled = on;
  submitBtn.classList.toggle("loading", on);
  btnText.textContent = on ? "Checking..." : "Check my loan";
}

function buildPayload() {
  const fd = new FormData(form);
  const payload = {
    ApplicantIncome: parseFloat(fd.get("ApplicantIncome")),
    CoapplicantIncome: parseFloat(fd.get("CoapplicantIncome")),
    LoanAmount: parseFloat(fd.get("LoanAmount")),
    Loan_Amount_Term: parseFloat(fd.get("Loan_Amount_Term")),
    Credit_History: parseFloat(fd.get("Credit_History")),
    Dependents: parseInt(fd.get("Dependents"), 10),
    Gender: parseInt(fd.get("Gender"), 10),
    Married: parseInt(fd.get("Married"), 10),
    Education: parseInt(fd.get("Education"), 10),
    Self_Employed: parseInt(fd.get("Self_Employed"), 10),
    Property_Area: parseInt(fd.get("Property_Area"), 10),
  };
  return payload;
}

function validate() {
  let ok = true;
  numberFields.forEach((id) => {
    const el = document.getElementById(id);
    const bad = el.value === "" || Number(el.value) < 0;
    el.classList.toggle("invalid", bad);
    if (bad) ok = false;
  });
  return ok;
}

function showResult(status) {
  const approved = status === "Loan Approved";
  resultBox.className = "result " + (approved ? "ok" : "no");
  stamp.textContent = approved ? "\u2713" : "\u2715";
  resultTitle.textContent = approved ? "Likely to be approved" : "Unlikely to be approved";
  resultText.textContent = approved
    ? "Based on your details, this application looks similar to ones that were approved. A lender will still review it before making a final decision."
    : "Based on your details, this application looks similar to ones that were not approved. Try a lower loan amount or a longer term, and check again.";
  form.hidden = true;
  resultBox.hidden = false;
  resultBox.focus();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.hidden = true;

  if (!validate()) {
    showError("Fill in all the income and loan fields with numbers of 0 or more.");
    return;
  }

  setLoading(true);
  try {
    const res = await fetch(API_URL + "/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload()),
    });
    if (!res.ok) throw new Error("Server returned " + res.status);
    const data = await res.json();
    showResult(data.status);
  } catch (err) {
    showError("Could not reach the prediction service. Check your internet connection and try again.");
    console.error(err);
  } finally {
    setLoading(false);
  }
});

resetBtn.addEventListener("click", () => {
  resultBox.hidden = true;
  form.hidden = false;
  form.reset();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

numberFields.forEach((id) =>
  document.getElementById(id).addEventListener("input", (e) => e.target.classList.remove("invalid"))
);
