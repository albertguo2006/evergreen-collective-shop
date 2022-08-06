<script lang="ts">
	import { CartItem, lastPurchasedItems } from "$lib/cartItems";
	import { fade } from "svelte/transition";
	import PageNotFound from "$lib/PageNotFound.svelte";
	import { onMount } from "svelte";
	import type ItemStock from "$lib/ItemStock";

	let availableItems: ItemStock[] | undefined;

	onMount(async () => {
		const itemsRes = await fetch("/api/public/items", {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		});
		const itemsJson = await itemsRes.json();
		availableItems = itemsJson.items;
	});

	function getRef(cartItem: CartItem): ItemStock | undefined {
		return availableItems?.find((item) => item._id == cartItem.itemId);
	}
</script>

<svelte:head>
	{#if $lastPurchasedItems.length > 0}
		<title>Sucessful Purchase</title>
	{/if}
</svelte:head>

{#if availableItems !== undefined}
	{#if $lastPurchasedItems.length > 0}
		<div class="flex flex-col w-full gap-y-4 p-4 py-10">
			<div class="grid grid-flow-col justify-items-center">
				<h2 class="text-stone-900 dark:text-stone-50 font-bold text-lg">Successful Purchase</h2>
			</div>
			{#each $lastPurchasedItems as cartItem (cartItem.itemId)}
				<a
					href="/item/{cartItem.itemId}"
					class="flex flex-col md:flex-row gap-x-8 p-4 mx-8 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 duration-300"
				>
					<!-- In all child elements of the anchor tag, ensure to preventDefault on all children than are
			meant to be clicked (i.e. quantity and remove buttons). -->

					{#if getRef(cartItem) !== undefined}
						<div class="grid grid-flow-col w-full md:w-auto">
							<img
								alt="Picture of {getRef(cartItem)?.name}"
								src="/images/{cartItem.itemId}.jpeg"
								class="h-48 w-48 rounded mx-auto md:mx-0"
							/>
						</div>

						<div class="grid grid-flow-col lg:grid-cols-2 w-3/4 mt-5 md:mt-1">
							<div class="grid grid-row-1">
								<div class="mb-8">
									<h2 class="text-stone-900 dark:text-stone-50 font-bold capitalize">
										{getRef(cartItem)?.name}
									</h2>

									<!-- Purposefully kept to only change on large instead of medium -->
									<h2
										class="h-8 w-24 rounded-lg text-stone-900 dark:text-stone-50 justify-self-end lg:hidden"
									>
										Quantity: {cartItem.quantity}
									</h2>
								</div>
							</div>
							<h2
								class="h-8 w-24 rounded-lg text-stone-900 dark:text-stone-50 justify-self-end hidden lg:block"
							>
								Quantity: {cartItem.quantity}
							</h2>
						</div>
					{/if}
				</a>
			{/each}
		</div>
	{:else}
		<PageNotFound /> <!-- Nothing to show, so give a page not found >:) -->
	{/if}
{/if}
