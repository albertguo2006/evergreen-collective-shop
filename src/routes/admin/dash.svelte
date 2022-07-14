<script lang="ts">
	import AuthWall from '$lib/authWall.svelte';

	import type ItemStock from '$lib/ItemStock';

	export let isAuthenticated: boolean;
	export let items: ItemStock[] | null = null;
</script>

{#if isAuthenticated}

	<!-- Create a box around the items -->
	<h2>Remaining stock of items:</h2>
	{#if items !== null}
		{#each items as item}
			<p>{item.name}: {item.remaining}/{item.sold + item.remaining}</p>
		{/each}
	{/if}
{:else}
	<AuthWall />
{/if}
