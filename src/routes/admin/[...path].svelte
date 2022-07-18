<script lang="ts">
	import AuthWall from '$lib/authWall.svelte';
	import PageNotFound from '$lib/PageNotFound.svelte';
import { onMount } from 'svelte';

	let isAuthenticated: boolean;

	onMount(async () => {
		const res = await fetch('/admin/authCheck/', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const json = await res.json();
		isAuthenticated = json.isAuthenticated;
	});
</script>

{#if isAuthenticated == true}
	<PageNotFound />
{:else if isAuthenticated == false}
	<AuthWall />
{/if}
