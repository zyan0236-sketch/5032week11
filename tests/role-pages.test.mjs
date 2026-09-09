/* eslint-env node */
// Run: node --experimental-vm-modules --test tests/role-pages.test.mjs
// Exercise the real Vue components and router with an in-memory Firebase Auth double.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { SourceTextModule, SyntheticModule } from 'node:vm'
import { test } from 'node:test'
import * as vue from 'vue'
import * as vueRouter from 'vue-router'
import { renderToString } from '@vue/server-renderer'
import PrimeVue from 'primevue/config'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'

const admin = { email: 'admin@gmail.com' }
const member = { email: 'member@example.com' }

async function fixture(initialUser = null) {
  const listeners = new Set()
  const auth = { currentUser: initialUser, authStateReady: async () => {} }
  let logoutError = false
  const setUser = (user) => {
    auth.currentUser = user
    listeners.forEach((listener) => listener(user))
  }
  const firebase = {
    getAuth: () => auth,
    onAuthStateChanged: (_, listener) => {
      listeners.add(listener)
      listener(auth.currentUser)
      return () => listeners.delete(listener)
    },
    signOut: async () => {
      if (logoutError) throw { code: 'auth/network-request-failed' }
      setUser(null)
    },
    signInWithEmailAndPassword: async (_, email) => {
      const user = { email }
      setUser(user)
      return { user }
    },
    createUserWithEmailAndPassword: async (_, email) => {
      const user = { email }
      setUser(user)
      return { user }
    }
  }
  const cache = new Map()
  async function load(specifier, parent = path.resolve('src/entry.js')) {
    let id = specifier
    if (specifier.startsWith('@/')) id = path.resolve('src', specifier.slice(2))
    else if (specifier.startsWith('.')) id = path.resolve(path.dirname(parent), specifier)
    if (path.isAbsolute(id) && !path.extname(id)) id += '.js'
    if (cache.has(id)) return cache.get(id)
    const pending = (async () => {
      let module
      if (!path.isAbsolute(id)) {
        const exports =
          id === 'firebase/auth'
            ? firebase
            : id === 'vue'
              ? vue
              : id === 'vue-router'
                ? { ...vueRouter, createWebHistory: vueRouter.createMemoryHistory }
                : await import(id)
        module = new SyntheticModule(
          Object.keys(exports),
          function () {
            Object.entries(exports).forEach(([key, value]) => this.setExport(key, value))
          },
          { identifier: id }
        )
      } else {
        let source = await readFile(id, 'utf8')
        if (id.endsWith('.vue')) {
          const { descriptor } = parse(source, { filename: id })
          const script = compileScript(descriptor, { id, genDefaultAs: 'component' })
          const template = compileTemplate({
            source: descriptor.template.content,
            filename: id,
            id,
            compilerOptions: { bindingMetadata: script.bindings }
          })
          assert.deepEqual(template.errors, [])
          source = `${script.content}\n${template.code}\ncomponent.render = render; export default component;`
        }
        module = new SourceTextModule(source, { identifier: id })
      }
      return module
    })()
    cache.set(id, pending)
    return pending
  }
  async function get(specifier) {
    const module = await load(specifier)
    if (module.status === 'unlinked')
      await module.link((name, parent) => load(name, parent.identifier))
    if (module.status === 'linked') await module.evaluate()
    return module.namespace
  }
  const router = (await get('@/router/index.js')).default
  const store = await get('@/stores/auth.js')
  store.observeAuth(router)
  const settle = async () => {
    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => setImmediate(resolve))
      await vue.nextTick()
    }
  }
  const setup = async (name, props = {}) => {
    const component = (await get(name)).default
    const app = vue.createSSRApp(component)
    app.provide(vueRouter.routerKey, router)
    return app.runWithContext(() => component.setup(props, { expose() {} }))
  }
  const html = async (name) => {
    const component = (await get(name)).default
    const app = vue.createSSRApp(component)
    app.use(router)
    app.use(PrimeVue)
    return renderToString(app)
  }
  return {
    auth,
    router,
    store,
    get,
    setUser,
    setup,
    html,
    settle,
    failLogout: () => {
      logoutError = true
    }
  }
}

test('direct entry and navigation enforce the complete role matrix', async () => {
  for (const user of [null, admin, member]) {
    for (const target of ['/admin', '/member', '/', '/about', '/FireLogin', '/FireRegister']) {
      const f = await fixture(user)
      await f.router.push(target)
      const dashboard = user === admin ? '/admin' : '/member'
      const expected =
        target === '/' || target === '/about'
          ? target
          : !user
            ? target === '/admin' || target === '/member'
              ? '/FireLogin'
              : target
            : dashboard
      assert.equal(f.router.currentRoute.value.path, expected)
    }
  }
})

test('initial navigation waits for persisted authentication to restore', async () => {
  const f = await fixture()
  let restore
  f.auth.authStateReady = () =>
    new Promise((resolve) => {
      restore = resolve
    })
  const navigation = f.router.push('/admin')
  await f.settle()
  assert.equal(f.router.currentRoute.value.matched.length, 0)
  f.setUser(admin)
  f.auth.authStateReady = async () => {}
  restore()
  await navigation
  assert.equal(f.router.currentRoute.value.path, '/admin')
})

