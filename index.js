console.log("LessTube loaded! Made by Less Matter (lessmatter.com)");

function isHomePage() {
  return (
    window.location.pathname === "/" ||
    window.location.pathname === "/feed/trending" ||
    window.location.pathname === "/feed/subscriptions" ||
    window.location.pathname === "/feed/library" ||
    window.location.pathname === "/feed/history"
  );
}

function getPageType() {
  const path = window.location.pathname;

  if (
    path === "/" ||
    path === "/feed/trending" ||
    path === "/feed/subscriptions" ||
    path === "/feed/library" ||
    path === "/feed/history"
  ) {
    return "home";
  } else if (path.startsWith("/watch")) {
    return "watch";
  } else if (path.startsWith("/results")) {
    return "search";
  } else if (
    path.startsWith("/channel/") ||
    path.startsWith("/c/") ||
    path.startsWith("/@")
  ) {
    return "channel";
  } else if (path.startsWith("/playlist")) {
    return "playlist";
  } else if (path.startsWith("/shorts/")) {
    return "shorts";
  } else {
    return "other";
  }
}

function redirectChannelToVideos() {
  const path = window.location.pathname;

  if (
    path.match(/^\/@[^\/]+$/) ||
    path.match(/^\/channel\/[^\/]+$/) ||
    path.match(/^\/c\/[^\/]+$/)
  ) {
    console.log("LessTube: Redirecting channel to videos page");
    const videosUrl = window.location.href + "/videos";
    window.location.replace(videosUrl);
    return true;
  }
  return false;
}

function redirectShortsToWatch() {
  const path = window.location.pathname;

  if (path.match(/^\/shorts\/[^\/]+$/)) {
    console.log("LessTube: Redirecting Shorts to regular watch page");
    const videoId = path.split("/")[2];
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    window.location.replace(watchUrl);
    return true;
  }
  return false;
}

function handleRedirects() {
  if (redirectChannelToVideos()) return true;
  if (redirectShortsToWatch()) return true;
  return false;
}

function setPageType() {
  const pageType = getPageType();
  document.body.setAttribute("data-page-type", pageType);
  console.log(`LessTube: Page type set to "${pageType}" (${window.location.pathname})`);
}

function addHomePageFooter() {
  document.getElementById("lesstube-footer")?.remove();
  const pageType = getPageType();

  if (pageType === "home") {
    const footer = document.createElement("div");
    footer.id = "lesstube-footer";
    footer.innerHTML = `
        <p style="text-align: center; color: #606060; font-size: 13px;">
            This page has been modified by <a href="https://github.com/ranefaunder/lesstube" target="_blank" style="color: inherit;">LessTube</a> browser extension.<br>
            Not affiliated with YouTube or Google. Made by <a href="https://bsky.app/profile/faunder.fi" target="_blank" style="color: inherit;">Faunder</a>.
        </p>
    `;

    // Try multiple possible containers for footer placement
    const container =
      document.getElementById("container") ||
      document.querySelector("ytd-app") ||
      document.body;
    container.appendChild(footer);
  }
}

let initTimeout = null;

function initializePage() {
  if (initTimeout) clearTimeout(initTimeout);
  initTimeout = setTimeout(() => {
    if (handleRedirects()) return;
    setPageType();
    setTimeout(addHomePageFooter, 200);
  }, 50);
}

// Initial load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage);
} else {
  initializePage();
}

// YouTube SPA navigation event — fires when YouTube navigates between pages
window.addEventListener("yt-navigate-finish", () => {
  console.log("LessTube: SPA navigation detected (yt-navigate-finish)");
  initializePage();
});

// Fallback: Lightweight title mutation observer for URL changes
let lastUrl = location.href;
const titleObserver = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    console.log("LessTube: URL change detected via title mutation");
    initializePage();
  }
});

function observeTitle() {
  const titleEl = document.querySelector("title");
  if (titleEl) {
    titleObserver.observe(titleEl, { childList: true });
  } else {
    setTimeout(observeTitle, 100);
  }
}
observeTitle();

window.addEventListener("popstate", () => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    console.log("LessTube: URL change detected via popstate");
    initializePage();
  }
});
