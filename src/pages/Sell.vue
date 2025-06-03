<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { invoke } from "@tauri-apps/api/core";

// Phase flags
const stepOne = ref(true);
const stepTwo = ref(false);
const stepThree = ref(false);
const stepFour = ref(false);

const router = useRouter();

// Step 1 fields
const plate = ref<string>("");
const workHours = ref<number | null>(null);

// Step 2 fields
const title = ref<string>("");
const price = ref<number | null>(null);
const priceType = ref<string>("fixed");
const condition = ref<string>("new");
const location = ref<string>("");
const description = ref<string>("");
const make = ref<string>("");
const model = ref<string>("");
const vehicleType = ref<string>("");
const yearOfManufacture = ref<number | null>(null);
const fuelOrPower = ref<string>("");
const weight = ref<number | null>(null);

// File upload and preview
const pictureFile = ref<File | null>(null);
const pictureFileName = ref<string>("");
const imagePreview = ref<string | null>(null);

const successMessage = ref<string>("");
const errorMessage = ref<string>("");

function goToStepTwo() {
  const platePattern = /^[A-Z]{2}-[0-9]{3}-[A-Z]$/;
  if (!platePattern.test(plate.value.trim())) {
    errorMessage.value = "Please use format XX-999-X with a dash.";
    return;
  }
  if (workHours.value == null || !Number.isInteger(workHours.value) || workHours.value < 0) {
    errorMessage.value = "Please enter a valid number of work hours.";
    return;
  }
  errorMessage.value = "";
  stepOne.value = false;
  stepTwo.value = true;
}

