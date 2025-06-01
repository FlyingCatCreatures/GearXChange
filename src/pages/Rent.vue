<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { invoke } from "@tauri-apps/api/core";

const listings = ref<any[]>([]);
const errorMessage = ref("");
const successMessage = ref("");

async function fetchListings() {
  try {
    const rawListings = await invoke("get_listings", { ordering: "date_desc" });
    if (Array.isArray(rawListings)) {
      listings.value = rawListings;
    } else {
      errorMessage.value = "Unexpected data format received.";
    }
  } catch (error) {
    console.error("Failed to fetch listings:", error);
    errorMessage.value = "Failed to load listings. Please try again later.";
  }
}

async function viewListing(listingId: number) {
  try {
    await invoke("view_listing", { listingId: listingId });
    successMessage.value = `You have viewed listing ID: ${listingId}`;
    setTimeout(() => (successMessage.value = ""), 3000); // Clear the message after 3 seconds
  } catch (error) {
    console.error("Failed to view listing:", error);
    errorMessage.value = "Failed to view the listing. Please try again.";
  }
}

onMounted(() => {
  fetchListings();
});
</script>

<template>
  <div class="rent-page">
    <h1>Available Listings for Rent</h1>
    <div v-if="errorMessage">
      <p class="error">{{ errorMessage }}</p>
    </div>
    <div v-else>
      <div v-if="successMessage">
        <p class="success">{{ successMessage }}</p>
      </div>
      <div v-if="listings.length > 0">
        <ul class="listings">
          <li v-for="listing in listings" :key="listing.id" class="listing-item">
            <h3>{{ listing.title }}</h3>
            <p>Price: {{ listing.price || "N/A" }}</p>
            <p>Condition: {{ listing.condition }}</p>
            <p>Location: {{ listing.location }}</p>
            <button @click="viewListing(listing.id)">
              This is a placeholder, click this to view this listing
            </button>
          </li>
        </ul>
      </div>
      <p v-else>No listings available for rent.</p>
    </div>
  </div>
</template>

<style scoped>
.rent-page {
  padding: 20px;
}

.error {
  color: red;
  font-weight: bold;
}

.success {
  color: green;
  font-weight: bold;
}

.listings {
  list-style: none;
  padding: 0;
}

.listing-item {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.listing-item h3 {
  margin: 0 0 5px;
}

.listing-item p {
  margin: 0;
}

.listing-item button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.listing-item button:hover {
  background-color: #0056b3;
}
</style>