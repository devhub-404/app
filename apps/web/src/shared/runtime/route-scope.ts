export type RouteScope = {
  revision: number;
  signal: AbortSignal;
};

let revision = 0;
let controller: AbortController | undefined;

function getController(): AbortController {
  controller ??= new AbortController();
  return controller;
}

export function resetRouteScope(): RouteScope {
  getController().abort();
  controller = new AbortController();
  revision += 1;
  return getRouteScope();
}

export function getRouteScope(): RouteScope {
  return { revision, signal: getController().signal };
}

export function isCurrentRouteScope(scope: Pick<RouteScope, 'revision'>): boolean {
  return scope.revision === revision && !getController().signal.aborted;
}
