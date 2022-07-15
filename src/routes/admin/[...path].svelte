<script lang="ts">
	import AuthWall from '$lib/authWall.svelte';
	import PageNotFound from '$lib/PageNotFound.svelte';

	export let isAuthenticated: boolean;
</script>

{#if isAuthenticated}
	<PageNotFound />
{:else}
	<AuthWall />
{/if}
