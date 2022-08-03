<script lang="ts">
	import { cart, CartItem } from "$lib/cartItems";
	import { fade, fly } from "svelte/transition";
	import { flip } from "svelte/animate";
	import {
		loadScript,
		type CreateOrderRequestBody,
		type PayPalButtonsComponent,
		type PayPalNamespace
	} from "@paypal/paypal-js";
	import type ItemStock from "$lib/ItemStock";
	import { onMount } from "svelte";
	import XCircle from "@inqling/svelte-icons/outline/x-circle.svelte";

	let availableItems: ItemStock[] | undefined;
	let payPal: PayPalNamespace | null | undefined;
	let payPalButton: PayPalButtonsComponent | undefined;

	let name: string | undefined;
	let email: string | undefined;
	let confirmEmail: string | undefined;
	let purchasedItems: CartItem[] | undefined;

	let successfulPurchase: boolean = false;

	onMount(async () => {
		const itemsRes = await fetch("/api/public/items", {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		});
		const itemsJson = await itemsRes.json();
		availableItems = itemsJson.items;

		const payPalRes = await fetch("/api/public/payment/payPalClientId", {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		});
		const payPalJson = await payPalRes.json();
		const payPalClientId = payPalJson.clientId;

		payPal = await loadScript({ "client-id": payPalClientId!, currency: "CAD" });
		payPalButton = payPal?.Buttons?.({
			createOrder: async function (data, actions) {
				purchasedItems = $cart;
				const orderRes = await fetch("/api/public/payment/createOrder", {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						cart: purchasedItems
					})
				});

				const orderJson = await orderRes.json();

				const order: CreateOrderRequestBody = orderJson.order;
				return actions.order.create(order);
			},

			onApprove: async function (data, actions) {
				const validateRes = await fetch("/api/public/payment/validatePurchase", {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						onApproveActions: actions,
						name,
						email
					})
				});

				const validateJson = await validateRes.json();
				if (validateJson.success) {
					cart.set([]); // Clear the cart
					successfulPurchase = true;
				}
			}
		});
		payPalButton?.render("#paypal-button-container");
	});

	function getRef(cartItem: CartItem): ItemStock | undefined {
		return availableItems?.find((item) => item._id == cartItem.itemId);
	}

	function validateNaturalNumber(n: number): boolean {
		return n > 0 && !n.toString().includes(".");
	}

	function isPurchaseValid(cartItem: CartItem): boolean {
		const itemModel = getRef(cartItem);

		if (itemModel === undefined) {
			return false;
		}

		if (
			!itemModel.isUnlimited &&
			cartItem.quantity > itemModel.originalStockIfLimited! - itemModel.sold
		) {
			return false;
		}

		return validateNaturalNumber(cartItem.quantity);
	}

	function allPurchasesValid(cart: CartItem[]): boolean {
		for (const cartItem of cart) {
			if (!isPurchaseValid(cartItem)) {
				return false;
			}
		}
		return true;
	}

	function minimumPurchaseMet(cart: CartItem[]): boolean {
		return (
			cart
				.map((cartItem) => (getRef(cartItem)?.currentPriceCents ?? 0) * cartItem.quantity)
				.reduce((a, b) => a + b, 0) >= 100
		);
	}

	function allowCheckout(cart: CartItem[]): boolean {
		// Ensure minimum purchase of $1 so that we don't end up paying our payment processor more than what we actually earn
		return allPurchasesValid(cart) && minimumPurchaseMet(cart);
	}

	function emailCheck(potentialEmail: string | undefined): boolean {
		return (
			potentialEmail !== undefined &&
			potentialEmail !== "" &&
			// Ensure it's an email address
			potentialEmail.includes("@") &&
			potentialEmail.includes(".") &&
			potentialEmail.slice(-1) !== "."
		);
	}
</script>

<svelte:head>
	<title>Cart</title>
	<meta name="description" content="View Cart and Checkout" />
</svelte:head>

