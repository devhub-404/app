// Browser authentication dependencies are lazy so non-auth surfaces do not pay
// their cost. Entry surfaces may preload the capability before user interaction.
let opaqueModule: Promise<typeof import('@serenity-kit/opaque')> | undefined;
let webAuthnModule: Promise<typeof import('@simplewebauthn/browser')> | undefined;

export function loadOpaque() {
  return (opaqueModule ??= import('@serenity-kit/opaque'));
}

export function loadWebAuthn() {
  return (webAuthnModule ??= import('@simplewebauthn/browser'));
}

export function preloadPasswordAuthentication() {
  void loadOpaque();
}

export function preloadPasskeyAuthentication() {
  void loadWebAuthn();
}
