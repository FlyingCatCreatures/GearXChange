<script lang="ts" setup>
import MiniSearch from 'minisearch';
import { onMounted, ref, computed } from 'vue';

const listings = ref<any[]>([]);
const filteredListings = ref<any[]>([]);
const loading = ref(true);
const errorMsg = ref("");

const favouriteIds = ref<Set<string>>(new Set());
const searchQuery = ref("");
const miniSearch = new MiniSearch({
  fields: ['title', 'description', 'make', 'model', 'location', 'vehicle_type'],
  storeFields: ['id', 'title', 'description', 'make', 'model', 'location', 'vehicle_type'],
  searchOptions: {
    prefix: true,
    fuzzy: 0.2,
  },
});

const sortOption = ref("default");

// Orders the listings after they've been filtered with minisearch
const sortedListings = computed(() => {
  const listingsToSort = [...filteredListings.value];
  if (sortOption.value === "default") { return listingsToSort; }
  else if (sortOption.value === "priceAsc") { return listingsToSort.sort((a, b) => (a.price ?? 0) - (b.price ?? 0)); } 
  else if (sortOption.value === "priceDesc") { return listingsToSort.sort((a, b) => (b.price ?? 0) - (a.price ?? 0)); }
  console.warn("other sorting than default, priceAsc, priceDesc selected")
  return listingsToSort;
});

const favouriteError = ref("");

async function getListings() {
  loading.value = true;
  errorMsg.value = "";
  try {
    const res = await fetch("/api/listings");
    const rawListings = await res.json();
    if (Array.isArray(rawListings)) {
      listings.value = rawListings;
      miniSearch.removeAll();
      miniSearch.addAll(rawListings);
      filteredListings.value = rawListings;
    } else {
      listings.value = [];
      filteredListings.value = [];
      errorMsg.value = "Unexpected data format from server.";
    }

    const favRes = await fetch("/api/favourites");
    const favs = await favRes.json();
    if (Array.isArray(favs)) {
      favouriteIds.value = new Set(
        favs.map((f: any) => f.id ?? f.machinery_listings?.id).filter((id: any) => id != null)
      );
    } else {
      favouriteIds.value = new Set();
    }
  } catch (error) {
    listings.value = [];
    filteredListings.value = [];
    errorMsg.value = "Failed to fetch listings.";
  } finally {
    loading.value = false;
  }
}

watch(searchQuery, (query) => {
  if (!query) {
    filteredListings.value = listings.value;
  } else {
    const results = miniSearch.search(query);
    filteredListings.value = results
      .map(r => listings.value.find(l => l.id === r.id))
      .filter(Boolean);
  }
});

async function toggleFavourite(listingId: string) {
  try {
    if (favouriteIds.value.has(listingId)) {
      const res = await fetch("/api/favourites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId })
      });
      if (!res.ok) throw new Error(await res.text());
      favouriteIds.value.delete(listingId);
    } else {
      const res = await fetch("/api/favourites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId })
      });
      if (!res.ok) throw new Error(await res.text());
      favouriteIds.value.add(listingId);
    }
    favouriteIds.value = new Set(favouriteIds.value);
    favouriteError.value = "";
  } catch (e: any) {
    console.error("Failed to toggle favourite:", e);
    if (typeof e === "string" && e.includes('Not authenticated')) {
      favouriteError.value = "You must be logged in to add favourites.";
    } else if (e?.message?.includes('Not authenticated')) {
      favouriteError.value = "You must be logged in to add favourites.";
    } else {
      favouriteError.value = "Failed to update favourite. Please try again.";
    }
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
      <div class="hero-content flex-col text-center">
        <button class="btn btn-primary btn-lg absolute top-5 left-5" @click="getListings">
          Refresh Listings
        </button>
        <div>
          <h1 class="text-5xl font-bold mb-4">GearXChange</h1>
          <p class="py-2 text-lg mb-6">Buy, sell, or rent heavy machinery with ease.</p>
         <!-- Search & Sort Bar -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-2xl mx-auto">
        <!-- Search Bar with icon -->
        <div class="relative w-full sm:flex-1">
        <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-50 text-base-content pointer-events-none z-10"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
        >
            <g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
            </g>
        </svg>
        <input
            type="search"
            class="input input-bordered w-full pl-10"
            placeholder="Search"
            v-model="searchQuery"
        />
        </div>

    <!-- Sort Dropdown -->
    <div class="relative w-full sm:w-auto">
      <select class="select pl-10 w-full" v-model="sortOption">
        <option value="default">Default</option>
        <option value="priceAsc">Price ↑</option>
        <option value="priceDesc">Price ↓</option>
      </select>
      <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-50 text-base-content pointer-events-none z-10"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M3 4h18M6 8h12M9 12h6M12 16h0M15 20h0" />
      </svg>
    </div>
    </div>
</div>
</div>
</section>

    <!-- Favourites Listings (if any) -->
    <section v-if="favouriteIds.size > 0" class="favourites-listings py-8 bg-base-200">
      <h2 class="text-3xl font-bold mb-6 text-center">Your Favourites</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 md:px-8">
        <listingcard
          v-for="listing in sortedListings.filter(l => favouriteIds.has(l.id))"
          :key="'fav-' + listing.id"
          :listing="listing"
          :isFavourite="true"
          :onToggleFavourite="toggleFavourite"
        />
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
        <div v-if="filteredListings.length > 0">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 md:px-8">
            <listingcard
                v-for="listing in sortedListings.slice(0, 9)"
                :key="listing.id"
                :listing="listing"
                :isFavourite="favouriteIds.has(listing.id)"
                :onToggleFavourite="toggleFavourite"
                />
          </div>
        </div>
        <p v-else class="text-center text-lg mt-8">No listings match your search.</p>
      </div>
    </section>

    <!-- DaisyUI toast for favourite error -->
    <div class="toast toast-end z-50" v-show="favouriteError">
      <div class="alert alert-error">
        <span>{{ favouriteError }}</span>
      </div>
    </div>
  </main>
</template>
