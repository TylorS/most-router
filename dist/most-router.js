(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mostRouter = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./router'));


},{"./router":2}],2:[function(require,module,exports){
"use strict";

var switch_path_1 = require('switch-path');
var util_1 = require('./util');
function createRouter(history$) {
    return new Router(history$, []);
}
exports.createRouter = createRouter;
var Router = function () {
    function Router(history$, namespace) {
        this.history$ = history$;
        this.namespace = namespace;
    }
    Router.prototype.path = function (pathname) {
        var scopedNamespace = this.namespace.concat(util_1.splitPath(pathname));
        var scopedHistory$ = this.history$.filter(function (_a) {
            var p = _a.pathname;
            return util_1.isStrictlyInScope(scopedNamespace, p);
        });
        return new Router(scopedHistory$, scopedNamespace);
    };
    Router.prototype.define = function (routes) {
        var namespace = this.namespace;
        return this.history$.map(function (location) {
            var filteredPath = util_1.getFilteredPath(namespace, location.pathname);
            var _a = switch_path_1.default(filteredPath, routes),
                path = _a.path,
                value = _a.value;
            return { path: path, value: value, location: location };
        });
    };
    return Router;
}();
exports.Router = Router;


},{"./util":3,"switch-path":4}],3:[function(require,module,exports){
"use strict";

function splitPath(path) {
    return path.split('/').filter(function (p) {
        return p.length > 0;
    });
}
exports.splitPath = splitPath;
function filterPath(pathParts, namespace) {
    return pathParts.filter(function (part) {
        return namespace.indexOf(part) < 0;
    }).join('/');
}
exports.filterPath = filterPath;
function isStrictlyInScope(namespace, path) {
    var pathParts = splitPath(path);
    return namespace.every(function (v, i) {
        return pathParts[i] === v;
    });
}
exports.isStrictlyInScope = isStrictlyInScope;
function getFilteredPath(namespace, path) {
    if (namespace.length === 0) return path;
    var pathParts = splitPath(path);
    return '/' + filterPath(pathParts, namespace);
}
exports.getFilteredPath = getFilteredPath;


},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require('./util');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function switchPathInputGuard(path, routes) {
  if (!(0, _util.isPattern)(path)) {
    throw new Error('First parameter to switchPath must be a route path.');
  }
  if (!(0, _util.isRouteDefinition)(routes)) {
    throw new Error('Second parameter to switchPath must be an object ' + 'containing route patterns.');
  }
}

function betterMatch(candidate, reference) {
  if (!(0, _util.isNotNull)(candidate)) {
    return false;
  }
  if (!(0, _util.isNotNull)(reference)) {
    return true;
  }
  return candidate.length >= reference.length;
}

function matchesWithParams(sourcePath, pattern) {
  var sourceParts = (0, _util.splitPath)(sourcePath);
  var patternParts = (0, _util.splitPath)(pattern);

  var params = patternParts.map(function (part, i) {
    return (0, _util.isParam)(part) ? sourceParts[i] : null;
  }).filter(_util.isNotNull);

  var matched = patternParts.every(function (part, i) {
    return (0, _util.isParam)(part) || part === sourceParts[i];
  });

  return matched ? params : [];
}

function getParamFnValue(paramFn, params) {
  var _paramFn = (0, _util.isRouteDefinition)(paramFn) ? paramFn['/'] : paramFn;
  return typeof _paramFn === 'function' ? _paramFn.apply(undefined, _toConsumableArray(params)) : _paramFn;
}

function validatePath(sourcePath, matchedPath) {
  var sourceParts = (0, _util.splitPath)(sourcePath);
  var matchedParts = (0, _util.splitPath)(matchedPath);

  for (var i = 0; i < matchedParts.length; ++i) {
    if (matchedParts[i] !== sourceParts[i]) {
      return null;
    }
  }

  return '/' + (0, _util.extractPartial)(sourcePath, matchedPath);
}

function validate(_ref) {
  var sourcePath = _ref.sourcePath;
  var matchedPath = _ref.matchedPath;
  var matchedValue = _ref.matchedValue;
  var routes = _ref.routes;

  var path = matchedPath ? validatePath(sourcePath, matchedPath) : null;
  var value = matchedValue;
  if (!path) {
    path = routes['*'] ? sourcePath : null;
    value = path ? routes['*'] : null;
  }
  return { path: path, value: value };
}

function switchPath(sourcePath, routes) {
  switchPathInputGuard(sourcePath, routes);
  var matchedPath = null;
  var matchedValue = null;

  (0, _util.traverseRoutes)(routes, function matchPattern(pattern) {
    if (sourcePath.search(pattern) === 0 && betterMatch(pattern, matchedPath)) {
      matchedPath = pattern;
      matchedValue = routes[pattern];
    }

    var params = matchesWithParams(sourcePath, pattern).filter(Boolean);

    if (params.length > 0 && betterMatch(sourcePath, matchedPath)) {
      matchedPath = (0, _util.extractPartial)(sourcePath, pattern);
      matchedValue = getParamFnValue(routes[pattern], params);
    }

    if ((0, _util.isRouteDefinition)(routes[pattern]) && params.length === 0) {
      if (sourcePath !== '/') {
        var child = switchPath((0, _util.unprefixed)(sourcePath, pattern) || '/', routes[pattern]);
        var nestedPath = pattern + child.path;
        if (!child.path !== null && betterMatch(nestedPath, matchedPath)) {
          matchedPath = nestedPath;
          matchedValue = child.value;
        }
      }
    }
  });

  return validate({ sourcePath: sourcePath, matchedPath: matchedPath, matchedValue: matchedValue, routes: routes });
}

exports.default = switchPath;
},{"./util":5}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isPattern = isPattern;
exports.isRouteDefinition = isRouteDefinition;
exports.traverseRoutes = traverseRoutes;
exports.isNotNull = isNotNull;
exports.splitPath = splitPath;
exports.isParam = isParam;
exports.extractPartial = extractPartial;
exports.unprefixed = unprefixed;
function isPattern(candidate) {
  return typeof candidate === "string" && (candidate.charAt(0) === "/" || candidate === "*");
}

function isRouteDefinition(candidate) {
  return !candidate || typeof candidate !== "object" ? false : isPattern(Object.keys(candidate)[0]);
}

function traverseRoutes(routes, callback) {
  var keys = Object.keys(routes);
  for (var i = 0; i < keys.length; ++i) {
    var pattern = keys[i];
    if (pattern === "*") {
      continue;
    }
    callback(pattern);
  }
}

function isNotNull(candidate) {
  return candidate !== null;
}

function splitPath(path) {
  return path.split("/").filter(function (s) {
    return !!s;
  });
}

function isParam(candidate) {
  return candidate.match(/:\w+/) !== null;
}

function extractPartial(sourcePath, pattern) {
  var patternParts = splitPath(pattern);
  var sourceParts = splitPath(sourcePath);

  var matchedParts = [];

  for (var i = 0; i < patternParts.length; ++i) {
    matchedParts.push(sourceParts[i]);
  }

  return matchedParts.filter(isNotNull).join("/");
}

function unprefixed(fullString, prefix) {
  return fullString.split(prefix)[1];
}
},{}]},{},[1])(1)
});