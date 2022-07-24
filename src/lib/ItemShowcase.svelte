<script lang="ts">
	import { cart, CartItem } from '$lib/cartItems';
	import type ItemStock from '$lib/ItemStock';
	import Minus from '@inqling/svelte-icons/solid/minus.svelte';
	import { onMount } from 'svelte';
	import Plus from '@inqling/svelte-icons/solid/plus.svelte';
	import SvelteMarkdown from 'svelte-markdown';

	export let objectId: string;
	export let descriptionMarkdown: string;

	let item: ItemStock | undefined;
	let quantityString = '1';
	let itemAddedToCart: boolean | undefined;

	onMount(async () => {
		const itemRes = await fetch(`/api/public/items/${objectId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const json = await itemRes.json();
		item = json.item;
	});

	function validateStringAsNaturalNumber(toValidate: any): boolean {
		const potentialNumber = Number(toValidate);
		return (
			typeof potentialNumber == 'number' &&
			potentialNumber > 0 && // Don't allow negative numbers
			!potentialNumber.toString().includes('.') // Don't allow decimals
		);
	}

	function incrementQuantity() {
		const potentialNumber = Number(quantityString);
		if (typeof potentialNumber == 'number') {
			quantityString = (potentialNumber + 1).toString();
		}
	}

	function decrementQuantity() {
		const potentialNumber = Number(quantityString);
		if (typeof potentialNumber == 'number') {
			quantityString = (potentialNumber - 1).toString();
		}
	}

	function checkout() {
		if (item !== undefined && item._id !== undefined) {
			const productId = item._id;
			cart.update((c) => {
				const cartItems: CartItem[] = [];
				let added = false;
				for (const cartItem of c) {
					if (item?._id == cartItem.itemId) {
						cartItems.push(new CartItem(productId, cartItem.quantity + Number(quantityString)));
						added = true;
					} else cartItems.push(cartItem);
				}
				if (!added) cartItems.push(new CartItem(productId, Number(quantityString)));
				return cartItems;
			});
			itemAddedToCart = true;
			window.location.href = '/cart';
		} else {
			itemAddedToCart = undefined; // Reset state for flicker effect
			itemAddedToCart = false;
		}
	}
</script>

<svelte:head>
	<title>Item: {item?.name ?? 'unknown'}</title>
</svelte:head>

<div class="flex flex-col py-8 px-5">
	{#if item !== undefined}
		<h2 class="font-bold capitalize mb-8">{item.name}</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			<div>
				<img
					alt="Picture of {item.name}"
					src="/images/{item._id}.png"
					class=" rounded-lg mx-auto"
				/>
			</div>
			<div class="flex flex-col">
				<div class="grid grid-cols-2">
					<h2 class="text-xl capitalize">{item.name}</h2>
					<h2 class="place-self-end text-gray-500 text-lg font-extrabold">
						{(item.currentPriceCents / 100).toLocaleString('en-CA', {
							style: 'currency',
							currency: 'CAD'
						})}
					</h2>
				</div>

				<div class="flex hover:border-2 border-gray-600 duration-75 rounded-lg mt-12">
					<button type="button" class="flex-initial w-1/6 rounded-md" on:click={decrementQuantity}
						><Minus class="h-8" /></button
					>

					<input
						type="text"
						bind:value={quantityString}
						class="bg-gray-300 w-4/6 h-12 rounded-xl text-center"
					/>

					<button type="button" class="flex-initial w-1/6 rounded-md" on:click={incrementQuantity}
						><Plus class="h-8" /></button
					>
				</div>

				{#if itemAddedToCart}
					<h2 class="text-center text-emerald-500 mt-4">Added to cart!</h2>
				{:else if itemAddedToCart === false}
					<h2 class="text-center text-red-500 mt-4">Failed to add to cart!</h2>
				{/if}

				{#if validateStringAsNaturalNumber(quantityString)}
					<button
						class="w-full hover:opacity-90 p-2 m-4 rounded-lg place-self-center bg-indigo-500 text-slate-50 self-center"
						on:click={checkout}>Add To Cart</button
					>
				{:else}
					<p class="text-center text-red-500 mt-4">Invalid quantity</p>
					<button
						class="w-full hover:opacity-90 p-2 m-2 rounded-lg place-self-center bg-red-500 text-slate-50 self-center"
						disabled>Add To Cart</button
					>
				{/if}

				<div class="my-5 border-t-2 border-gray-500" />

				<div>
					<h2 class="font-semibold mb-2">Description</h2>

					<SvelteMarkdown source={descriptionMarkdown} />
				</div>
			</div>
		</div>
	{/if}
</div>
