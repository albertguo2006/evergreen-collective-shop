<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit';

	let isAuthenticated: boolean;
	export const load: Load = async ({ session }) => {
		isAuthenticated = session.authenticated;
		return {
			status: 200
		};
	};
</script>

<script lang="ts">


</script>


{#if isAuthenticated}
	<p>Authenticated</p>
{:else}
	<p>Not Authenticated</p>
{/if}
