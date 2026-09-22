import {
  notifySessionAvailable,
  notifySessionInvalidated,
} from "@/shared/api/private-client.api.ts";

export function notifyAppSessionAvailable() {
  notifySessionAvailable();
}

export function notifyAppSessionInvalidated(
  options: { broadcast?: boolean } = {},
) {
  notifySessionInvalidated(options);
}
