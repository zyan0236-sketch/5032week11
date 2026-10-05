<template>
  <div class="main-container">
    <header v-if="showHeader">
      <BHeader />
    </header>
    <main class="main-box">
      <router-view></router-view>
    </main>
  </div>
</template>


<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import BHeader from './components/BHeader.vue';


// Note: CountBookAPI is registered as a route component via vue-router,
// so it doesn't need to be imported here unless used directly in the template.


const route = useRoute();


// Computed property replacing the old computed option
const showHeader = computed(() => {
  return route.name !== 'CountBookAPI';
});
</script>

<style scoped>
/* header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
} */
</style>
<style>
.container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 80vw;
  margin: 0 auto;
  padding: 20px;
  border-radius: 10px;
}
</style>