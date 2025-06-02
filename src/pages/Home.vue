
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { invoke } from "@tauri-apps/api/core";

const listings = ref<any[]>([]);
const loading = ref(true);
const errorMsg = ref("");

const favouriteIds = ref<Set<number>>(new Set());
const favouriteError = ref("");

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
    // Fetch favourites after listings
    const favs = await invoke("get_favourite_listings");
    if (Array.isArray(favs)) {
      favouriteIds.value = new Set(favs.map((f: any) => Number(f.id)));
    } else {
      favouriteIds.value = new Set();
    }
  } catch (error) {
    listings.value = [];
    errorMsg.value = "Failed to fetch listings.";
  } finally {
    loading.value = false;
  }
}

async function toggleFavourite(listingId: number) {
  console.log("Toggling favourite for", listingId);
  try {
    if (favouriteIds.value.has(listingId)) {
      await invoke("remove_favourite", { listingId });
      favouriteIds.value.delete(listingId);
      console.log("Removed from favourites", listingId);
    } else {
      await invoke("add_favourite", { listingId });
      favouriteIds.value.add(listingId);
      console.log("Added to favourites", listingId);
    }
    // Force update
    favouriteIds.value = new Set(favouriteIds.value);
    console.log("Current favourites:", Array.from(favouriteIds.value));
    favouriteError.value = "";
  } catch (e: any) {
    console.error("Failed to toggle favourite:", e);
    if (typeof e === "string" && e.includes("not logged in")) {
      favouriteError.value = "You must be logged in to add favourites.";
    } else if (e && typeof e.message === "string" && e.message.includes("not logged in")) {
      favouriteError.value = "You must be logged in to add favourites.";
    } else {
      favouriteError.value = "Failed to update favourite. Please try again.";
    }
    // Optionally clear after a few seconds
    setTimeout(() => { favouriteError.value = ""; }, 4000);
  }
}

onMounted(() => {
  setTimeout(getListings, 200);
});
</script>


<template>
  <main>
    <!-- Hero Section -->
    <section class="hero min-h-[25vh] bg-base-300 w-ful relative">
      <div class="hero-content flex-col text-cente">
        <div>
          <button class="btn btn-primary btn-lg absolute top-5 left-5" @click="getListings">
            Refresh Listings
          </button>
          <h1 class="text-5xl font-bold mb-4">GearXChange</h1>
          <p class="py-2 text-lg mb-6">Buy, sell, or rent heavy machinery with ease.</p>
          
        </div>
      </div>
    </section>

    <!-- Favourites Listings (if any) -->
    <section v-if="favouriteIds.size > 0" class="favourites-listings py-8 bg-base-200">
      <h2 class="text-3xl font-bold mb-6 text-center">Your Favourites</h2>
      <div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 md:px-8">
          <div
            v-for="listing in listings.filter(l => favouriteIds.has(Number(l.id)))"
            :key="'fav-' + listing.id"
            class="card bg-base-100 shadow-xl relative"
          >
            <!-- Star button -->
            <button
              class="btn btn-ghost btn-s btn-circle absolute top-2 right-2 z-10"
              @click.stop="toggleFavourite(Number(listing.id))"
              :aria-label="favouriteIds.has(Number(listing.id)) ? 'Remove from favourites' : 'Add to favourites'"
            >
              <svg v-if="favouriteIds.has(Number(listing.id))" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-warning fill-warning" viewBox="0 0 24 24">
                <path d="M12 17.75l-6.172 3.245 1.179-6.873L2 9.755l6.914-1.005L12 2.25l3.086 6.5L22 9.755l-5.007 4.367 1.179 6.873z"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-warning stroke-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 17.75l-6.172 3.245 1.179-6.873L2 9.755l6.914-1.005L12 2.25l3.086 6.5L22 9.755l-5.007 4.367 1.179 6.873z"/>
              </svg>
            </button>
            <div v-if="listing.pictureUrl" class="w-full h-48 overflow-hidden flex items-center justify-center bg-base-200">
              <img :src="listing.pictureUrl" :alt="listing.title" class="object-cover w-full h-full rounded-t-box" />
            </div>
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
            <div v-for="listing in listings.slice(0,9)" :key="listing.id" class="card bg-base-100 shadow-xl relative">
              <!-- Star button -->
              <button
                class="btn btn-ghost btn-s btn-circle absolute top-2 right-2 z-10"
                @click.stop="toggleFavourite(Number(listing.id))"
                :aria-label="favouriteIds.has(Number(listing.id)) ? 'Remove from favourites' : 'Add to favourites'"
              >
                <svg v-if="favouriteIds.has(Number(listing.id))" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-warning fill-warning" viewBox="0 0 24 24">
                  <path d="M12 17.75l-6.172 3.245 1.179-6.873L2 9.755l6.914-1.005L12 2.25l3.086 6.5L22 9.755l-5.007 4.367 1.179 6.873z"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-warning stroke-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 17.75l-6.172 3.245 1.179-6.873L2 9.755l6.914-1.005L12 2.25l3.086 6.5L22 9.755l-5.007 4.367 1.179 6.873z"/>
                </svg>
              </button>
              <div v-if="listing.pictureUrl" class="w-full h-48 overflow-hidden flex items-center justify-center bg-base-200">
                <img :src="listing.pictureUrl" :alt="listing.title" class="object-cover w-full h-full rounded-t-box" />
              </div>
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

    <!-- DaisyUI toast for favourite error (use v-show for animation) -->
    <div class="toast toast-end z-50" v-show="favouriteError">
      <div class="alert alert-error">
        <span>{{ favouriteError }}</span>
      </div>
    </div>
  </main>
</template>