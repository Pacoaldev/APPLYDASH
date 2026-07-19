const PRODUCTION_URL = "https://applydash.vercel.app";
const SCRAPED_FIELDS = ["company", "position", "platform", "location", "salary", "jobType"];

document.addEventListener("DOMContentLoaded", async () => {
  // Restore saved URL
  const stored = await chrome.storage.local.get(["baseUrl"]);
  document.getElementById("baseUrl").value = stored.baseUrl || PRODUCTION_URL;

  // Scrape the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  chrome.tabs.sendMessage(tab.id, { action: "scrape" }, (data) => {
    if (chrome.runtime.lastError || !data) return;
    fillFields(data);
    chrome.storage.local.set({ scraped: data });
  });
});

function fillFields(data) {
  if (data.company)   document.getElementById("company").value   = data.company;
  if (data.position)  document.getElementById("position").value  = data.position;
  if (data.platform)  document.getElementById("platform").value  = data.platform;
  if (data.location)  document.getElementById("location").value  = data.location;
  if (data.salary)    document.getElementById("salary").value    = data.salary;
  if (data.type) {
    const sel = document.getElementById("jobType");
    // Match canonical value (Remote / Office / Hybrid)
    const opt = [...sel.options].find(o => o.value === data.type);
    if (opt) sel.value = data.type;
  }
}

document.getElementById("save").addEventListener("click", async () => {
  const statusMsg = document.getElementById("statusMsg");
  const btn = document.getElementById("save");
  btn.disabled = true;
  statusMsg.textContent = "Saving…";
  statusMsg.style.color = "#94a3b8";

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
    statusMsg.textContent = "✓ Saved!";
    statusMsg.style.color = "#4ade80";
  } catch (e) {
    statusMsg.textContent = e.message || "Error — log in to ApplyDash first";
    statusMsg.style.color = "#f87171";
  } finally {
    btn.disabled = false;
  }
});
