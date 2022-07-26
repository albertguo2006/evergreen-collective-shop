<script lang="ts">
	let enteredUsername: string;
	let enteredPassword: string;

	let successfulLogin: boolean | null = null;

	const attemptLogin = async () => {
		successfulLogin = null; // Reset state, so that message is also reset
		const sendLoginToBackend = await fetch('/api/public/adminLogin/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username: enteredUsername,
				password: enteredPassword
			})
		});

		switch (sendLoginToBackend.status) {
			case 200:
				successfulLogin = true;
				break;
			default:
				successfulLogin = false;
				break;
		}

		/* 
        Use href instead of replace, cause user should be able to see login page
        As an added benefit, this page does not auto redirect when logged in, so the user won"t be stuck in a reload loop if they use the back button
        */
		if (successfulLogin == true) window.location.href = '/admin/dash';
	};

	function loginByEnterKey(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			attemptLogin();
		}
	}
</script>

<svelte:head>
	<title>Admin Login</title>
	<meta charset="utf-8" />
	<meta name="description" content="The admin page for svelte" />
</svelte:head>

<!-- Edited from https://tailwindcomponents.com/component/simple-login-page -->

<div class="flex flex-col items-center justify-center mt-20">
		<div class="font-medium self-center text-xl sm:text-3xl text-gray-800 dark:text-gray-100">Welcome Back</div>
		<div class="mt-4 self-center text-xl sm:text-sm text-gray-800 dark:text-gray-100">
			Much admin work to do today?
		</div>

		<div class="mt-10">
			<div class="flex flex-col mb-5">
				<p class="mb-1 tracking-wide text-gray-600 dark:text-gray-300">Username:</p>
				<input
					type="text"
					placeholder="Username"
					class="text-sm placeholder-gray-500 dark:placeholder-gray-400 pl-10 pr-4 rounded-lg border border-gray-400 dark:border-gray-50 py-2"
					bind:value={enteredUsername}
					on:keydown={loginByEnterKey}
				/>
			</div>
			<div class="flex flex-col mb-5">
				<p class="mb-1 tracking-wide text-gray-600 dark:text-gray-300">Password:</p>
				<input
					type="password"
					placeholder="Password"
					class="text-sm placeholder-gray-500 dark:placeholder-gray-400 pl-10 pr-4 rounded-lg border border-gray-400 dark:border-gray-50 py-2"
					bind:value={enteredPassword}
					on:keydown={loginByEnterKey}
				/>
			</div>

			<div class="flex w-full">
				<button
					type="submit"
					class="flex mt-2 items-center justify-center focus:outline-none text-white text-sm sm:text-base bg-blue-500 hover:bg-blue-600 rounded-lg py-2 w-full transition duration-150 ease-in"
					on:click={attemptLogin}
				>
					<span class="mr-2 uppercase">Sign In</span>
					<span>
						<svg
							class="h-6 w-6"
							fill="none"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</span>
				</button>
			</div>
		</div>
	</div>
	<div class="flex justify-center items-center mt-6">
		{#if successfulLogin === true}
			<p class="text-emerald-700 dark:text-green-500">Login successful, redirecting...</p>
		{:else if successfulLogin === false}
			<p class="text-red-600 dark:text-red-500">Incorrect username or password, please try again</p>
		{/if}
</div>
