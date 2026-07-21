const PRODUCTION_URL = "https://applydash.vercel.app";
const MAX_RETRIES = 3;
const RETRY_DELAYS = [500, 1500, 3000]; // ms between retries

document.addEventListener("DOMContentLoaded", async () => {
  // Restore saved URL
  const stored = await chrome.storage.local.get(["baseUrl"]);
  document.getElementById("baseUrl").value = stored.baseUrl || PRODUCTION_URL;

  // Scrape the active tab with retries
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  setStatus("Scanning page…", "#94a3b8");
  await scrapeWithRetry(tab.id, 0);
});

async function scrapeWithRetry(tabId, attempt) {
  return new Promise((resolve) => {
    const delay = attempt > 0 ? RETRY_DELAYS[attempt - 1] : 0;
    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, { action: "scrape", delay: 0 }, (data) => {
        if (chrome.runtime.lastError) {
          // Content script not injected yet — retry
          if (attempt < MAX_RETRIES) {
            setStatus(`Retrying… (${attempt + 1}/${MAX_RETRIES})`, "#f59e0b");
            resolve(scrapeWithRetry(tabId, attempt + 1));
          } else {
            setStatus("Could not read page. Fill in manually.", "#f87171");
            resolve(null);
          }
          return;
        }

        if (!data || isDataEmpty(data)) {
          if (attempt < MAX_RETRIES) {
            setStatus(`Page loading… (${attempt + 1}/${MAX_RETRIES})`, "#f59e0b");
            resolve(scrapeWithRetry(tabId, attempt + 1));
          } else {
            setStatus("Fill in any missing fields manually.", "#94a3b8");
            fillFields(data || {});
            resolve(data);
          }
          return;
        }

        setStatus("", "");
        fillFields(data);
        chrome.storage.local.set({ scraped: data });
        resolve(data);
      });
    }, delay);
  });
}

function isDataEmpty(data) {
  return !data.company && !data.position && !data.salary;
}

function fillFields(data) {
  if (!data) return;
  if (data.company)   setField("company",  data.company);
  if (data.position)  setField("position", data.position);
  if (data.platform)  setField("platform", data.platform);
  if (data.location)  setField("location", data.location);
  if (data.salary)    setField("salary",   data.salary);
  if (data.type) {
    const sel = document.getElementById("jobType");
    const opt = [...sel.options].find(o => o.value === data.type);
    if (opt) sel.value = data.type;
  }
}

function setField(id, value) {
  const el = document.getElementById(id);
  if (el && value) el.value = value;
}

function setStatus(msg, color) {
  const el = document.getElementById("statusMsg");
  el.textContent = msg;
  el.style.color = color;
}

document.getElementById("save").addEventListener("click", async () => {
  const btn = document.getElementById("save");
  btn.disabled = true;
  setStatus("Saving…", "#94a3b8");

  const baseUrl = document.getElementById("baseUrl").value.replace(/\/$/, "");
  await chrome.storage.local.set({ baseUrl });

  const typeVal = document.getElementById("jobType").value;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const payload = {
    company:         document.getElementById("company").value  || null,
    position:        document.getElementById("position").value || null,
    platform:        document.getElementById("platform").value || null,
    location:        document.getElementById("location").value || null,
    salary:          document.getElementById("salary").value   || null,
    notes:           document.getElementById("notes").value    || null,
    type:            typeVal || null,
    status:          document.getElementById("jobStatus").value,
    applicationLink: tab?.url ?? null,
    appliedDate:     new Date().toISOString().split("T")[0],
  };

  try {
    const res = await fetch(`${baseUrl}/api/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    setStatus("✓ Saved!", "#4ade80");
    // Auto-close popup after success
    setTimeout(() => window.close(), 1500);
  } catch (e) {
    setStatus(e.message || "Error — make sure you're logged in to ApplyDash", "#f87171");
  } finally {
    btn.disabled = false;
  }
});
