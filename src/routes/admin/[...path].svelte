<script lang="ts">
	import AuthWall from '$lib/AuthWall.svelte';
	import PageNotFound from '$lib/PageNotFound.svelte';
import { onMount } from 'svelte';

	let isAuthorized: boolean;

	onMount(async () => {
		const res = await fetch('/api/public/authCheck', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const json = await res.json();
		isAuthorized = json.isAuthorized;
	});
</script>

{#if isAuthorized === true}
	<PageNotFound />
{:else if isAuthorized === false}
	<AuthWall />
{/if}