function goToStepThree() {
  // Basic validation for form fields can be added here
  if (!title.value.trim()) {
    errorMessage.value = "Please enter a title.";
    return;
  }
  errorMessage.value = "";
  stepTwo.value = false;
  stepThree.value = true;
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

async function handleCreateListing() {
  try {
    if (pictureFile.value) {
      console.log("Uploaded file:", pictureFileName.value);
    }
    await invoke("create_listing", {
      plate: plate.value.trim(),
      work_hours: workHours.value,
      title: title.value.trim(),
      price: price.value,
      priceType: priceType.value,
      condition: condition.value,
      location: location.value.trim(),
      picture: pictureFileName.value || null,
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
    stepThree.value = false;
    stepFour.value = true;
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
  location.value = "";
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
  successMessage.value = "";
  errorMessage.value = "";
}
</script>

<template>
  <div class="sell-page max-w-xl mx-auto p-6">
    <!-- Step 1: License Plate & Work Hours -->
    <div v-if="stepOne" class="step1">
      <h1 class="text-2xl font-semibold mb-4">Fill in your license plate</h1>
      <div v-if="errorMessage" class="text-red-600 mb-2">{{ errorMessage }}</div>
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
      <button @click="goToStepTwo" class="btn btn-primary">Create Listing</button>
    </div>

    <!-- Step 2: Details Form -->
    <div v-else-if="stepTwo" class="step2">
      <h1 class="text-2xl font-semibold mb-4">Create a New Listing</h1>
      <div v-if="errorMessage" class="text-red-600 mb-2">{{ errorMessage }}</div>
      <form @submit.prevent="goToStepThree" class="sell-form space-y-4">
        <!-- Title -->
        <div class="form-field">
          <label for="title" class="block font-medium mb-1">Title:</label>
          <input id="title" v-model="title" type="text" required class="input input-bordered w-full" />
        </div>
        <!-- Price & Price Type -->
        <div class="grid grid-cols-2 gap-4">
          <div class="form-field">
            <label for="price" class="block font-medium mb-1">Price:</label>
            <input id="price" v-model.number="price" type="number" min="0" class="input input-bordered w-full" />
          </div>
          <div class="form-field">
            <label for="priceType" class="block font-medium mb-1">Price Type:</label>
            <select id="priceType" v-model="priceType" class="select select-bordered w-full">
              <option value="fixed">Fixed</option>
              <option value="negotiable">Negotiable</option>
              <option value="on request">On Request</option>
            </select>
          </div>
        </div>
        <!-- Condition & Location -->
        <div class="grid grid-cols-2 gap-4">
          <div class="form-field">
            <label for="condition" class="block font-medium mb-1">Condition:</label>
            <select id="condition" v-model="condition" class="select select-bordered w-full">
              <option value="new">New</option>
              <option value="good as new">Good as New</option>
              <option value="used">Used</option>
              <option value="heavily used">Heavily Used</option>
            </select>
          </div>
          <div class="form-field">
            <label for="location" class="block font-medium mb-1">Location:</label>
            <input id="location" v-model="location" type="text" required class="input input-bordered w-full" />
          </div>
        </div>
        <!-- Upload & Preview -->
        <div class="form-field mb-4">
          <label for="pictureFile" class="block font-medium mb-1">Upload Picture:</label>
          <label class="btn btn-outline w-full cursor-pointer">
            Choose File
            <input id="pictureFile" type="file" accept="image/*" @change="onFileChange" class="hidden" />
          </label>
          <div v-if="pictureFileName" class="text-sm text-gray-500 mt-1">Selected file: {{ pictureFileName }}</div>
          <img v-if="imagePreview" :src="imagePreview" alt="Image Preview" class="mt-4 max-h-48 w-auto border border-gray-300 rounded" />
        </div>
        <!-- Description -->
        <div class="form-field">
          <label for="description" class="block font-medium mb-1">Description:</label>
          <textarea id="description" v-model="description" class="textarea textarea-bordered w-full" rows="4"></textarea>
        </div>
        <!-- Make & Model -->
        <div class="grid grid-cols-2 gap-4">
          <div class="form-field">
            <label for="make" class="block font-medium mb-1">Make:</label>
            <input id="make" v-model="make" type="text" required class="input input-bordered w-full" />
          </div>
          <div class="form-field">
            <label for="model" class="block font-medium mb-1">Model:</label>
            <input id="model" v-model="model" type="text" required class="input input-bordered w-full" />
          </div>
        </div>
        <!-- Vehicle Type & Year -->
        <div class="grid grid-cols-2 gap-4">
          <div class="form-field">
            <label for="vehicleType" class="block font-medium mb-1">Vehicle Type:</label>
            <input id="vehicleType" v-model="vehicleType" type="text" required class="input input-bordered w-full" />
          </div>
          <div class="form-field">
            <label for="yearOfManufacture" class="block font-medium mb-1">Year of Manufacture:</label>
            <input id="yearOfManufacture" v-model.number="yearOfManufacture" type="number" min="1800" max="2025" required class="input input-bordered w-full" />
          </div>
        </div>
        <!-- Fuel & Weight -->
        <div class="grid grid-cols-2 gap-4">
          <div class="form-field">
            <label for="fuelOrPower" class="block font-medium mb-1">Fuel or Power:</label>
            <input id="fuelOrPower" v-model="fuelOrPower" type="text" required class="input input-bordered w-full" />
          </div>
          <div class="form-field">
            <label for="weight" class="block font-medium mb-1">Weight (kg):</label>
            <input id="weight" v-model.number="weight" type="number" min="0" class="input input-bordered w-full" />
          </div>
        </div>
        <!-- Buttons -->
        <div class="flex justify-between mt-4">
          <button type="button" @click="stepTwo = false; stepOne = true; errorMessage = '';" class="btn btn-ghost">Back</button>
          <button type="submit" class="btn btn-primary">Preview Listing</button>
        </div>
      </form>
    </div>

    <!-- Step 3: Preview Card -->
    <div v-else-if="stepThree" class="step3">
      <h1 class="text-2xl font-semibold mb-4">Preview Your Listing</h1>
      <!-- Card Structure with side-by-side layout -->
      <div class="card bg-base-100 shadow-xl overflow-hidden">
        <div class="flex flex-col md:flex-row">
          <!-- Left: Image -->
          <div class="md:w-1/2 bg-base-200 flex items-center justify-center h-64">
            <img
              v-if="imagePreview"
              :src="imagePreview"
              alt="Preview"
              class="object-cover w-full h-full"
            />
            <div v-else class="text-gray-500">No Image Selected</div>
          </div>
          <!-- Right: Title, description & basic info -->
          <div class="md:w-1/2 p-4 flex flex-col justify-between">
            <div>
              <h2 class="card-title text-xl mb-2">{{ title }}</h2>
              <!-- Separator -->
              <hr class="border-t border-gray-200 mb-2" />
              <p class="text-lg font-semibold mb-1">Price: {{ price || 'N/A' }} ({{ priceType }})</p>
              <!-- Separator -->
              <hr class="border-t border-gray-200 mb-2" />
              <p class="mb-1"><span class="font-medium">Condition:</span> {{ condition }}</p>
              <!-- Separator -->
              <hr class="border-t border-gray-200 mb-2" />
              <p class="mb-1"><span class="font-medium">Location:</span> {{ location }}</p>
              <!-- Separator -->
              <hr class="border-t border-gray-200 mb-2" />
              <p class="mt-2"><span class="font-medium">Description:</span><br />{{ description || 'N/A' }}</p>
            </div>
          </div>
        </div>
        <!-- Practical details below -->
        <div class="card-body border-t">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2"><span class="font-medium w-40">Make:</span><span>{{ make }}</span></div>
              <div class="flex items-center gap-2"><span class="font-medium w-40">Model:</span><span>{{ model }}</span></div>
              <div class="flex items-center gap-2"><span class="font-medium w-40">Vehicle Type:</span><span>{{ vehicleType }}</span></div>
              <div class="flex items-center gap-2"><span class="font-medium w-40">Year of Manufacture:</span><span>{{ yearOfManufacture }}</span></div>
            </div>
            <div class="space-y-1">
              <div class="flex items-center gap-2"><span class="font-medium w-40">Fuel/Power:</span><span>{{ fuelOrPower }}</span></div>
              <div class="flex items-center gap-2"><span class="font-medium w-40">Weight:</span><span>{{ weight }} kg</span></div>
              <div class="flex items-center gap-2"><span class="font-medium w-40">License Plate:</span><span>{{ plate }}</span></div>
              <div class="flex items-center gap-2"><span class="font-medium w-40">Work Hours:</span><span>{{ workHours }} h</span></div>
            </div>
          </div>
        </div>
      </div>
      <!-- Action Buttons -->
      <div class="flex justify-between mt-6">
        <button @click="stepThree = false; stepTwo = true;" class="btn btn-ghost">Edit</button>
        <button @click="handleCreateListing" class="btn btn-primary">Confirm & Submit</button>
      </div>
    </div>

    <!-- Step 4: Confirmation -->
    <div v-else-if="stepFour" class="step4 text-center">
      <h1 class="text-2xl font-semibold mb-4">Listing Submitted!</h1>
      <p class="mb-6">Your listing has been successfully created.</p>
      <div class="flex justify-center gap-4">
        <button @click="router.push('/')" class="btn btn-secondary">Go to Home</button>
        <button @click="stepFour = false; stepOne = true; resetForm()" class="btn btn-primary">Create Another Listing</button>
      </div>
    </div>
  </div>
</template>


