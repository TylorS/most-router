import assert from 'power-assert';

import {createRouter} from '../lib/index';
import {hashHistory} from 'most-history';

const initlocation = window.location.pathname;

describe('Router', () => {
  beforeEach(() => {
    const {push} = hashHistory();
    push(initlocation);
  })

  describe ('createRouter', () => {
    it('should return a Router instance', () => {
      const {push, stream} = hashHistory();
      const router = createRouter(stream);

      assert(typeof router.path === 'function');
      assert(typeof router.define === 'function');
    })
  })

  describe('path', () => {
    it('should return a Router instance', () => {
      const {push, stream} = hashHistory();
      const router = createRouter(stream).path('/random/path');

      assert(typeof router.path === 'function');
      assert(typeof router.define === 'function');
    })

    it('should filter pathnames', (done) => {
      const {push, stream} = hashHistory();
      const router = createRouter(stream);

      router.path('/other').history$.observe(done);

      router.path('/correct').history$.observe(() => done())

      setTimeout(() => push('/some/path'))
      setTimeout(() => push('/correct'));
    })
  })

  describe('define', () => {

    it('should return a stream with an object containg path, value and location', (done) => {
      const {push, stream} = hashHistory();
      const history$ = stream.filter(x => x.action === 'PUSH')

      const routes = {
        '/correct': 123,
        '/wrong': 456,
      }

      createRouter(history$)
        .define(routes)
        .observe(x => {
          assert(x.path === '/correct')
          assert(x.value === 123)
          assert(typeof x.location === 'object')
          done();
        });

      setTimeout(() => push('/correct'));
    })

    it('should respect filtering by path()', (done) => {
      const {push, stream} = hashHistory();

      // skip initial path
      const history$ = stream.filter(x => x.action === 'PUSH')

      const routes = {
        '/path': 123,
        '*': () => done(new Error('This should not get matched'))
      }

      createRouter(history$)
        .path('/some')
        .path('/really')
        .path('/deep')
        .define(routes)
        .observe(x => {
          assert(x.path === '/path')
          assert(x.value === 123)
          assert(x.location.pathname === '/some/really/deep/path')
          done()
        });

      setTimeout(() => push('/some/really/deep/path'));
    })
  })
})
