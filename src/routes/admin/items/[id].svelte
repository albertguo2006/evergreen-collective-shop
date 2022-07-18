<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit';

	let objectId: string;

	export const load: Load = async ({ params }) => {
		objectId = params['id'];	
		return {
			status: 200
		};
	};
</script>

<script lang="ts">
	import AuthWall from '$lib/authWall.svelte';
	import type ItemStock from '$lib/ItemStock';
	import { onMount } from 'svelte';

	let isAuthenticated: boolean | undefined;
	let originalItem: ItemStock | undefined;

	let editedPrice: number | undefined;
	let editedUnlimited: boolean | undefined;
	let editedStock: number | undefined | null;
	let editedSold: number | undefined;

	onMount(async () => {
		const authCheck = await fetch('/api/public/authCheck', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const authJson = await authCheck.json();
		isAuthenticated = authJson.isAuthenticated;

		if (!isAuthenticated) return; // No need to fetch info that we won't use

		const itemRes = await fetch(`/api/public/items/${objectId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const json = await itemRes.json();
		originalItem = json.item;

		editedPrice = originalItem?.currentPriceCents;
		editedUnlimited = originalItem?.isUnlimited;
		editedStock = originalItem?.originalStockIfLimited;
		editedSold = originalItem?.sold;
	});

	function submitChanges() {
		const confirmed = confirm(
			'Are you sure that you want to submit these changes? This action is irreversible.'
		);
		if (!confirmed) return;
	}
</script>

<svelte:head>
	<title>Manage {originalItem?.name ?? 'item'}</title>
</svelte:head>

{#if isAuthenticated == true}
	{#if originalItem !== undefined && editedPrice !== undefined && editedUnlimited !== undefined && editedStock !== undefined && editedSold !== undefined}
		<div class="flex flex-col xl:flex-row gap-10 justify-center mx-4 mt-10">
			<div class="flex flex-col w-11/12 xl:w-1/3 self-center xl:self-auto p-4">
				<img
					src="/images/{objectId}.png"
					alt="A picture of a(n) {originalItem.name}"
					class="border-4 border-slate-500 rounded self-stretch"
				/>
			</div>
			<div
				class="flex flex-col w-11/12 xl:w-1/2 self-center xl:self-auto p-4 text-xl justify-center"
			>
				<div class="grid grid-cols-2 mt-5 border-2 p-4 border-slate-500 rounded-lg">
					<div class="m-2">
						<h2>Interal Object id:</h2>
						<h2>Item Name</h2>
						<h2>Number of {originalItem.name}s sold:</h2>
						<h2>Has unlimited stock:</h2>
						{#if !editedUnlimited}
							<h2>Original Stock:</h2>
						{/if}
						<h2>Current price in cents:</h2>
					</div>
					<!-- <h2>Internal Object Id: {item._id}</h2>
					<h2>Name: {item.name}</h2> -->

					<div class="m-2">
						<h2>{originalItem._id}</h2>
						<h2>{originalItem.name}</h2>
						<h2><input type="number" bind:value={editedSold} class="bg-gray-300" /></h2>
						<h2><input type="checkbox" bind:checked={editedUnlimited} class="h-5" /></h2>
						{#if !editedUnlimited}
							<h2>
								<input type="number" bind:value={editedStock} class="bg-gray-300" />
							</h2>
						{/if}
						<h2>
							<input type="number" bind:value={editedPrice} class="bg-gray-300" />
						</h2>
					</div>
				</div>
				{#if (typeof editedSold === 'number' && editedSold !== originalItem.sold) || (editedUnlimited && editedUnlimited !== originalItem.isUnlimited) || (!editedUnlimited && typeof editedStock === 'number' && editedUnlimited != originalItem.isUnlimited) || (typeof editedStock === 'number' && !editedUnlimited && editedStock !== originalItem.originalStockIfLimited) || (typeof editedPrice === 'number' && editedPrice !== originalItem.currentPriceCents)}
					// Need a special check to ensure that when edited unlimited is false, the stock number is
					non-null
					<button
						type="submit"
						class="block h-12 mt-2 rounded-lg bg-red-500"
						on:click={submitChanges}>Submit changes</button
					>
				{/if}
			</div>
		</div>
	{/if}
{:else if isAuthenticated == false}
	<AuthWall />
{/if}

<style>
	h2 {
		margin: 0.5rem; /*Equivilant to `margin-2`*/
	}
</style>
