import { computed, shallowRef } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

export const currentUser = shallowRef(null)

// Course demonstration: retain the existing email-based role rule.
export const getRole = (user) => {
  if (!user) return ''
  return user.email?.toLowerCase() === 'admin@gmail.com' ? 'Admin' : 'User'
}

export const role = computed(() => getRole(currentUser.value))
export const dashboardPath = (user) => (getRole(user) === 'Admin' ? '/admin' : '/member')

export async function waitForAuth() {
  const auth = getAuth()
  await auth.authStateReady()
  currentUser.value = auth.currentUser
  return auth.currentUser
}

export function observeAuth(router) {
  return onAuthStateChanged(getAuth(), (user) => {
    currentUser.value = user
    const requiredRole = router.currentRoute.value.meta.role
    if (requiredRole && getRole(user) !== requiredRole) {
      router.replace(user ? dashboardPath(user) : '/FireLogin')
    }
  })
}
