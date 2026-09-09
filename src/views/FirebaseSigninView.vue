<template>
  <div class="login-container">
    <h1>Sign in</h1>

    <form @submit.prevent="signin">
    <p>
      <input
        v-model="email"
        type="email"
        required
        aria-label="Email"
        autocomplete="username"
        placeholder="Email"
      />
    </p>

    <p>
      <input
        v-model="password"
        type="password"
        required
        aria-label="Password"
        autocomplete="current-password"
        placeholder="Password"
      />
    </p>

    <p>
      <button type="submit" :disabled="busy">{{ busy ? 'Signing in...' : 'Sign in via Firebase' }}</button>
    </p>
    <p v-if="errorMessage" class="text-danger" role="alert">{{ errorMessage }}</p>
    </form>
    <p><router-link to="/FireRegister">Create a Firebase account</router-link></p>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "vue-router"
import { dashboardPath } from '@/stores/auth'

const email = ref("")
const password = ref("")
const errorMessage = ref("")
const busy = ref(false)
const router = useRouter()
const auth = getAuth()

const signin = () => {
  busy.value = true
  errorMessage.value = ""
  signInWithEmailAndPassword(auth, email.value.trim(), password.value)
    .then(({ user }) => {
      console.log("Firebase Login Successful!")
      console.log(auth.currentUser)
      password.value = ""
      return router.replace(dashboardPath(user))
    })
    .catch((error) => {
      console.log(error.code)
      errorMessage.value = `Sign in failed (${error.code}). Please check your email and password.`
    })
    .finally(() => { busy.value = false })
}
</script>

<style scoped>
.login-container {
  width: 400px;
  max-width: calc(100% - 40px);
  margin: 50px auto;
  text-align: center;
}

.login-container input {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.login-container button {
  padding: 10px 20px;
  cursor: pointer;
}
</style>
