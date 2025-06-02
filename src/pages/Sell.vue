<script lang="ts" setup>
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";

const title = ref("");
const price = ref<number | null>(null);
const priceType = ref("fixed");
const condition = ref("new");
const location = ref("");
const pictureUrl = ref("");
const description = ref("");
const make = ref("");
const model = ref("");
const vehicleType = ref("");
const yearOfManufacture = ref<number | null>(null);
const fuelOrPower = ref("");
const weight = ref<number | null>(null);

const stepTwo = ref(false);
const plate = ref("");
const workHours = ref<number | null>(null);

const successMessage = ref("");
const errorMessage = ref("");

function goToStep2() {
  if (!plate.value.trim()) {
    errorMessage.value = "Please fill in a plate number.";
    return;
  }
  if (workHours.value === null) {
    errorMessage.value = "Please fill in the work hours.";
    return;
  }
  errorMessage.value = "";
  stepTwo.value = true;
}

async function handleCreateListing() {
  try {
    await invoke("create_listing", {
      title: title.value.trim(),
      price: price.value,
      priceType: priceType.value,
      condition: condition.value,
      location: location.value.trim(),
      pictureUrl: pictureUrl.value.trim() || null,
      description: description.value.trim() || null,
      make: make.value.trim(),
      model: model.value.trim(),
      vehicleType: vehicleType.value.trim(),
      yearOfManufacture: yearOfManufacture.value,
      fuelOrPower: fuelOrPower.value.trim(),
      weight: weight.value,
    });

    successMessage.value = "Listing created successfully!";
    errorMessage.value = "";
    resetForm();
  } catch (error) {
    console.error("Failed to create listing:", error);
    successMessage.value = "";
    errorMessage.value = "Failed to create listing. Please try again.";
  }
}

function resetForm() {
  title.value = "";
  price.value = null;
  priceType.value = "fixed";
  condition.value = "new";
  location.value = "";
  pictureUrl.value = "";
  description.value = "";
  make.value = "";
  model.value = "";
  vehicleType.value = "";
  yearOfManufacture.value = null;
  fuelOrPower.value = "";
  weight.value = null;
}
</script>

<template>
  <div class="sell-page max-w-xl mx-auto p-6">
    <!-- Fase 1: vraag om kenteken + werkuren -->
    <div v-if="!stepTwo" class="step1">
      <h1 class="text-2xl font-semibold mb-4">Fill in your license plate</h1>
      <div v-if="errorMessage" class="error text-red-600 mb-2">{{ errorMessage }}</div>
      <div class="form-field mb-4">
        <label for="plate" class="block font-medium mb-1">License Plate:</label>
        <input
          id="plate"
          v-model="plate"
          type="text"
          placeholder="X-999-XX"
          class="input input-bordered w-full"
        />
      </div>
      <div class="form-field mb-6">
        <label for="workHours" class="block font-medium mb-1">Work hours:</label>
        <input
          id="workHours"
          v-model.number="workHours"
          type="number"
          min="0"
          placeholder="Amount of work hours."
          class="input input-bordered w-full"
        />
      </div>
      <button
        @click="goToStep2"
        class="btn btn-primary"
      >
        View product
      </button>
    </div>

    <div v-else class="step2">
      <h1 class="text-2xl font-semibold mb-4">Create a New Listing</h1>
      <div class="mb-4">
        <span class="font-medium">License Plate:</span> {{ plate }}<br />
        <span class="font-medium">License Plate:</span> {{ workHours }}
      </div>
      <div v-if="successMessage" class="success text-green-600 mb-2">{{ successMessage }}</div>
      <div v-if="errorMessage" class="error text-red-600 mb-2">{{ errorMessage }}</div>
      <form @submit.prevent="handleCreateListing" class="sell-form space-y-4">
        <div class="form-field">
          <label for="title" class="block font-medium mb-1">Title:</label>
          <input
            id="title"
            v-model="title"
            type="text"
            required
            class="input input-bordered w-full"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-field">
            <label for="price" class="block font-medium mb-1">Price:</label>
            <input
              id="price"
              v-model.number="price"
              type="number"
              min="0"
              class="input input-bordered w-full"
            />
          </div>
          <div class="form-field">
            <label for="priceType" class="block font-medium mb-1">Price Type:</label>
            <select
              id="priceType"
              v-model="priceType"
              class="select select-bordered w-full"
            >
              <option value="fixed">Fixed</option>
              <option value="negotiable">Negotiable</option>
              <option value="on request">On Request</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-field">
            <label for="condition" class="block font-medium mb-1">Condition:</label>
            <select
              id="condition"
              v-model="condition"
              class="select select-bordered w-full"
            >
              <option value="new">New</option>
              <option value="good as new">Good as New</option>
              <option value="used">Used</option>
              <option value="heavily used">Heavily Used</option>
            </select>
          </div>
          <div class="form-field">
            <label for="location" class="block font-medium mb-1">Location:</label>
            <input
              id="location"
              v-model="location"
              type="text"
              required
              class="input input-bordered w-full"
            />
          </div>
        </div>
        <div class="form-field">
          <label for="pictureUrl" class="block font-medium mb-1">Picture URL:</label>
          <input
            id="pictureUrl"
            v-model="pictureUrl"
            type="text"
            class="input input-bordered w-full"
          />
        </div>
        <div class="form-field">
          <label for="description" class="block font-medium mb-1">Description:</label>
          <textarea
            id="description"
            v-model="description"
            class="textarea textarea-bordered w-full"
            rows="4"
          ></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-field">
            <label for="make" class="block font-medium mb-1">Make:</label>
            <input
              id="make"
              v-model="make"
              type="text"
              required
              class="input input-bordered w-full"
            />
          </div>
          <div class="form-field">
            <label for="model" class="block font-medium mb-1">Model:</label>
            <input
              id="model"
              v-model="model"
              type="text"
              required
              class="input input-bordered w-full"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-field">
            <label for="vehicleType" class="block font-medium mb-1">Vehicle Type:</label>
            <input
              id="vehicleType"
              v-model="vehicleType"
              type="text"
              required
              class="input input-bordered w-full"
            />
          </div>
          <div class="form-field">
            <label for="yearOfManufacture" class="block font-medium mb-1">Year of Manufacture:</label>
            <input
              id="yearOfManufacture"
              v-model.number="yearOfManufacture"
              type="number"
              min="1800"
              max="2025"
              required
              class="input input-bordered w-full"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-field">
            <label for="fuelOrPower" class="block font-medium mb-1">Fuel or Power:</label>
            <input
              id="fuelOrPower"
              v-model="fuelOrPower"
              type="text"
              required
              class="input input-bordered w-full"
            />
          </div>
          <div class="form-field">
            <label for="weight" class="block font-medium mb-1">Weight (kg):</label>
            <input
              id="weight"
              v-model.number="weight"
              type="number"
              min="0"
              class="input input-bordered w-full"
            />
          </div>
        </div>
        <div class="flex justify-between mt-4">
          <button
            type="button"
            @click="stepTwo = false; errorMessage = ''; successMessage = '';"
            class="btn btn-ghost"
          >
            Return
          </button>
          <button
            type="submit"
            class="btn btn-primary"
          >
            Create Listing
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.sell-page {
  /* Centrale container, pas naar wens aan */
}
.form-field label {
  display: block;
}
</style>