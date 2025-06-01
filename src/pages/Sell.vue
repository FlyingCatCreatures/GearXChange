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

const successMessage = ref("");
const errorMessage = ref("");

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
  <div class="sell-page">
    <h1>Create a New Listing</h1>
    <div v-if="successMessage" class="success">{{ successMessage }}</div>
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    <form @submit.prevent="handleCreateListing" class="sell-form">
      <div class="form-field">
        <label for="title">Title:</label>
        <input id="title" v-model="title" type="text" required />
      </div>
      <div class="form-field">
        <label for="price">Price:</label>
        <input id="price" v-model.number="price" type="number" min="0" />
      </div>
      <div class="form-field">
        <label for="priceType">Price Type:</label>
        <select id="priceType" v-model="priceType">
          <option value="fixed">Fixed</option>
          <option value="negotiable">Negotiable</option>
          <option value="on request">On Request</option>
        </select>
      </div>
      <div class="form-field">
        <label for="condition">Condition:</label>
        <select id="condition" v-model="condition">
          <option value="new">New</option>
          <option value="good as new">Good as New</option>
          <option value="used">Used</option>
          <option value="heavily used">Heavily Used</option>
        </select>
      </div>
      <div class="form-field">
        <label for="location">Location:</label>
        <input id="location" v-model="location" type="text" required />
      </div>
      <div class="form-field">
        <label for="pictureUrl">Picture URL:</label>
        <input id="pictureUrl" v-model="pictureUrl" type="text" />
      </div>
      <div class="form-field">
        <label for="description">Description:</label>
        <textarea id="description" v-model="description"></textarea>
      </div>
      <div class="form-field">
        <label for="make">Make:</label>
        <input id="make" v-model="make" type="text" required />
      </div>
      <div class="form-field">
        <label for="model">Model:</label>
        <input id="model" v-model="model" type="text" required />
      </div>
      <div class="form-field">
        <label for="vehicleType">Vehicle Type:</label>
        <input id="vehicleType" v-model="vehicleType" type="text" required />
      </div>
      <div class="form-field">
        <label for="yearOfManufacture">Year of Manufacture:</label>
        <input id="yearOfManufacture" v-model.number="yearOfManufacture" type="number" min="1800" max="2025" required />
      </div>
      <div class="form-field">
        <label for="fuelOrPower">Fuel or Power:</label>
        <input id="fuelOrPower" v-model="fuelOrPower" type="text" required />
      </div>
      <div class="form-field">
        <label for="weight">Weight (kg):</label>
        <input id="weight" v-model.number="weight" type="number" min="0" />
      </div>
      <button type="submit" class="submit-button">Create Listing</button>
    </form>
  </div>
</template>

<style scoped>
.sell-page {
  padding: 20px;
}

.success {
  color: green;
  font-weight: bold;
  margin-bottom: 10px;
}

.error {
  color: red;
  font-weight: bold;
  margin-bottom: 10px;
}

.sell-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field label {
  font-weight: bold;
  margin-bottom: 5px;
}

.submit-button {
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #218838;
}
</style>