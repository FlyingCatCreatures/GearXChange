
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

onMounted(() => {
  setTimeout(getListings, 100);
});
</script>

<template>
  <main>
    <!-- Hero Section -->
    <section class="hero min-h-[40vh] bg-base-300 w-full">
      <div class="hero-content flex-col text-center">
        <div>
          <h1 class="text-5xl font-bold mb-4">GearXChange</h1>
          <p class="py-2 text-lg mb-6">Buy, sell, or rent heavy machinery with ease.</p>
          <button class="btn btn-primary btn-lg" @click="getListings">
            Browse Latest Listings
          </button>
        </div>
      </div>
    </section>

    <!-- Featured Listings -->
    <section class="featured-listings py-8 bg-base-200">
      <h2 class="text-3xl font-bold mb-6 text-center">Featured Machinery</h2>
      <div v-if="loading" class="flex justify-center items-center min-h-[120px]">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else-if="errorMsg" class="alert alert-error w-fit mx-auto">{{ errorMsg }}</div>
      <div v-else>
        <div v-if="listings.length > 0">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 md:px-8">
            <div v-for="listing in listings.slice(0,9)" :key="listing.id" class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h3 class="card-title">{{ listing.title }}</h3>
                <p class="text-lg font-semibold">Price: <span>{{ listing.price || 'N/A' }}</span></p>
                <p>Condition: <span>{{ listing.condition }}</span></p>
                <p>Location: <span>{{ listing.location }}</span></p>
                <p v-if="listing.description" class="text-sm opacity-80 mt-2">{{ listing.description }}</p>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-center text-lg mt-8">No listings available. Be the first to add your machine!</p>
      </div>
    </section>
  </main>
</template>