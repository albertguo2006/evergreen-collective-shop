<script lang="ts" context="module">
	import AuthWall from '$lib/authWall.svelte';
	import type { Load } from '@sveltejs/kit';

    let errorCode: number | undefined | null;

	export const load: Load = async ({ status }) => {
        errorCode = status;
        return {
            code: 200
        }
    };
</script>

{#if errorCode === 401 || errorCode === 403}
<AuthWall />
{:else if errorCode !== undefined && errorCode !== null}
<article class="h-screen grid grid-column-1 place-items-center text-center">
	<h1 class="top-1/4 text-5xl font-extrabold text-stone-900 ">An unexpected error occurred</h1>
</article>
{/if}
