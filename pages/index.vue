
<script lang="ts" setup>

const listings = ref<any[]>([]);
const loading = ref(true);
const errorMsg = ref("");

const favouriteIds = ref<Set<string>>(new Set());
const favouriteError = ref("");


async function getListings() {
  loading.value = true;
  errorMsg.value = "";
  try {
    // Fetch listings from Nuxt API
    const res = await fetch("/api/listings");
    const rawListings = await res.json();
    if (Array.isArray(rawListings)) {
      listings.value = rawListings;
    } else {
      listings.value = [];
      errorMsg.value = "Unexpected data format from server.";
    }
    // Fetch favourites after listings
    const favRes = await fetch("/api/favourites");
    const favs = await favRes.json();
    if (Array.isArray(favs)) {
      // Favourites API returns joined objects, so support both {id} and {machinery_listings: {id}}
      favouriteIds.value = new Set(
        favs.map((f: any) => f.id ?? f.machinery_listings?.id).filter((id: any) => id != null)
      );
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


async function toggleFavourite(listingId: string) {
  try {
    if (favouriteIds.value.has(listingId)) {
      // Remove favourite
      const res = await fetch("/api/favourites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId })
      });
      if (!res.ok) throw new Error(await res.text());
      favouriteIds.value.delete(listingId);
    } else {
      // Add favourite
      const res = await fetch("/api/favourites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId })
      });
      if (!res.ok) throw new Error(await res.text());
      favouriteIds.value.add(listingId);
    }
    // Force update
    favouriteIds.value = new Set(favouriteIds.value);
    favouriteError.value = "";
  } catch (e: any) {
    console.error("Failed to toggle favourite:", e);
    if (typeof e === "string" && e.includes('Not authenticated')) {
      favouriteError.value = "You must be logged in to add favourites.";
    } else if (e && typeof e.message === "string" && e.message.includes('Not authenticated')) {
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
          <listingcard
            v-for="listing in listings.filter(l => favouriteIds.has((l.id)))"
            :key="'fav-' + listing.id"
            :listing="listing"
            :isFavourite="true"
            :onToggleFavourite="toggleFavourite"
            />
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
            <listingcard
                v-for="listing in listings.slice(0, 9)"
                :key="listing.id"
                :listing="listing"
                :isFavourite="favouriteIds.has(listing.id)"
                :onToggleFavourite="toggleFavourite"
                />
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