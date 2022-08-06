<script lang="ts">
	import type ItemStock from "$lib/ItemStock";
	import { onMount } from "svelte";

	let itemsToSell: ItemStock[] | undefined;

	onMount(async () => {
		const itemRes = await fetch("/api/public/items", {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		});

		const itemsJson = await itemRes.json();
		itemsToSell = itemsJson.items;
		itemsToSell?.sort((a, b) => a.name.localeCompare(b.name)); // Sorts by name alphabetically
	});
</script>

<svelte:head>
	<title>Shop</title>
	<meta charset="utf-8" />
	<meta name="description" content="The landing page for Evergreen Collective's shop" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<h1 class="text-2xl font-bold text-stone-900 dark:text-stone-50 mx-auto pt-10 text-center">
	The Evergreen Collective Foundation Shop. Take a look round :)
</h1>

<div class="flex flex-col py-10 items-center">
	<div
		class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 w-4/5"
	>
		{#if itemsToSell !== undefined}
			{#each itemsToSell as item}
				<a href="/item/{item._id}" class="w-11/12 h-11/12 hover:w-full hover:h-full duration-300">
					<div
						class="p-6 mb-6 rounded-2xl space-y-4 hover:bg-gray-300 dark:hover:bg-gray-600 duration-75"
					>
						<img alt="Picture of {item.name}" src="/images/{item._id}.jpeg" class="h-48 mx-auto" />
						<h2 class="text-stone-900 dark:text-stone-50 font-bold capitalize text-center">
							{item.name}
						</h2>
					</div>
				</a>
			{/each}
		{/if}
	</div>
</div>
