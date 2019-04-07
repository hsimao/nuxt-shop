import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'

const _0c3b3940 = () => interopDefault(import('../pages/cart.vue' /* webpackChunkName: "pages/cart" */))
const _8284f734 = () => interopDefault(import('../pages/checkout.vue' /* webpackChunkName: "pages/checkout" */))
const _0a9f9af9 = () => interopDefault(import('../pages/login.vue' /* webpackChunkName: "pages/login" */))
const _d4a49d90 = () => interopDefault(import('../pages/signup.vue' /* webpackChunkName: "pages/signup" */))
const _044d7847 = () => interopDefault(import('../pages/user-profile.vue' /* webpackChunkName: "pages/user-profile" */))
const _54ef6092 = () => interopDefault(import('../pages/user-pwd-change.vue' /* webpackChunkName: "pages/user-pwd-change" */))
const _d4a60db4 = () => interopDefault(import('../pages/admin/administrators.vue' /* webpackChunkName: "pages/admin/administrators" */))
const _7d0025b6 = () => interopDefault(import('../pages/admin/customers.vue' /* webpackChunkName: "pages/admin/customers" */))
const _56026d9a = () => interopDefault(import('../pages/admin/product-categories.vue' /* webpackChunkName: "pages/admin/product-categories" */))
const _4fc2d9f0 = () => interopDefault(import('../pages/admin/product-edit.vue' /* webpackChunkName: "pages/admin/product-edit" */))
const _6e5328c8 = () => interopDefault(import('../pages/admin/product-list.vue' /* webpackChunkName: "pages/admin/product-list" */))
const _3cb22f34 = () => interopDefault(import('../pages/admin/user-groups.vue' /* webpackChunkName: "pages/admin/user-groups" */))
const _3c94d225 = () => interopDefault(import('../pages/product/_slug/_id.vue' /* webpackChunkName: "pages/product/_slug/_id" */))
const _40f7f7e2 = () => interopDefault(import('../pages/index.vue' /* webpackChunkName: "pages/index" */))

Vue.use(Router)

if (process.client) {
  window.history.scrollRestoration = 'manual'
}
const scrollBehavior = function (to, from, savedPosition) {
  // if the returned position is falsy or an empty object,
  // will retain current scroll position.
  let position = false

  // if no children detected
  if (to.matched.length < 2) {
    // scroll to the top of the page
    position = { x: 0, y: 0 }
  } else if (to.matched.some(r => r.components.default.options.scrollToTop)) {
    // if one of the children has scrollToTop option set to true
    position = { x: 0, y: 0 }
  }

  // savedPosition is only available for popstate navigations (back button)
  if (savedPosition) {
    position = savedPosition
  }

  return new Promise((resolve) => {
    // wait for the out transition to complete (if necessary)
    window.$nuxt.$once('triggerScroll', () => {
      // coords will be used if no selector is provided,
      // or if the selector didn't match any element.
      if (to.hash) {
        let hash = to.hash
        // CSS.escape() is not supported with IE and Edge.
        if (typeof window.CSS !== 'undefined' && typeof window.CSS.escape !== 'undefined') {
          hash = '#' + window.CSS.escape(hash.substr(1))
        }
        try {
          if (document.querySelector(hash)) {
            // scroll to anchor by returning the selector
            position = { selector: hash }
          }
        } catch (e) {
          console.warn('Failed to save scroll position. Please add CSS.escape() polyfill (https://github.com/mathiasbynens/CSS.escape).')
        }
      }
      resolve(position)
    })
  })
}

export function createRouter() {
  return new Router({
    mode: 'history',
    base: '/',
    linkActiveClass: 'nuxt-link-active',
    linkExactActiveClass: 'nuxt-link-exact-active',
    scrollBehavior,

    routes: [{
      path: "/cart",
      component: _0c3b3940,
      name: "cart"
    }, {
      path: "/checkout",
      component: _8284f734,
      name: "checkout"
    }, {
      path: "/login",
      component: _0a9f9af9,
      name: "login"
    }, {
      path: "/signup",
      component: _d4a49d90,
      name: "signup"
    }, {
      path: "/user-profile",
      component: _044d7847,
      name: "user-profile"
    }, {
      path: "/user-pwd-change",
      component: _54ef6092,
      name: "user-pwd-change"
    }, {
      path: "/admin/administrators",
      component: _d4a60db4,
      name: "admin-administrators"
    }, {
      path: "/admin/customers",
      component: _7d0025b6,
      name: "admin-customers"
    }, {
      path: "/admin/product-categories",
      component: _56026d9a,
      name: "admin-product-categories"
    }, {
      path: "/admin/product-edit",
      component: _4fc2d9f0,
      name: "admin-product-edit"
    }, {
      path: "/admin/product-list",
      component: _6e5328c8,
      name: "admin-product-list"
    }, {
      path: "/admin/user-groups",
      component: _3cb22f34,
      name: "admin-user-groups"
    }, {
      path: "/product/:slug?/:id?",
      component: _3c94d225,
      name: "product-slug-id"
    }, {
      path: "/",
      component: _40f7f7e2,
      name: "index"
    }],

    fallback: false
  })
}
