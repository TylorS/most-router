import {Stream} from 'most';
import switchPath from 'switch-path';
import {Location, Pathname, RouteDefinitions, DefineReturn} from './interfaces';
import {isStrictlyInScope, getFilteredPath, splitPath} from './util';

export function createRouter (history$: Stream<Location>) {
  return new Router(history$, []);
}

export class Router {
  constructor (public history$: Stream<Location>, public namespace: string[]) {}

  path(pathname: Pathname): Router {
    const scopedNamespace = this.namespace.concat(splitPath(pathname));

    const scopedHistory$ = this.history$
      .filter(({pathname: p}: Location) => isStrictlyInScope(scopedNamespace, p));

    return new Router(scopedHistory$, scopedNamespace);
  }

  define(routes: RouteDefinitions): Stream<DefineReturn> {
    const namespace = this.namespace;

    return this.history$
      .map((location: Location) => {
        const filteredPath = getFilteredPath(namespace, location.pathname);
        const {path, value} = switchPath(filteredPath, routes);
        return {path, value, location};
      });
  }
}
