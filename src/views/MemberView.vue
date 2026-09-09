<script setup>
import FirebaseAccount from '@/components/FirebaseAccount.vue'
</script>

<template>
  <div class="container my-4">
    <h1 class="text-center">Member Dashboard</h1>
    <FirebaseAccount id="account" />
    <section class="card shadow-sm text-center" aria-labelledby="registration-heading">
      <div class="card-body">
        <h2 id="registration-heading" class="h4">Library Registration</h2>
        <p>Complete the library registration form to register your interest in joining.</p>
        <router-link to="/" class="btn btn-primary">Open Library Registration Form</router-link>
      </div>
    </section>
  </div>
</template>
