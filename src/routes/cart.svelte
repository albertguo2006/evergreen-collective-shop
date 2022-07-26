<script lang="ts">
	import { cart, CartItem } from '$lib/cartItems';
	import { fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import type ItemStock from '$lib/ItemStock';
	import { onMount } from 'svelte';
	import XCircle from '@inqling/svelte-icons/outline/x-circle.svelte';

	let availableItems: ItemStock[] | undefined;
	let isAllPurchasesValid = false;

	onMount(async () => obtainAvailableItems());

	async function obtainAvailableItems() {
		const itemRes = await fetch('/api/public/items', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const json = await itemRes.json();
		availableItems = json.items;
		allPurchasesValid();
	}

	function getRef(cartItem: CartItem): ItemStock | undefined {
		return availableItems?.find((item) => item._id == cartItem.itemId);
	}

	function validateNaturalNumber(n: number): boolean {
		return n > 0 && !n.toString().includes('.');
	}

	function allPurchasesValid() {
		console.log('yes');
		for (const cartItem of $cart) {
			const itemModel = getRef(cartItem);

			if (itemModel === undefined) {
				isAllPurchasesValid = false;
				return;
			}

			if (
				!itemModel.isUnlimited &&
				cartItem.quantity > itemModel.originalStockIfLimited! - itemModel.sold
			) {
				isAllPurchasesValid = false;
				return;
			}

			if (!validateNaturalNumber(cartItem.quantity)) {
				isAllPurchasesValid = false;
				return;
			}
		}
		isAllPurchasesValid = true;
	}
</script>

<svelte:head>
	<title>Cart</title>
</svelte:head>

<div class="flex flex-col py-10">
	{#if availableItems !== undefined}
		{#if $cart.length <= 0}
			<h1 class="text-2xl font-bold text-stone-900 text-center">
				Your cart is empty. Explore some items to add to your cart?
			</h1>
		{:else}
			<div class="flex flex-col w-full md:w-7/12 gap-y-4">
				{#each $cart as cartItem (cartItem.itemId)}
					<a
						in:fade
						out:fly|local={{ x: -600, duration: 1000 }}
						animate:flip={{ duration: 1000 }}
						href="/item/{cartItem.itemId}"
						class="flex flex-col md:flex-row gap-x-8 p-4 mx-8 rounded-lg hover:bg-gray-300 duration-300"
					>
						<!-- In all child elements of the anchor tag, ensure to preventDefault on all children than are
					meant to be clicked (i.e. quantity and remove buttons). -->

						{#if getRef(cartItem) !== undefined}
							<div class="grid grid-flow-col w-full md:w-auto">
								<img
									alt="Picture of {getRef(cartItem)?.name}"
									src="/images/{cartItem.itemId}.jpeg"
									class="h-48 w-48 rounded"
								/>
								<button
									class="h-8 w-12 rounded-lg text-center justify-self-end md:hidden"
									on:click|preventDefault={() => {
										cart.update((c) => c.filter((item) => item.itemId !== cartItem.itemId));
									}}
								>
									<XCircle class="h-8 text-slate-700" />
								</button>
							</div>

							<div class="grid grid-flow-col w-3/4 mt-5 md:mt-1">
								<div class="grid grid-row-1">
									<div class="mb-8">
										<h2 class="text-stone-900 font-bold capitalize">
											{getRef(cartItem)?.name}
										</h2>

										<h3 class="text-stone-900 font-semibold">
											{((getRef(cartItem)?.currentPriceCents ?? NaN) / 100).toLocaleString(
												'en-CA',
												{
													style: 'currency',
													currency: 'CAD'
												}
											)}
										</h3>

										<!-- Input purposefully kept to only change on large instead of medium -->
										<input
											type="number"
											bind:value={cartItem.quantity}
											on:click|preventDefault={allPurchasesValid}
											class="bg-gray-200 h-8 w-12 rounded-lg text-center justify-self-end lg:hidden"
										/>
									</div>

									<div class="self-end mb-1">
										{#if getRef(cartItem)?.isUnlimited !== true && (getRef(cartItem)?.originalStockIfLimited ?? NaN - (getRef(cartItem)?.sold ?? NaN)) < cartItem.quantity}
											<h2 class="text-red-600">
												Only {getRef(cartItem)?.originalStockIfLimited ??
													NaN - (getRef(cartItem)?.sold ?? NaN)} in stock
											</h2>
										{:else if getRef(cartItem)?.isUnlimited === true || (getRef(cartItem)?.originalStockIfLimited ?? NaN - (getRef(cartItem)?.sold ?? NaN)) >= cartItem.quantity}
											{#if validateNaturalNumber(cartItem.quantity)}
												<h2 class="text-green-600">Available to purchase</h2>
											{:else}
												<h2 class="text-red-600">Invalid quantity</h2>
											{/if}
										{/if}
									</div>
								</div>
								<input
									type="number"
									bind:value={cartItem.quantity}
									on:click|preventDefault={allPurchasesValid}
									class="bg-gray-200 h-8 w-12 rounded-lg text-center justify-self-end hidden lg:block"
								/>

								<button
									class="h-8 w-12 rounded-lg text-center justify-self-end hidden md:block"
									on:click|preventDefault={() => {
										cart.update((c) => c.filter((item) => item.itemId !== cartItem.itemId));
									}}
								>
									<XCircle class="h-8 text-slate-700" />
								</button>
							</div>
						{:else}
							<!-- Remove the invalid item -->
							{cart.update((c) => c.filter((item) => item.itemId !== cartItem.itemId))}
						{/if}
					</a>
				{/each}
			</div>
			<div class="flex w-5/12">
				{#if isAllPurchasesValid}
					put checkout bar here
				{:else}
					sad
				{/if}
			</div>
		{/if}
	{/if}
</div>
