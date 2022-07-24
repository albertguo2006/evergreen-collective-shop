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
	import AuthWall from '$lib/AuthWall.svelte';
	import type ItemStock from '$lib/ItemStock';
	import { onMount } from 'svelte';

	let isAuthorized: boolean | undefined;
	let originalItem: ItemStock | undefined;

	let editedName: string | undefined;
	let editedPrice: number | undefined;
	let editedUnlimited: boolean | undefined;
	let editedStock: number | undefined | null;
	let editedSold: number | undefined;

	let successfullyUpdated: boolean | undefined;

	onMount(async () => {
		const authCheck = await fetch('/api/public/authCheck', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const authJson = await authCheck.json();
		isAuthorized = authJson.isAuthorized;

		if (!isAuthorized) return; // No need to fetch info that we won't use

		const itemRes = await fetch(`/api/public/items/${objectId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const json = await itemRes.json();
		originalItem = json.item;

		editedName = originalItem?.name;
		editedPrice = originalItem?.currentPriceCents;
		editedUnlimited = originalItem?.isUnlimited;
		editedStock = originalItem?.originalStockIfLimited;
		editedSold = originalItem?.sold;
	});

	function stringCheck(original: any, edited: any): boolean {
		return typeof edited == 'string' && edited !== '' && original !== edited;
	}

	function wholeNumberCheck(original: any, edited: any): boolean {
		return (
			typeof edited == 'number' &&
			original !== edited &&
			edited >= 0 && // Don't allow negative numbers
			!edited.toString().includes('.') // Don't allow decimals
		);
	}

	function isUnlimitedCheck(original: any, edited: any, stock: any): boolean {
		if (!(typeof edited == 'boolean')) return false;

		if (edited) {
			return original !== edited;
		} else {
			return (
				original !== edited &&
				typeof stock == 'number' &&
				stock > 0 &&
				!stock.toString().includes('.')
			);
		}
	}

	async function submitChanges() {
		const confirmed = confirm(
			'Are you sure that you want to submit these changes? The consequences may be irreversible.'
		);
		if (!confirmed) return;
		if (objectId === undefined) {
			successfullyUpdated = false;
			return;
		}

		let body: any = {}; //We don't really have any way to type this
		if (stringCheck(originalItem?.name, editedName)) body.name = editedName;
		if (wholeNumberCheck(originalItem?.currentPriceCents, editedPrice))
			body.currentPriceCents = editedPrice;
		if (isUnlimitedCheck(originalItem?.isUnlimited, editedUnlimited, editedStock))
			body.isUnlimited = editedUnlimited;
		if (body.isUnlimited) {
			body.originalStockIfLimited = null;
		} else if (wholeNumberCheck(originalItem?.originalStockIfLimited, editedStock)) {
			body.originalStockIfLimited = editedStock;
		}
		if (wholeNumberCheck(originalItem?.sold, editedSold)) body.sold = editedSold;

		const update = await fetch(`/api/protected/items/${objectId}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});

		successfullyUpdated = update.ok;
		if (successfullyUpdated) window.location.reload();
	}
</script>

<svelte:head>
	<title>Manage {originalItem?.name ?? 'item'}</title>
</svelte:head>

{#if isAuthorized == true}
	{#if originalItem !== undefined && editedPrice !== undefined && editedUnlimited !== undefined && editedStock !== undefined && editedSold !== undefined}
		<div class="flex flex-col 2xl:flex-row gap-10 justify-center mx-4 mt-10">
			<div class="flex flex-col w-11/12 2xl:w-1/3 self-center 2xl:self-auto p-4">
				<img
					src="/images/{objectId}.jpeg"
					alt="A picture of a(n) {originalItem.name}"
					class="border-4 border-slate-500 rounded h-5/12 self-center"
				/>
			</div>
			<div
				class="flex flex-col w-11/12 2xl:w-1/2 self-center 2xl:self-auto text-xs md:text-xl 2xl:text-2xl p-4 justify-center min-w-max"
			>
				<div class="grid grid-cols-2 mt-5 border-2 p-4 border-slate-500 rounded-lg">
					<div class="m-2 space-y-2">
						<!-- `&nbsp` is the code for a whitespace character -->
						<h2>Interal Object id:</h2>
						<h2>
							Item Name{#if stringCheck(originalItem.name, editedName)}
								&nbsp(was {originalItem.name}){/if}:
						</h2>
						<h2>
							Current price in cents{#if wholeNumberCheck(originalItem.currentPriceCents, editedPrice)}
								&nbsp(was {originalItem.currentPriceCents}){/if}:
						</h2>
						<h2>
							Has unlimited stock{#if isUnlimitedCheck(originalItem.isUnlimited, editedUnlimited, editedStock)}
								&nbsp(was {originalItem.isUnlimited}){/if}:
						</h2>

						{#if !editedUnlimited}
							<h2>
								Original Stock{#if wholeNumberCheck(originalItem.originalStockIfLimited, editedStock)}
									&nbsp(was {originalItem.originalStockIfLimited}){/if}:
							</h2>
						{/if}
						<h2>
							Number of {originalItem.name}s sold{#if wholeNumberCheck(originalItem.sold, editedSold)}
								&nbsp(was {originalItem.sold}){/if}:
						</h2>
					</div>

					<div class="m-2 space-y-2">
						<h2>{originalItem._id}</h2>
						<h2><input type="text" bind:value={editedName} class="bg-gray-300" /></h2>
						<h2><input type="number" bind:value={editedPrice} class="bg-gray-300" /></h2>
						<h2><input type="checkbox" bind:checked={editedUnlimited} class="h-5" /></h2>
						{#if !editedUnlimited}
							<h2>
								<input type="number" bind:value={editedStock} class="bg-gray-300" />
							</h2>
						{/if}
						<h2><input type="number" bind:value={editedSold} class="bg-gray-300" /></h2>
					</div>
				</div>

				{#if stringCheck(originalItem.name, editedName) || wholeNumberCheck(originalItem.currentPriceCents, editedPrice) || isUnlimitedCheck(originalItem.isUnlimited, editedUnlimited, editedStock) || (!isUnlimitedCheck && wholeNumberCheck(originalItem?.originalStockIfLimited, editedStock)) || wholeNumberCheck(originalItem.sold, editedSold)}
					<button
						type="submit"
						class="block h-12 mt-2 rounded-lg bg-red-500"
						on:click={submitChanges}>Submit changes</button
					>
				{/if}
				{#if successfullyUpdated === true}
					<p class="text-emerald-700">Updated Successful</p>
				{:else if successfullyUpdated === false}
					<p class="text-red-600">Update Failed</p>
				{/if}
			</div>
		</div>
	{/if}
{:else if isAuthorized == false}
	<AuthWall />
{/if}
