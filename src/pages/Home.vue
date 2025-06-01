
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
  getListings();
});

// For SQL query box
const queryText = ref("");
const commitQuery = async () => {
  if (!queryText.value.trim()) return;
  try {
    await invoke("execute_query", { query: queryText.value });
    // Optionally, you could show a notification or refresh listings, etc.
  } catch (e) {
    // Optionally, handle error
    console.error(e);
  }
};
</script>

<template>
  <main class="container">
    <!-- Hero Section -->
    <section class="hero">
      <h1>GearXChange</h1>
      <p class="subtitle">Buy, sell, or rent heavy machinery with ease.</p>
      <button class="cta" @click="getListings">Browse Latest Listings</button>
      <!-- SQL Query Box for Development/Testing -->
      <div class="query-box">
        <input
          v-model="queryText"
          class="query-input"
          type="text"
          placeholder="Enter SQL query..."
        />
        <button class="commit-btn" @click="commitQuery">Commit</button>
      </div>
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

<style scoped>
.logo.vite:hover {
  filter: drop-shadow(0 0 2em #747bff);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #249b73);
}


.container {
  margin: 0 auto;
  max-width: 900px;
  padding: 0 1rem 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero {
  text-align: center;
  margin-top: 6vh;
  margin-bottom: 3rem;
}
.hero h1 {
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}
.subtitle {
  font-size: 1.3rem;
  color: #555;
  margin-bottom: 1.5rem;
}
.cta {
  background: #24c8db;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.8em 2em;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.cta:hover {
  background: #1ba7b8;
}

.featured-listings {
  width: 100%;
  margin-top: 2rem;
}
.featured-listings h2 {
  text-align: left;
  font-size: 2rem;
  margin-bottom: 1rem;
}
.loading {
  text-align: center;
  color: #888;
  margin: 2rem 0;
}
.error {
  color: #c00;
  text-align: center;
  margin: 2rem 0;
}
.listing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  list-style: none;
  padding: 0;
}
.listing-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 1.2rem 1.5rem;
  text-align: left;
  transition: box-shadow 0.2s;
}
.listing-card:hover {
  box-shadow: 0 4px 16px rgba(36,200,219,0.13);
}
.listing-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 700;
}
.listing-card .price {
  color: #24c8db;
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.listing-card .desc {
  color: #444;
  margin-top: 0.7rem;
  font-size: 0.97em;
}
.listing-card span {
  font-weight: 500;
}

.query-box {
  display: flex;
  align-items: center;
  margin: 1.5rem auto 0 auto;
  max-width: 600px;
  gap: 0.5rem;
}
.query-input {
  flex: 1;
  padding: 0.6em 1em;
  border: 1px solid #bbb;
  border-radius: 6px;
  font-size: 1em;
}
.commit-btn {
  background: #24c8db;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.6em 1.5em;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.commit-btn:hover {
  background: #1ba7b8;
}

@media (prefers-color-scheme: dark) {
  html, body {
    background: #181818;
  }
  .container {
    color: #f2f2f2;
  }
  .listing-card {
    background: #23272e;
    color: #f2f2f2;
  }
  .cta {
    background: #1ba7b8;
    color: #fff;
  }
  .cta:hover {
    background: #24c8db;
  }
}

</style>