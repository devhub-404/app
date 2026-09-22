import { navigate } from "astro:transitions/client";
import { resetRouteScope } from "@/shared/runtime/route-scope";
import { ensureNotificationsRuntime } from "@/features/account/public/notifications-runtime";
import { initializeSessionScope } from "@/app/session/session-scope";

let started = false;

type StaticSearchSection = HTMLElement & {
  dataset: DOMStringMap & { ready?: string };
};

function isActiveShellRoute(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function syncPersistentShellNavigation() {
  const pathname = window.location.pathname;
  for (const link of document.querySelectorAll<HTMLElement>(
    "[data-shell-nav-link]",
  )) {
    const href = link.dataset["shellNavHref"];
    if (!href) continue;
    const active = isActiveShellRoute(pathname, href);
    link.dataset["active"] = active ? "true" : "false";
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
}

function initStaticSearch(section: StaticSearchSection) {
  if (section.dataset.ready === "true") return;

  const query = section.querySelector<HTMLInputElement>(
    "[data-static-content-query]",
  );
  const clear = section.querySelector<HTMLButtonElement>(
    "[data-static-content-clear]",
  );
  const result = section.querySelector<HTMLElement>(
    "[data-static-content-result]",
  );
  if (!query || !clear || !result) return;

  section.dataset.ready = "true";
  query.value = new URLSearchParams(window.location.search).get("q") ?? "";

  const applySearchNavigation = () => {
    const normalized = query.value.trim();
    const url = new URL(window.location.href);
    if (normalized) url.searchParams.set("q", normalized);
    else url.searchParams.delete("q");
    url.searchParams.delete("page");
    void navigate(`${url.pathname}${url.search}${url.hash}`);
  };

  section.querySelector("form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    applySearchNavigation();
  });
  clear.addEventListener("click", () => {
    query.value = "";
    applySearchNavigation();
  });
  clear.hidden = !query.value;
  result.textContent = "";
}

function initPageRuntime() {
  syncPersistentShellNavigation();
  for (const section of document.querySelectorAll<StaticSearchSection>(
    "[data-static-content-search]",
  )) {
    initStaticSearch(section);
  }
}

function initializeDocumentSessionScope() {
  const root = document.querySelector<HTMLElement>("[data-session-scope]");
  if (!root) return;
  const resolution = root.dataset["sessionResolution"];
  if (
    resolution !== "authenticated" &&
    resolution !== "unauthenticated" &&
    resolution !== "unavailable" &&
    resolution !== "deferred"
  ) {
    return;
  }
  initializeSessionScope(resolution, root.dataset["sessionAccountId"] ?? null);
}

/**
 * Starts document-level behavior that must survive Astro ClientRouter swaps.
 * The runtime is deliberately idempotent because module scripts may be seen
 * again while navigating between layouts.
 */
export function startBrowserRuntime() {
  if (started) return;
  started = true;

  resetRouteScope();
  initializeDocumentSessionScope();
  ensureNotificationsRuntime();
  document.addEventListener("astro:before-preparation", resetRouteScope);
  document.addEventListener("astro:page-load", initPageRuntime);
  initPageRuntime();
}
