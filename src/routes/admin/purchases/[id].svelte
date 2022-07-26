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
	import { onMount } from 'svelte';
	import { PurchaseStatus, type Product, type Purchase } from '$lib/Purchase';
	import type { ObjectId } from 'mongodb';
	import type ItemStock from '$lib/ItemStock';

	let isAuthorized: boolean | undefined;
	let originalPurchase: Purchase | undefined;
	let productNames: { objectId: ObjectId; name: string }[] = [];

	let editedName: string | undefined;
	let editedEmail: string | undefined;
	let editedProducts: Product[] | undefined;
	let editedStatus: PurchaseStatus | undefined;

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

		const itemsRes = await fetch('/api/public/items', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const itemsJson = await itemsRes.json();
		const allItems = itemsJson.items as ItemStock[];
		for (const item of allItems) {
			if (item._id !== undefined)
				productNames = [...productNames, { objectId: item._id, name: item.name }];
		}

		const purchaseRes = await fetch(`/api/protected/purchases/${objectId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const purchaseJson = await purchaseRes.json();
		originalPurchase = purchaseJson.purchase as Purchase;

		editedName = originalPurchase.name;
		editedEmail = originalPurchase.email;
		editedProducts = JSON.parse(JSON.stringify(originalPurchase.products)); //Doing this fancy operation gives us a deep copy instead of a reference to the original array
		editedStatus = originalPurchase.status;
	});

	function stringCheck(original: any, edited: string | undefined): boolean {
		return edited !== undefined && edited !== '' && original !== edited;
	}

	function emailCheck(original: any, edited: string | undefined): boolean {
		return (
			//Equiv to stringCheck()
			edited !== undefined &&
			edited !== '' &&
			original !== edited &&
			// Ensure it's an email address
			edited.includes('@') &&
			edited.includes('.') &&
			edited.slice(-1) !== '.'
		);
	}

	function productCheck(original: Product[] | undefined, edited: Product[] | undefined): boolean {
		if (
			typeof original !== 'object' ||
			typeof edited !== 'object' ||
			original === edited ||
			edited.length === 0
		)
			return false;

		for (let i = 0; i < Math.min(original.length, edited.length); i++) {
			const originalItem = original[i];
			const editedItem = edited[i];
			if (originalItem.productId !== editedItem.productId) return true;
			else if (originalItem.quantity !== editedItem.quantity) return true;
		}
		return true;
	}

	function statusCheck(original: any, edited: PurchaseStatus | undefined) {
		return edited !== undefined && original !== edited;
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
		if (stringCheck(originalPurchase?.name, editedName)) body.name = editedName;
		if (emailCheck(originalPurchase?.email, editedEmail)) body.email = editedEmail;
		if (productCheck(originalPurchase?.products, editedProducts)) {
			body.products = editedProducts;

			for (
				let i = 0;
				i < Math.min(originalPurchase!.products!.length, editedProducts!.length);
				++i
			) {
				const originalItem = originalPurchase!.products![i];
				const editedItem = editedProducts![i];

				// Change sales in the stock items

				if (originalItem.productId === editedItem.productId) {
					const itemToReduce = await fetch(`/api/public/items/${originalItem.productId}`, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json'
						}
					});
					const itemToReduceJson = (await itemToReduce.json()) as ItemStock;

					await fetch(`/api/protected/items/${originalItem.productId}`, {
						method: 'PATCH',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							sold: itemToReduceJson.sold - originalItem.quantity
						})
					});

					const itemToIncrease = await fetch(`/api/public/items/${editedItem.productId}`, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json'
						}
					});
					const itemToIncreaseJson = (await itemToIncrease.json()) as ItemStock;

					await fetch(`/api/protected/items/${editedItem.productId}`, {
						method: 'PATCH',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							sold: itemToIncreaseJson.sold + editedItem.quantity
						})
					});
				} else if (originalItem.quantity !== editedItem.quantity) {
					const difference = editedItem.quantity - originalItem.quantity; // Can be a negative number

					const itemToChange = await fetch(`/api/public/items/${editedItem.productId}`, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json'
						}
					});

					const itemToChangeJson = (await itemToChange.json()) as ItemStock;

					await fetch(`/api/protected/items/${editedItem.productId}`, {
						method: 'PATCH',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							sold: itemToChangeJson.sold + difference
						})
					});
				}
			}
		}
		if (statusCheck(originalPurchase?.status, editedStatus)) body.status = editedStatus;

		const update = await fetch(`/api/protected/purchases/${objectId}`, {
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
	<title>Manage {originalPurchase?.name ?? 'unknown'}'s purchase</title>
</svelte:head>

{#if isAuthorized === true}
	{#if originalPurchase !== undefined && editedName !== undefined && editedEmail !== undefined && editedProducts !== undefined && editedStatus !== undefined}
		<div class="flex flex-col 2xl:flex-row gap-10 justify-center mx-4 mt-10">
			<div
				class="flex flex-col w-11/12 self-center 2xl:self-auto text-xs md:text-xl 2xl:text-2xl p-4 justify-center min-w-max"
			>
				<div class="grid grid-cols-2 mt-5 border-2 p-4 border-slate-500 dark:border-slate-400 rounded-lg text-slate-900 dark:text-slate-50">
					<div class="m-2 space-y-2">
						<!-- `&nbsp` is the code for a whitespace character, and `&emsp` is the code for 4 spaces -->
						<h2>Internal Object id:</h2>
						<h2>
							Purchaser Name{#if stringCheck(originalPurchase.name, editedName)}
								&nbsp(was {originalPurchase.name}){/if}:
						</h2>
						<h2>
							Email address{#if emailCheck(originalPurchase.email, editedEmail)}
								&nbsp(was {originalPurchase.email}){/if}:
						</h2>
						<h2>
							Status{#if stringCheck(originalPurchase.status, editedStatus)}
								&nbsp(was {originalPurchase.status}){/if}:
						</h2>
						<br />
						<h2>Products:</h2>
						{#each editedProducts as product, index}
							<h2 class="">&nbsp&nbsp{index}:</h2>
							<h2>
								&emsp Product Name:{#if product.productId !== originalPurchase.products[index].productId}
									&nbsp (was {productNames.find((object) => object.objectId === product.productId)
										?.name})
								{/if}
							</h2>
							<h2>&emsp Price in Cents At Sale:</h2>
							<h2>&emsp Quantity:</h2>
						{/each}
					</div>

					<div class="m-2 space-y-2">
						<h2>{originalPurchase._id}</h2>
						<h2><input type="text" bind:value={editedName} class="bg-gray-300 dark:bg-gray-500" /></h2>
						<h2><input type="email" bind:value={editedEmail} class="bg-gray-300 dark:bg-gray-500" /></h2>
						<h2>
							<select bind:value={editedStatus} class="bg-gray-300 dark:bg-gray-500">
								<option value={PurchaseStatus.NeedsContacting}>Needs Contacting</option>
								<option value={PurchaseStatus.Contacted}>Contacted</option>
								<option value={PurchaseStatus.PickupArranged}>Pickup Arranged</option>
								<option value={PurchaseStatus.Completed}>Completed</option>
							</select>
						</h2>
						<!-- Formatting breaks -->
						<br />
						<br />

						{#each editedProducts as product}
							<br />
							<h2>
								<select bind:value={product.productId} class="bg-gray-300 dark:bg-gray-500">
									<!-- Ensure that the first value presented is always the default value -->
									<option value={product.productId}
										>{productNames.find((object) => object.objectId === product.productId)
											?.name}</option
									>

									{#each productNames as productName}
										{#if productName.objectId !== product.productId}
											<!-- Don't duplicate the default value-->
											<option value={productName.objectId}>{productName.name}</option>
										{/if}
									{/each}
								</select>
							</h2>
							<h2>
								<input type="number" bind:value={product.priceCentsAtSale} class="bg-gray-300 dark:bg-gray-500" />
							</h2>
							<h2><input type="number" bind:value={product.quantity} class="bg-gray-300 dark:bg-gray-500" /></h2>
						{/each}
					</div>
				</div>

				{#if stringCheck(originalPurchase.name, editedName) || emailCheck(originalPurchase.email, editedEmail) || productCheck(originalPurchase.products, editedProducts) || stringCheck(originalPurchase.status, editedStatus)}
					<button
						type="submit"
						class="block h-12 mt-2 rounded-lg bg-red-500"
						on:click={submitChanges}>Submit changes</button
					>
				{/if}
				
				{#if successfullyUpdated === true}
					<p class="text-emerald-700 dark:text-green-500">Updated Successful</p>
				{:else if successfullyUpdated === false}
					<p class="text-red-600 dark:text-red-500">Update Failed</p>
				{/if}
			</div>
		</div>
	{/if}
{:else if isAuthorized === false}
	<AuthWall />
{/if}
