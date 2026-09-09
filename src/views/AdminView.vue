<script setup>
import FirebaseAccount from '@/components/FirebaseAccount.vue'
import { submittedCards } from '@/stores/registrations'
</script>

<template>
  <div class="container my-4">
    <h1 class="text-center">Admin Dashboard</h1>
    <FirebaseAccount id="account" />
    <section class="card shadow-sm" aria-labelledby="records-heading">
      <div class="card-body">
        <h2 id="records-heading" class="h4">Registration Records</h2>
        <p class="text-muted">
          Read-only records submitted through the Library Registration Form in this tab. Records are
          cleared when the page is refreshed.
        </p>
        <p>
          Total registrations: <strong>{{ submittedCards.length }}</strong>
        </p>
        <p v-if="!submittedCards.length" class="mb-0">No registration records yet.</p>
        <div v-else class="table-responsive">
          <table class="table table-striped table-bordered align-middle mb-0">
            <caption>
              Library registration records
            </caption>
            <thead>
              <tr>
                <th scope="col">Username</th>
                <th scope="col">Australian Resident</th>
                <th scope="col">Gender</th>
                <th scope="col">Reason for joining</th>
                <th scope="col">Suburb</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in submittedCards" :key="index">
                <td class="text-break">{{ record.username }}</td>
                <td>{{ record.isAustralian ? 'Yes' : 'No' }}</td>
                <td>{{ record.gender || '—' }}</td>
                <td class="text-break">{{ record.reason || '—' }}</td>
                <td class="text-break">{{ record.suburb || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>