<div class="flex flex-col md:flex-row py-10">
	{#if successfulPurchase === true && purchasedItems}
		<div class="flex flex-col w-full gap-y-4">
			<div class="grid grid-flow-col justify-items-center">
				<h2 class="text-stone-900 dark:text-stone-50">Successful Purchase</h2>
			</div>
			{#each purchasedItems as cartItem (cartItem.itemId)}
				<a
					in:fade
					out:fly|local={{ x: -600, duration: 1000 }}
					animate:flip={{ duration: 1000 }}
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
								class="h-48 w-48 rounded"
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
										class="bg-gray-200 h-8 w-12 rounded-lg text-center justify-self-end lg:hidden"
									>
										Quantity: {cartItem.quantity}
									</h2>
								</div>
							</div>
							<h2
								class="bg-gray-200 h-8 w-12 rounded-lg text-center justify-self-end hidden lg:block"
							>
								Quantity: {cartItem.quantity}
							</h2>
						</div>
					{:else}
						<!-- Remove the invalid item -->
						{cart.update((c) => c.filter((item) => item.itemId !== cartItem.itemId))}
					{/if}
				</a>
			{/each}
		</div>
	{:else if availableItems !== undefined}
		{#if $cart.length <= 0}
			<h1 class="text-2xl font-bold text-stone-900 dark:text-stone-50 text-center mx-auto">
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
						class="flex flex-col md:flex-row gap-x-8 p-4 mx-8 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 duration-300"
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
									<XCircle class="h-8 text-slate-700 dark:text-slate-200" />
								</button>
							</div>

							<div class="grid grid-flow-col lg:grid-cols-2 w-3/4 mt-5 md:mt-1">
								<div class="grid grid-row-1">
									<div class="mb-8">
										<h2 class="text-stone-900 dark:text-stone-50 font-bold capitalize">
											{getRef(cartItem)?.name}
										</h2>

										<h3 class="text-stone-900 dark:text-stone-50 font-semibold">
											{((getRef(cartItem)?.currentPriceCents ?? NaN) / 100).toLocaleString(
												"en-CA",
												{
													style: "currency",
													currency: "CAD"
												}
											)}
										</h3>

										<!-- Input purposefully kept to only change on large instead of medium -->
										<input
											type="number"
											bind:value={cartItem.quantity}
											on:click|preventDefault
											class="bg-gray-200 h-8 w-12 rounded-lg text-center justify-self-end lg:hidden"
										/>
									</div>

									<div class="self-end mb-1">
										{#if getRef(cartItem)?.isUnlimited !== true && (getRef(cartItem)?.originalStockIfLimited ?? NaN - (getRef(cartItem)?.sold ?? NaN)) < cartItem.quantity}
											<h2 class="text-red-600 dark:text-red-500">
												Only {getRef(cartItem)?.originalStockIfLimited ??
													NaN - (getRef(cartItem)?.sold ?? NaN)} in stock
											</h2>
										{:else if getRef(cartItem)?.isUnlimited === true || (getRef(cartItem)?.originalStockIfLimited ?? NaN - (getRef(cartItem)?.sold ?? NaN)) >= cartItem.quantity}
											{#if validateNaturalNumber(cartItem.quantity)}
												<h2 class="text-green-600 dark:text-green-500">Available to purchase</h2>
											{:else}
												<h2 class="text-red-600 dark:text-red-500">Invalid quantity</h2>
											{/if}
										{/if}
									</div>
								</div>
								<input
									type="number"
									bind:value={cartItem.quantity}
									on:click|preventDefault
									class="bg-gray-200 h-8 w-12 rounded-lg text-center justify-self-center hidden lg:block"
								/>

								<button
									class="h-8 w-12 rounded-lg text-center justify-self-end hidden md:block"
									on:click|preventDefault={() => {
										cart.update((c) => c.filter((item) => item.itemId !== cartItem.itemId));
									}}
								>
									<XCircle class="h-8 text-slate-700 dark:text-slate-200" />
								</button>
							</div>
						{:else}
							<!-- Remove the invalid item -->
							{cart.update((c) => c.filter((item) => item.itemId !== cartItem.itemId))}
						{/if}
					</a>
				{/each}
			</div>
			<div class="flex flex-col h-max md:w-5/12 gap-y-4">
				<div
					class="flex flex-col hover:bg-gray-300 dark:hover:bg-zinc-600 duration-300 rounded-lg m-4 p-4 gap-y-4 md:gap-y-8"
				>
					<h2 class="font-semibold text-slate-900 dark:text-slate-50">Order summary:</h2>
					<div class="grid grid-cols-2 gap-y-2">
						{#each $cart as cartItem (cartItem.itemId)}
							{#if getRef(cartItem)}
								<!-- WARNING: The below sign is not the 'x' character. It is the '×' character. -->
								{#if isPurchaseValid(cartItem)}
									<h2 class="text-slate-900 dark:text-slate-50">
										{cartItem.quantity} × {getRef(cartItem)?.name}
									</h2>
									<h2 class="text-slate-900 dark:text-slate-50 justify-self-end">
										{(
											(cartItem.quantity * (getRef(cartItem)?.currentPriceCents ?? NaN)) /
											100
										).toLocaleString("en-CA", {
											style: "currency",
											currency: "CAD"
										})}
									</h2>
								{:else}
									<h2 class="text-red-600 dark:text-red-500 col-span-2">
										Invalid quantity for {getRef(cartItem)?.name}
									</h2>
								{/if}
							{/if}
						{/each}
						{#if allowCheckout($cart)}
							<h2 class="text-slate-900 dark:text-slate-50">Total:</h2>
							<h2 class="text-slate-900 dark:text-slate-50 justify-self-end">
								{(
									$cart.reduce((subTotal, item) => {
										return subTotal + item.quantity * (getRef(item)?.currentPriceCents ?? NaN);
									}, 0) / 100
								).toLocaleString("en-CA", {
									style: "currency",
									currency: "CAD"
								})}
							</h2>
						{:else if allPurchasesValid($cart) && !minimumPurchaseMet($cart)}
							<h2 class="text-red-600 dark:text-red-500 col-span-2">
								Minimum purchase of {Number(1).toLocaleString("en-CA", {
									style: "currency",
									currency: "CAD"
								})} not met
							</h2>
							<h2 class="text-red-600 dark:text-red-500 col-span-2">
								We require a minimum purchase as our payment processors take a small cut of sales,
								and it probably isn't ideal for us to be losing money while trying to accept
								donations
							</h2>
						{/if}
					</div>

					<div class="flex flex-col rounded-lg m-4 p-4 gap-y-4">
						{#if allowCheckout($cart)}
							<h2 class="font-semibold text-slate-900 dark:text-slate-50">
								Enter your email. We need it to contact you about pickup of your items
							</h2>
							{#if email !== undefined}
								{#if !emailCheck(email)}
									<h2 class="text-red-600 dark:text-red-500 text-center">Invalid email</h2>
								{:else if confirmEmail !== undefined && email !== confirmEmail}
									<h2 class="text-red-600 dark:text-red-500 text-center">
										Email addresses do not match
									</h2>
								{/if}
							{/if}
							<input
								type="text"
								bind:value={name}
								placeholder="Name"
								class="bg-gray-400 dark:bg-gray-800 placeholder-slate-900 dark:placeholder-slate-50 text-slate-900 dark:text-slate-50 rounded-md text-center"
							/>
							<input
								type="email"
								bind:value={email}
								placeholder="Email"
								class="bg-gray-400 dark:bg-gray-800 placeholder-slate-900 dark:placeholder-slate-50 text-slate-900 dark:text-slate-50 rounded-md text-center"
							/>
							<input
								type="email"
								bind:value={confirmEmail}
								placeholder="Confirm your email"
								class="bg-gray-400 dark:bg-gray-800 placeholder-slate-900 dark:placeholder-slate-50 text-slate-900 dark:text-slate-50 rounded-md text-center"
							/>
						{/if}
					</div>

					{#if allowCheckout($cart)}
						<div id="paypal-button-container" class="rounded-lg border-0" />
					{:else}
						<button
							class="w-full hover:opacity-90 p-2 m-2 rounded-lg place-self-center bg-red-500 text-slate-50 self-center"
							disabled
						>
							Invalid selection
						</button>
					{/if}
				</div>
			</div>
		{/if}
	{/if}
</div>
