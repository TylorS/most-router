# most-router

A basic router made to be used in conjunction with [most-history](https://github.com/TylorS/most-history)
built on top of [switch-path](https://github.com/staltz/switch-path).

## Installing
```
$ npm install --save most-router
```

## Basic Usage

```js
import {history} from 'most-history'
import {createRouter} from 'most-router'

const {push, stream} = history()
const router = createRouter(stream);

const routes =
  {
    '/': renderHome,
    '/about': renderAbout,
    '*': renderNotFound
  }

const match$ = router.define(routes)

const view$ = match$
  .map(({path, value, location}) => {
    // path is the path matched in routes
    // value is the 'value' associated with the matched path
    // location is the location return from most-history

    return value(); // call the current render function
  })

view$.observe(render)
routes$.observe(push)
```


## Router Instance API

**path(pathname): Router**

Creates a new router that is namespaced by *pathname*, in other words it creates nested router instance.

**define(routes): Stream<{path, value, location}>**

Returns a stream of objects that contain the current matched *path* and the *value* associated with that path,
as well as the current location.

