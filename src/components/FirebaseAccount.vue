<script setup>
import { ref } from 'vue'
import { getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { currentUser as user, role } from '@/stores/auth'

defineProps({ compact: Boolean })

const auth = getAuth()
const router = useRouter()
const errorMessage = ref('')
const busy = ref(false)

const logout = async () => {
  busy.value = true
  errorMessage.value = ''
  try {
    console.log('Before Logout - auth.currentUser:', auth.currentUser)
    await signOut(auth)
    console.log('After Logout - auth.currentUser:', auth.currentUser)
    user.value = auth.currentUser
    await router.replace('/FireLogin')
  } catch (error) {
    console.error(error.code)
    errorMessage.value = 'Logout failed. Please try again.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section :class="compact ? 'd-flex flex-wrap align-items-center gap-2' : 'firebase-account text-center'" aria-label="Firebase account">
    <template v-if="user">
      <template v-if="!compact">
        <h2>Firebase Account</h2>
        <p class="text-break">Current Firebase user: <strong>{{ user.email }}</strong></p>
        <p>Role: <strong>{{ role }}</strong></p>
      </template>
      <button :class="compact ? 'btn btn-outline-primary' : 'btn btn-primary'" :disabled="busy" @click="logout">
        {{ busy ? 'Logging out...' : 'Logout' }}
      </button>
      <p v-if="errorMessage" class="text-danger mt-2" role="alert">{{ errorMessage }}</p>
    </template>
    <p v-else><router-link to="/FireLogin">Sign in via Firebase to view your email and role.</router-link></p>
  </section>
</template>

<style scoped>
.firebase-account {
  max-width: 600px;
  margin: 30px auto;
  padding: 0 20px;
}
</style>
