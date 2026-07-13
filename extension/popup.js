const PRODUCTION_URL = "https://applydash.vercel.app";
const fields = ["company", "position", "platform", "status", "baseUrl"];

document.addEventListener("DOMContentLoaded", async () => {
  const stored = await chrome.storage.local.get(["baseUrl", "scraped"]);
  document.getElementById("baseUrl").value = stored.baseUrl || PRODUCTION_URL;
  if (stored.scraped) {
    for (const key of ["company", "position", "platform"]) {
      if (stored.scraped[key]) document.getElementById(key).value = stored.scraped[key];
    }
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: "scrape" }, (data) => {
      if (chrome.runtime.lastError || !data) return;
      for (const key of ["company", "position", "platform"]) {
        if (data[key]) document.getElementById(key).value = data[key];
      }
      chrome.storage.local.set({ scraped: data });
    });
  }
});

document.getElementById("save").addEventListener("click", async () => {
  const statusMsg = document.getElementById("statusMsg");
  const btn = document.getElementById("save");
  btn.disabled = true;
  statusMsg.textContent = "Saving...";
  statusMsg.style.color = "";

  const baseUrl = document.getElementById("baseUrl").value.replace(/\/$/, "");
  await chrome.storage.local.set({ baseUrl });

  const payload = {
    company: document.getElementById("company").value || null,
    position: document.getElementById("position").value || null,
    platform: document.getElementById("platform").value || null,
    status: document.getElementById("jobStatus").value,
    applicationLink: (await chrome.tabs.query({ active: true, currentWindow: true }))[0]?.url ?? null,
    appliedDate: new Date().toISOString().split("T")[0],
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
    statusMsg.textContent = "Saved!";
    statusMsg.style.color = "green";
  } catch (e) {
    statusMsg.textContent = e.message || "Error — log in to ApplyDash first";
    statusMsg.style.color = "red";
  } finally {
    btn.disabled = false;
  }
});
