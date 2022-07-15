<script lang="ts">
	import AuthWall from '$lib/authWall.svelte';

	import type ItemStock from '$lib/ItemStock';
	import type { Purchase } from '$lib/Purchase';
	import { onDestroy } from 'svelte';

	export let isAuthenticated: boolean;
	export let items: ItemStock[] | undefined;
	export let needsContacting: Purchase[] | undefined;
	export let contacted: Purchase[] | undefined;
	export let pickupArranged: Purchase[] | undefined;
</script>

{#if isAuthenticated}
	<!-- Create a box around the status -->
	<table>
		<tr>
			<th>Needs Contacting</th>
			<th>Contacted</th>
			<th>Pickup Arranged</th>
		</tr>
		<tr>
			<td
				>{#if needsContacting === undefined} "unknown" {:else} {needsContacting.length}{/if}</td
			>
			<td
				>{#if contacted === undefined} "unknown" {:else} {contacted.length}{/if}</td
			>
			<td
				>{#if pickupArranged === undefined} "unknown" {:else} {pickupArranged.length} {/if}</td
			>
		</tr>
	</table>

	<!-- Create a box around the items -->
	<h2>Number of items sold:</h2>
	{#if items !== undefined && items !== null}
		{#each items as item}
			<p>
				{item.name}: {item.remainingIfLimited}/
				{#if item.isUnlimited}
					Unlimited
				{:else}
					{item.sold + item.remainingIfLimited}{/if}
			</p>
		{/each}
	{/if}
{:else}
	<AuthWall />
{/if}
