<script lang="ts" setup>
import { computed, watch, ref } from "vue";
import { useUser } from "~/composables/useUser";

// These are kind of like arguments this template receives, that get passed in to the template as references.
const props = defineProps<{
  listing: any;
  isFavourite: boolean;
  onToggleFavourite: (id: string) => void;
}>();

const emits = defineEmits(["deleted"]);
const user = useUser();

const showDeleteConfirm = ref(false);
const showDetails = ref(false);

// Once this card becomes visibles this triggers, letting the backend know it has been viewed and telling it to get the biddings
watch(showDetails, (visible) => {
  if (visible) {
    fetch("/api/view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ listing_id: props.listing.id }),
    });

    getBiddings();
  }
});

const topBids = computed(() => {
  return biddings.value.sort((a, b) => b.amount_bid - a.amount_bid).slice(0, 3); // top 3 bids get displayed
});

function confirmDeleteListing() {
  showDeleteConfirm.value = false;
  deleteListing();
}

const loading = ref(false);
const errorMsg = ref("");
const biddings = ref<any[]>([]);

async function getBiddings() {
  loading.value = true;
  errorMsg.value = "";
  try {
    const res = await $fetch(`/api/biddings?listing_id=${props.listing.id}`);

    const rawListings = res;
    if (Array.isArray(rawListings)) {
      biddings.value = rawListings;
    } else {
      biddings.value = [];
      errorMsg.value = "Unexpected data format from server.";
    }
  } catch (error) {
    biddings.value = [];
    console.log("Failed to fetch biddings");
    errorMsg.value = "Failed to fetch biddings.";
  } finally {
    loading.value = false;
  }
}

const bidAmount = ref<number | null>(null);
const bidError = ref("");
const bidSuccess = ref(false);

async function submitBid() {
  bidError.value = "";
  bidSuccess.value = false;

  // Can never bid a negative amount that'd make no sense
  if (!bidAmount.value || bidAmount.value <= 0) {
    bidError.value = "Please enter a valid bid amount.";
    return;
  }

  try {
    const response = await fetch("/api/biddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listing_id: props.listing.id,
        amount: bidAmount.value,
      }),
    });
    const data = await response.json();
    if (data.error) {
      bidError.value = data.error;
    } else {
      bidSuccess.value = true;
      bidAmount.value = null;
      getBiddings(); // Refresh bidding list to include the newly placed one
    }
  } catch (err) {
    bidError.value = "Failed to place bid.";
  }
}

const isOwner = computed(() => {
  return user.value && user.value.id === props.listing.user_id;
});

const deleting = ref(false);
const deleteError = ref("");

