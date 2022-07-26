<script lang="ts">
	import AuthWall from "$lib/AuthWall.svelte";
	import ChevronDown from "@inqling/svelte-icons/solid/chevron-down.svelte";
	import ChevronRight from "@inqling/svelte-icons/solid/chevron-right.svelte";

	import type ItemStock from "$lib/ItemStock";
	import type { Purchase } from "$lib/Purchase";
	import { onMount } from "svelte";

	// While the following values could be obtained by `export const`, it is more consistent to actually work if we use onMount()
	let isAuthorized: boolean | undefined;
	let items: ItemStock[] | undefined;
	let needsContacting: Purchase[] | undefined;
	let contacted: Purchase[] | undefined;
	let pickupArranged: Purchase[] | undefined;
	let completed: Purchase[] | undefined;

	let showNeedsContacting = true;
	let showContacted = true;
	let showPickupArranged = true;
	let showCompleted = true;

	let itemFilter = "";
	let purchaseFilter = "";

	onMount(async () => {
		const res = await fetch("/api/protected/dash", {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		});
		const json = await res.json();
		isAuthorized = json.isAuthorized;
		if (!isAuthorized) return; // No need to fetch info that we won't use, and there is probably no other data as well
		items = json.items;
		items?.sort((a, b) => a.name.localeCompare(b.name));
		needsContacting = json.needsContacting;
		contacted = json.contacted;
		pickupArranged = json.pickupArranged;
		completed = json.completed;
	});
</script>

<svelte:head>
	<title>Admin Dashboard</title>
</svelte:head>

<!-- NOTE: The values {itemFilter} and {purchaseFilter} are supposed to be lowercase, enforced by the `lowercase` property in their input field's css. 
There is no manual conversion to lowercase for the filters (but there is for the values that are being checked) -->

{#if isAuthorized === true}
	<div class="flex flex-col xl:flex-row gap-10 justify-center m-4">
		<div
			class="w-11/12 xl:w-1/3 h-max self-center xl:self-auto mt-10 p-4 border-2 border-slate-500 dark:border-slate-400 rounded-lg"
		>
			<h2
				class="mb-4 border-b-2 border-slate-500 dark:border-slate-400 text-slate-900 dark:text-slate-50"
			>
				Number of items sold:
			</h2>
			<input
				type="text"
				placeholder="Search filter"
				class="w-full h-8 p-2 mb-2 border-2 border-slate-500 dark:border-slate-400 rounded-lg lowercase"
				bind:value={itemFilter}
			/>

			<div class="grid grid-cols-2 gap-y-2 text-slate-900 dark:text-slate-100">
				{#if items !== undefined && items !== null}
					{#each items as item}
						{#if itemFilter.length === 0 || (itemFilter.length > 0 && item.name
									.toLowerCase()
									.includes(itemFilter))}
							<div class="hover:bg-gray-300 dark:hover:bg-zinc-600">
								<a href="/admin/items/{item._id}" class="block">
									{item.name}:
								</a>
								<a href="/admin/items/{item._id}" class="block">
									{item.sold} /
									{#if item.isUnlimited}
										Unlimited
									{:else}
										{item.originalStockIfLimited}{/if}
								</a>
							</div>
						{/if}
					{/each}
				{/if}
			</div>
		</div>
		<div
			class="w-11/12 xl:w-2/3 h-max self-center xl:self-auto xl:mt-24 p-3 border-[3px] border-slate-500 dark:border-slate-400 rounded-lg"
		>
			<h2
				class="mb-4 border-b-2 border-slate-500 dark:border-slate-400 text-slate-900 dark:text-slate-50"
			>
				Order status:
			</h2>
			<input
				type="text"
				placeholder="Search filter"
				class="w-full h-8 p-2 mb-2 border-2 border-slate-500 dark:border-slate-400 rounded-lg lowercase"
				bind:value={purchaseFilter}
			/>

			<div class="grid grid-cols-1 xl:grid-cols-2 gap-2 text-slate-900 dark:text-slate-100">
				<div>
					<button on:click={() => (showNeedsContacting = !showNeedsContacting)}>
						{#if showNeedsContacting}
							<ChevronDown class="h-5" />
						{:else}
							<ChevronRight class="h-5" />
						{/if}
						Needs Contacting:
					</button>

					{#if showNeedsContacting && needsContacting !== undefined && needsContacting !== null}
						{#each needsContacting as purchase}
							{#if purchaseFilter.length === 0 || (purchaseFilter.length > 0 && (purchase.name
										.toLowerCase()
										.includes(purchaseFilter) || purchase.email
											.toLowerCase()
											.includes(purchaseFilter)))}
								<div>
									<a
										href="/admin/purchases/{purchase._id}"
										class="hover:bg-gray-300 dark:hover:bg-zinc-600 block"
									>
										{purchase.email}
									</a>
								</div>
							{/if}
						{/each}
					{/if}
				</div>

				<div>
					<button on:click={() => (showContacted = !showContacted)}>
						{#if showContacted}
							<ChevronDown class="h-5" />
						{:else}
							<ChevronRight class="h-5" />
						{/if}
						Contacted:
					</button>

					{#if showContacted && contacted !== undefined && contacted !== null}
						{#each contacted as purchase}
							{#if purchaseFilter.length === 0 || (purchaseFilter.length > 0 && (purchase.name
										.toLowerCase()
										.includes(purchaseFilter) || purchase.email
											.toLowerCase()
											.includes(purchaseFilter)))}
								<div>
									<a
										href="/admin/purchases/{purchase._id}"
										class="hover:bg-gray-300 dark:hover:bg-zinc-600 block"
									>
										{purchase.email}
									</a>
								</div>
							{/if}
						{/each}
					{/if}
				</div>

				<div>
					<button on:click={() => (showPickupArranged = !showPickupArranged)}>
						{#if showPickupArranged}
							<ChevronDown class="h-5" />
						{:else}
							<ChevronRight class="h-5" />
						{/if}
						Pickup Arranged:
					</button>

					{#if showPickupArranged && pickupArranged !== undefined && pickupArranged !== null}
						{#each pickupArranged as purchase}
							{#if purchaseFilter.length === 0 || (purchaseFilter.length > 0 && (purchase.name
										.toLowerCase()
										.includes(purchaseFilter) || purchase.email
											.toLowerCase()
											.includes(purchaseFilter)))}
								<div>
									<a
										href="/admin/purchases/{purchase._id}"
										class="hover:bg-gray-300 dark:hover:bg-zinc-600 block"
									>
										{purchase.email}
									</a>
								</div>
							{/if}
						{/each}
					{/if}
				</div>
				<div>
					<button on:click={() => (showCompleted = !showCompleted)}>
						{#if showCompleted}
							<ChevronDown class="h-5" />
						{:else}
							<ChevronRight class="h-5" />
						{/if}
						Completed:
					</button>

					{#if showCompleted && completed !== undefined && completed !== null}
						{#each completed as purchase}
							{#if purchaseFilter.length === 0 || (purchaseFilter.length > 0 && (purchase.name
										.toLowerCase()
										.includes(purchaseFilter) || purchase.email
											.toLowerCase()
											.includes(purchaseFilter)))}
								<div>
									<a
										href="/admin/purchases/{purchase._id}"
										class="hover:bg-gray-300 dark:hover:bg-zinc-600 block"
									>
										{purchase.email}
									</a>
								</div>
							{/if}
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>
{:else if isAuthorized === false}
	<AuthWall />
{/if}
