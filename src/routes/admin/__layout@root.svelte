<script lang="ts" context="module">
	export const prerender = true;
</script>

<script lang="ts">
	import Moon from '@inqling/svelte-icons/outline/moon.svelte';
	import Sun from '@inqling/svelte-icons/outline/sun.svelte';
	import { theme } from '$lib/theme';
</script>

<nav class="grid grid-cols-3 h-20 content-center bg-neutral-700 dark:bg-neutral-800 text-slate-100">
	<a href="/admin/dash" class="col-start-2 place-self-center hover:text-indigo-200">
		<h2 class="text-xl font-extrabold text-center">Admin Panel</h2>
	</a>
	<div class="col-start-3 grid grid-flow-col">
		<button
			on:click={() => theme.update(() => ($theme === 'light' ? 'dark' : 'light'))}
			class="place-self-end"
		>
			{#if $theme === 'light'}
				<Sun class="h-8 hover:text-indigo-400" />
			{:else}
				<Moon class="h-8 hover:text-indigo-400" />
			{/if}
		</button>
		<a href="/" class="place-self-end text-right text-lg mr-6 hover:text-indigo-200"
			>Back to user site</a
		>
	</div>
</nav>
<slot />