test('Home form validates, submits and clears; Admin reads the same real records', async () => {
  const f = await fixture(admin)
  await f.router.push('/')
  const form = await f.setup('@/views/HomeView.vue')
  form.submitForm()
  assert.equal(form.submittedCards.value.length, 0)
  assert.ok(form.errors.value.username)
  Object.assign(form.formData.value, {
    username: 'Library Reader',
    password: 'Reader!234',
    confirmPassword: 'Reader!234',
    gender: 'other',
    isAustralian: true,
    reason: 'Borrow books'
  })
  form.validateConfirmPassword()
  form.submitForm()
  assert.equal(form.submittedCards.value.length, 1)
  assert.equal(form.formData.value.username, '')
  const home = await f.html('@/views/HomeView.vue')
  assert.match(home, /W5\. Library Registration Form/)
  assert.match(home, /Library Reader/)
  assert.doesNotMatch(home, /Firebase Account|Logout|Role:/)
  await f.router.push('/admin')
  const dashboard = await f.html('@/views/AdminView.vue')
  assert.match(dashboard, /admin@gmail.com/)
  assert.match(dashboard, /Role: <strong>Admin/)
  assert.match(dashboard, /Library Reader/)
  assert.doesNotMatch(dashboard, /Reader!234/)
  await f.router.push('/')
  const returned = await f.setup('@/views/HomeView.vue')
  assert.equal(returned.submittedCards.value.length, 1)
  returned.formData.value.username = 'Clear me'
  returned.clearForm()
  assert.equal(returned.formData.value.username, '')
})

test('role-specific pages and navigation render the right links and account', async () => {
  for (const user of [null, admin, member]) {
    const f = await fixture(user)
    await f.router.push(user ? f.store.dashboardPath(user) : '/')
    const header = await f.html('@/components/BHeader.vue')
    assert.match(header, />Home</)
    assert.match(header, />About</)
    if (!user) {
      assert.match(header, /Firebase Register/)
      assert.match(header, /Firebase Login/)
      assert.doesNotMatch(header, /Dashboard|Logout/)
    } else {
      assert.match(header, user === admin ? /Admin Dashboard/ : /Member Dashboard/)
      assert.match(header, /Account/)
      assert.match(header, /Logout/)
      assert.doesNotMatch(header, /Firebase Register|Firebase Login/)
    }
    if (user === member) {
      const page = await f.html('@/views/MemberView.vue')
      assert.match(page, /member@example.com/)
      assert.match(page, /Role: <strong>User/)
      assert.match(page, /href="\/"[^>]*>Open Library Registration Form/)
      assert.doesNotMatch(page, /Registration Records/)
    }
    if (user === admin)
      assert.match(await f.html('@/views/AdminView.vue'), /No registration records yet/)
  }
})

test('sign-in and registration land on the authenticated role dashboard', async () => {
  for (const email of ['ADMIN@gmail.com', 'member@example.com']) {
    for (const [view, action] of [
      ['FirebaseSigninView', 'signin'],
      ['FirebaseRegisterView', 'register']
    ]) {
      const f = await fixture()
      await f.router.push('/FireLogin')
      const page = await f.setup(`@/views/${view}.vue`)
      page.email.value = ` ${email} `
      page.password.value = 'Test!234'
      page[action]()
      await f.settle()
      assert.equal(
        f.router.currentRoute.value.path,
        email.startsWith('ADMIN') ? '/admin' : '/member'
      )
      assert.equal(page.password.value, '')
      assert.equal(page.busy.value, false)
    }
  }
})

test('Logout from both dashboards and Home clears auth and blocks subsequent protected access', async () => {
  for (const user of [admin, member]) {
    for (const start of ['/', user === admin ? '/admin' : '/member']) {
      const f = await fixture(user)
      await f.router.push(start)
      const account = await f.setup('@/components/FirebaseAccount.vue')
      await account.logout()
      await f.settle()
      assert.equal(f.auth.currentUser, null)
      assert.equal(f.store.currentUser.value, null)
      assert.equal(f.router.currentRoute.value.path, '/FireLogin')
      assert.match(await f.html('@/components/BHeader.vue'), /Firebase Login/)
      await f.router.push(user === admin ? '/admin' : '/member')
      assert.equal(f.router.currentRoute.value.path, '/FireLogin')
    }
  }
})

test('failed Logout retains the session and shows a retry message', async () => {
  const f = await fixture(admin)
  await f.router.push('/admin')
  f.failLogout()
  const account = await f.setup('@/components/FirebaseAccount.vue')
  await account.logout()
  assert.equal(f.router.currentRoute.value.path, '/admin')
  assert.equal(f.auth.currentUser, admin)
  assert.equal(account.errorMessage.value, 'Logout failed. Please try again.')
  assert.equal(account.busy.value, false)
})

test('external sign-out or role changes immediately leave an incompatible page', async () => {
  const f = await fixture(admin)
  await f.router.push('/admin')
  f.setUser(member)
  await f.settle()
  assert.equal(f.router.currentRoute.value.path, '/member')
  f.setUser(null)
  await f.settle()
  assert.equal(f.router.currentRoute.value.path, '/FireLogin')
})
