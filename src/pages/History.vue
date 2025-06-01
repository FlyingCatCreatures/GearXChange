<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { invoke } from "@tauri-apps/api/core";

const visitedListings = ref<any[]>([]);
const errorMessage = ref("");

async function fetchVisitedListings() {
  try {
    const listings = await invoke("get_visited_listings");
    if (Array.isArray(listings)) {
      visitedListings.value = listings;
    } else {
      errorMessage.value = "Unexpected data format received.";
    }
  } catch (error) {
    console.error("Failed to fetch visited listings:", error);
    errorMessage.value = "Failed to load visited listings. Please try again later.";
  }
}
onMounted(fetchVisitedListings);

</script>

<template>
  <div class="history-page">
    <h1>Your Visited Listings</h1>
    <div v-if="errorMessage">
      <p class="error">{{ errorMessage }}</p>
    </div>
    <div v-else>
      <div v-if="visitedListings.length > 0">
        <ul class="listings">
          <li v-for="listing in visitedListings" :key="listing.id" class="listing-item">
            <h3>{{ listing.title }}</h3>
            <p>Price: {{ listing.price || "N/A" }}</p>
            <p>Condition: {{ listing.condition }}</p>
            <p>Location: {{ listing.location }}</p>
          </li>
        </ul>
      </div>
      <p v-else>No visited listings found. View listings while logged in and they'll show up here!</p>
    </div>
  </div>
</template>