<script lang="ts" setup>
import type { User } from '~/server/lib/db';

const title = ref("");
const price = ref<number | null>(null);
const priceType = ref("fixed");
const condition = ref("new");
const location = ref("");
const description = ref("");
const make = ref("");
const model = ref("");
const vehicleType = ref("");
const yearOfManufacture = ref<number | null>(null);
const fuelOrPower = ref("");
const weight = ref<number | null>(null);
const pictureFile = ref<File | null>(null);
const pictureFileName = ref<string>("");
const imagePreview = ref<string | null>(null);
const stepTwo = ref(false);
const plate = ref("");
const workHours = ref<number | null>(null);

const successMessage = ref("");
const errorMessage = ref("");

function goToStep2() {
  const platePattern = /^[A-Z]{2}-[0-9]{3}-[A-Z]$/;
  if (!platePattern.test(plate.value.trim())) {
    errorMessage.value = "Please use format XX-999-X with a dash.";
    return;
  }
  if (workHours.value === null) {
    errorMessage.value = "Please enter the operating hours first.";
    return;
  }
  errorMessage.value = "";
  stepTwo.value = true;
}

function onFileChange(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  if (files && files.length > 0) {
    pictureFile.value = files[0];
    pictureFileName.value = files[0].name;
    imagePreview.value = URL.createObjectURL(files[0]);
  } else {
    pictureFile.value = null;
    pictureFileName.value = "";
    imagePreview.value = null;
  }
}

async function fileToBase64(file: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file); // Produces a data URL with base64-encoded image
  });
}

async function handleCreateListing() {
  try {
    await $fetch('/api/listings', {
      method: 'POST',
      body: {
        plate: plate.value.trim(),
        work_hours: workHours.value,
        title: title.value.trim(),
        price: price.value,
        price_type: priceType.value,
        condition: condition.value,
        location: location.value.trim(),
        picture: await fileToBase64(pictureFile.value) || null, // Parse file into a base64 encoding of itself to store in backend
        description: description.value.trim() || null,
        make: make.value.trim(),
        model: model.value.trim(),
        vehicle_type: vehicleType.value.trim(),
        year_of_manufacture: yearOfManufacture.value,
        fuel_or_power: fuelOrPower.value.trim(),
        weight: weight.value,
      },
    });

    successMessage.value = "Listing created successfully!";
    errorMessage.value = "";
    resetForm();
    stepTwo.value = false;
  } catch (error) {
    console.error("Failed to create listing:", error);
    successMessage.value = "";
    errorMessage.value = "Failed to create listing. Please try again.";
  }
}

function resetForm() {
  plate.value = "";
  workHours.value = null;
  title.value = "";
  price.value = null;
  priceType.value = "fixed";
  condition.value = "new";
  const user = useUser() as Ref<User | null>;
  location.value = user.value?.location ?? '';
  description.value = "";
  make.value = "";
  model.value = "";
  vehicleType.value = "";
  yearOfManufacture.value = null;
  fuelOrPower.value = "";
  weight.value = null;

  pictureFile.value = null;
  pictureFileName.value = "";
  imagePreview.value = null;
}
</script>

<template>
  <div class="sell-page max-w-xl mx-auto p-6">
    <div v-if="!stepTwo" class="step1">
      <h1 class="text-2xl font-semibold mb-4">Fill in your license plate</h1>
      <div v-if="errorMessage" class="error text-red-600 mb-2">{{ errorMessage }}</div>
      <div class="form-field mb-4">
        <label for="plate" class="block font-medium mb-1">License Plate:</label>
        <input
          id="plate"
          v-model="plate"
          @input="plate = plate.toUpperCase()"
          type="text"
          maxlength="8"
          placeholder="XX-999-X"
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
        Create listing
      </button>
    </div>

    <div v-else class="step2">
      <h1 class="text-2xl font-semibold mb-4">Create a New Listing</h1>
      <div class="mb-4">
        <span class="font-medium">License Plate:</span> {{ plate }}<br />
        <span class="font-medium">Work Hours:</span> {{ workHours }} h
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
        <div class="form-field mb-4">
          <label for="pictureFile" class="block font-medium mb-1">Upload Picture:</label>
          <label class="btn btn-outline w-full cursor-pointer">
            Choose File
            <input
              id="pictureFile"
              type="file"
              accept="image/*"
              @change="onFileChange"
              class="hidden"
            />
          </label>
          <div v-if="pictureFileName" class="text-sm text-gray-500 mt-1">
            Selected file: {{ pictureFileName }}
          </div>
          <img
            v-if="imagePreview"
            :src="imagePreview"
            alt="Image Preview"
            class="mt-4 max-h-48 w-auto border border-gray-300 rounded"
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