async function deleteListing() {
  deleting.value = true;
  deleteError.value = "";
  try {
    const res = await fetch("/api/listings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing_id: props.listing.id }),
    });
    const data = await res.json();
    if (data.error) {
      deleteError.value = data.error;
    } else {
      showDetails.value = false;
      emits("deleted");
    }
  } catch (e) {
    deleteError.value = "Failed to delete listing.";
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <div>
    <!-- Small card -->
    <div
      class="card bg-base-100 shadow-xl relative transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
      @click="showDetails = true"
    >
      <!-- Star button -->
      <button
        class="btn btn-ghost btn-s btn-circle absolute top-2 right-2 z-10"
        @click.stop="onToggleFavourite(listing.id)"
        :aria-label="
          isFavourite ? 'Remove from favourites' : 'Add to favourites'
        "
      >
        <svg
          v-if="isFavourite"
          xmlns="http://www.w3.org/2000/svg"
          class="w-6 h-6 text-warning fill-warning"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 17.75l-6.172 3.245 1.179-6.873L2 9.755l6.914-1.005L12 2.25l3.086 6.5L22 9.755l-5.007 4.367 1.179 6.873z"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="w-6 h-6 text-warning stroke-warning"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 17.75l-6.172 3.245 1.179-6.873L2 9.755l6.914-1.005L12 2.25l3.086 6.5L22 9.755l-5.007 4.367 1.179 6.873z"
          />
        </svg>
      </button>

      <!-- Picture display (if it exists) -->
      <div
        v-if="listing.pictureUrl"
        class="w-full h-48 overflow-hidden flex items-center justify-center bg-base-200"
      >
        <img
          :src="listing.pictureUrl"
          :alt="listing.title"
          class="object-cover w-full h-full rounded-t-box"
        />
      </div>
      <div class="card-body">
        <h3 class="card-title">{{ listing.title }}</h3>
        <p class="text-lg font-semibold">
          Price: <span>{{ listing.price || "N/A" }}</span>
        </p>
        <p>
          Condition: <span>{{ listing.condition }}</span>
        </p>
        <p>
          Location: <span>{{ listing.location }}</span>
        </p>
        <div
          v-if="listing.picture"
          class="w-full h-48 overflow-hidden bg-base-200"
        >
          <img
            :src="listing.picture"
            class="h-full mx-auto object-contain rounded-t-box"
            alt="Uploaded image"
          />
        </div>
        <div
          v-else
          class="w-full h-48 flex items-center justify-center bg-base-200 text-gray-500 italic"
        >
          No picture available
        </div>
        <p v-if="listing.description" class="text-sm opacity-80 mt-2">
          {{ listing.description }}
        </p>
      </div>
    </div>

    <!-- Fullscreen card -->
    <div
      v-if="showDetails"
      class="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
      @click.self="showDetails = false"
    >
      <div
        class="bg-base-100 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl relative animate-(--animate-scale-in)"
      >
        <button
          class="btn btn-sm btn-circle absolute top-4 right-4 z-10"
          @click="showDetails = false"
        >
          ✕
        </button>

        <div class="p-6 space-y-4">
          <h2 class="text-3xl font-bold">{{ listing.title }}</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
            <div>
              <p>
                <strong>Price:</strong> {{ listing.price || "N/A" }}
                <span v-if="listing.price_type"
                  >({{ listing.price_type }})</span
                >
              </p>
              <p><strong>Condition:</strong> {{ listing.condition }}</p>
              <p><strong>Location:</strong> {{ listing.location }}</p>
              <p><strong>Make:</strong> {{ listing.make }}</p>
              <p><strong>Model:</strong> {{ listing.model }}</p>
            </div>
            <div>
              <p><strong>Type:</strong> {{ listing.vehicle_type }}</p>
              <p><strong>Year:</strong> {{ listing.year_of_manufacture }}</p>
              <p><strong>Fuel/Power:</strong> {{ listing.fuel_or_power }}</p>
              <p><strong>Weight:</strong> {{ listing.weight || "N/A" }} kg</p>
              <p><strong>Views:</strong> {{ listing.views || 0 }}</p>
            </div>
          </div>

          <div v-if="listing.description" class="pt-2">
            <h3 class="text-xl font-semibold mb-2">Description</h3>
            <p class="text-base leading-relaxed whitespace-pre-wrap">
              {{ listing.description }}
            </p>
          </div>

          <p class="text-sm text-gray-500 mt-6">
            Listed on:
            <!-- 
      JS date doesn't take dates of the form "YYYY-MM-DD HH:MM:SS", the SQL standard
      It does however take dates of the form "YYYY-MM-DDTHH:MM:SS", so we just replace the space with a T
      Then JS can recognize it as the correct format, and display it correctly
    -->
            {{
              new Date(
                listing.created_at.replace(" ", "T"),
              ).toLocaleDateString()
            }}
          </p>
        </div>

        <!-- Biddings display -->
        <div class="px-6 pb-6 space-y-2">
          <h3 class="text-xl font-semibold">Place a Bid</h3>
          <form @submit.prevent="submitBid">
            <div class="flex items-center gap-2">
              <!--The :min tag is computed such that its defaulted at 1 if theres no bid yet, and otherwise its 1 more than the current highest bid -->
              <input
                v-model.number="bidAmount"
                type="number"
                :min="topBids.length ? topBids[0].amount_bid + 1 : 1"
                class="input input-bordered w-full max-w-xs"
                placeholder="Enter your bid amount"
                required
              />
              <button type="submit" class="btn btn-primary">Place Bid</button>
            </div>
            <p v-if="bidError" class="text-error text-sm mt-1">
              {{ bidError }}
            </p>
            <p v-if="bidSuccess" class="text-success text-sm mt-1">
              Bid placed!
            </p>
          </form>
          <div v-if="topBids.length" class="pt-4">
            <h3 class="text-lg font-semibold mb-2">Top Bids</h3>
            <ul class="space-y-1 text-base">
              <li v-for="bid in topBids">
                €{{ bid.amount_bid }} by {{ bid.username }}
              </li>
            </ul>
          </div>
        </div>

        <!-- image section -->
        <div
          v-if="listing.pictureUrl || listing.picture"
          class="w-full flex justify-center items-center bg-base-200 p-4"
        >
          <img
            :src="listing.pictureUrl || listing.picture"
            class="max-h-[40vh] w-auto object-contain rounded-lg shadow-md"
            alt="Listing image"
          />
        </div>

        <!-- Delete button (owner only) -->
        <div v-if="isOwner" class="px-6 pb-4">
          <button
            @click="showDeleteConfirm = true"
            class="btn btn-error btn-block"
            :disabled="deleting"
          >
            <span v-if="deleting">Deleting...</span>
            <span v-else>Delete Listing</span>
          </button>
          <p v-if="deleteError" class="text-error text-sm mt-1">
            {{ deleteError }}
          </p>
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="showDeleteConfirm"
    class="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
  >
    <div class="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-sm">
      <h3 class="text-lg font-bold mb-4">Confirm Deletion</h3>
      <p class="mb-6">
        Are you sure you want to delete this listing? This action cannot be
        undone.
      </p>
      <div class="flex justify-end gap-2">
        <button class="btn btn-ghost" @click="showDeleteConfirm = false">
          Cancel
        </button>
        <button
          class="btn btn-error"
          :disabled="deleting"
          @click="confirmDeleteListing"
        >
          <span v-if="deleting">Deleting...</span>
          <span v-else>Yes, Delete</span>
        </button>
      </div>
    </div>
  </div>
</template>
