<template>
	<div class="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center pointer-events-none">
		<div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl relative pointer-events-auto">
			<div class="card-body">
				<form @submit.prevent="login" method="POST" class="space-y-4">
					<div>
						<label class="floating-label">
							<span>Email</span>
							<input
								name="email"
								type="text"
								required
								placeholder="Email"
								class="input"
							/>
						</label>
					</div>
					<div>
						<label class="floating-label">
							<span>Password</span>
							<input
								name="password"
								type="password"
								required
								placeholder="Password"
								class="input"
							/>
						</label>
					</div>
					<button type="submit" :disabled="loading" class="btn">
						{{ loading ? "Logging in..." : "Login" }}
					</button>
					<p v-if="error" class="text-error">{{ error }}</p>
					<p class="text-sm">
						Don't have an account?
						<NuxtLink to="/identity/register" class="text-accent">Register</NuxtLink>
					</p>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const loading = ref(false)
const error = ref('')

async function login(e: Event) {
	error.value = ''
	loading.value = true

	try {
		await $fetch("/api/login", {
			method: "POST",
			body: new FormData(e.target as HTMLFormElement)
		});

        useToast().triggerToast("Logged in successfully")
		await navigateTo("/")
	} catch (err: any) {
		if (err?.data?.message) {
			error.value = err.data.message
		} else {
			error.value = "Login failed"
		}
	} finally {
		loading.value = false
	}
}
</script>