
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { invoke } from "@tauri-apps/api/core";

const listings = ref<any[]>([]);
const loading = ref(true);
const errorMsg = ref("");

async function getListings() {
  loading.value = true;
  errorMsg.value = "";
  try {
    const rawListings = await invoke("get_listings", { ordering: "" });
    if (Array.isArray(rawListings)) {
      listings.value = rawListings;
    } else {
      listings.value = [];
      errorMsg.value = "Unexpected data format from server.";
    }
  } catch (error) {
    listings.value = [];
    errorMsg.value = "Failed to fetch listings.";
  } finally {
    loading.value = false;
  }
}

onMounted(getListings);

</script>

<template>
  <main class="container">
    <!-- Hero Section -->
    <section class="hero">
      <h1>GearXChange</h1>
      <p class="subtitle">Buy, sell, or rent heavy machinery with ease.</p>
      <button class="cta" @click="getListings">Browse Latest Listings</button>
    </section>

    <!-- Featured Listings -->
    <section class="featured-listings">
      <h2>Featured Machinery</h2>
      <div v-if="loading" class="loading">Loading listings...</div>
      <div v-else-if="errorMsg" class="error">{{ errorMsg }}</div>
      <div v-else>
        <div v-if="listings.length > 0">
          <ul class="listing-grid">
            <li v-for="listing in listings.slice(0,9)" :key="listing.id" class="listing-card">
              <h3>{{ listing.title }}</h3>
              <p class="price">Price: <span>{{ listing.price || 'N/A' }}</span></p>
              <p>Condition: <span>{{ listing.condition }}</span></p>
              <p>Location: <span>{{ listing.location }}</span></p>
              <p v-if="listing.description" class="desc">{{ listing.description }}</p>
            </li>
          </ul>
        </div>
        <p v-else>No listings available. Be the first to add your machine!</p>
      </div>
    </section>
  </main>
</template>