import {Pathname} from './interfaces';

export function splitPath(path: Pathname): Pathname[] {
  return path.split('/').filter(p => p.length > 0);
}

export function filterPath(pathParts: Pathname[], namespace: Pathname[]): Pathname {
  return pathParts.filter(part => namespace.indexOf(part) < 0).join('/');
}

export function isStrictlyInScope(namespace: Pathname[], path: Pathname): boolean {
  const pathParts = splitPath(path);
  return namespace.every((v, i) => {
    return pathParts[i] === v;
  });
}

export function getFilteredPath(namespace: Pathname[], path: Pathname): Pathname {
  if (namespace.length === 0) return path;

  const pathParts = splitPath(path);
  return '/' + filterPath(pathParts, namespace);
}
