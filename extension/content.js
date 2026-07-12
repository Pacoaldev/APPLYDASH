function scrapeJobPage() {
  const url = window.location.href;
  const host = window.location.hostname;

  let company = "";
  let position = "";
  let platform = host.replace("www.", "");

  const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
  const h1 = document.querySelector("h1")?.textContent?.trim();
  position = h1 || ogTitle || document.title.split("|")[0]?.trim() || "";

  if (host.includes("linkedin")) {
    company =
      document.querySelector(".job-details-jobs-unified-top-card__company-name")?.textContent?.trim() ||
      document.querySelector("[data-test-id='job-details-company-name']")?.textContent?.trim() ||
      "";
    position =
      document.querySelector(".job-details-jobs-unified-top-card__job-title")?.textContent?.trim() ||
      position;
    platform = "LinkedIn";
  } else if (host.includes("indeed")) {
    company = document.querySelector("[data-company-name]")?.textContent?.trim() || "";
    platform = "Indeed";
  } else if (host.includes("infojobs")) {
    company = document.querySelector(".ij-Offer-heading h2")?.textContent?.trim() || "";
    platform = "InfoJobs";
  }

  return { company, position, platform, applicationLink: url };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === "scrape") {
    sendResponse(scrapeJobPage());
  }
  return true;
});
