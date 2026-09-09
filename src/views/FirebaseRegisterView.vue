<template>
  <div class="register-container">
    <h1>Create an Account</h1>

    <form @submit.prevent="register">
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
        minlength="6"
        aria-label="Password"
        autocomplete="new-password"
        placeholder="Password"
      />
    </p>

    <p>
      <button type="submit" :disabled="busy">{{ busy ? 'Registering...' : 'Save to Firebase' }}</button>
    </p>
    <p v-if="errorMessage" class="text-danger" role="alert">{{ errorMessage }}</p>
    </form>
    <p><router-link to="/FireLogin">Already registered? Sign in</router-link></p>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "vue-router"
import { dashboardPath } from '@/stores/auth'

const email = ref("")
const password = ref("")
const errorMessage = ref("")
const busy = ref(false)
const router = useRouter()
const auth = getAuth()

const register = () => {
  busy.value = true
  errorMessage.value = ""
  createUserWithEmailAndPassword(auth, email.value.trim(), password.value)
    .then(({ user }) => {
      console.log("Firebase Register Successful!")
      password.value = ""
      return router.replace(dashboardPath(user))
    })
    .catch((error) => {
      console.log(error.code)
      errorMessage.value = `Registration failed (${error.code}). Please check your details or sign in if already registered.`
    })
    .finally(() => { busy.value = false })
}
</script>

<style scoped>
.register-container {
  width: 400px;
  max-width: calc(100% - 40px);
  margin: 50px auto;
  text-align: center;
}

.register-container input {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.register-container button {
  padding: 10px 20px;
  cursor: pointer;
}
</style>
