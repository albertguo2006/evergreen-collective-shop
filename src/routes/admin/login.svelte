<script lang="ts" context="module">
	export const prerender = true;
</script>

<script lang="ts">
	let enteredUsername: string;
	let enteredPassword: string;

	let succesfulLogin: boolean | undefined;

	const attemptLogin = async () => {
		const sendLoginToBackend = await fetch('/admin/attemptLogin', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Username: enteredUsername,
				Password: enteredPassword
			}
		});

		switch (sendLoginToBackend.status) {
			case 200:
				succesfulLogin = true;
				break;
			case 403:
				succesfulLogin = false;
				break;
			// No default case, what would succefulLogin's value change to anyway?
		}

		/* 
        Use href instead of replace, cause user should be able to see login page
        As an added benefit, this page does not auto redirect when logged in, so the user won"t be stuck in a reload loop if they use the back button
        */
		if (succesfulLogin == true) window.location.href = '/admin/dash';
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

{#if succesfulLogin === true}
	<p>Login successful, redirecting...</p>
{:else if succesfulLogin === false}
	<p>Incorrect username or password, please try again</p>
{:else}
	<p>Please enter your username and password</p>
{/if}

<input
	type="text"
	placeholder="Username"
	bind:value={enteredUsername}
	on:keydown={loginByEnterKey}
/>
<input
	type="password"
	placeholder="Password"
	bind:value={enteredPassword}
	on:keydown={loginByEnterKey}
/>

<button on:click={attemptLogin}>Login</button>
