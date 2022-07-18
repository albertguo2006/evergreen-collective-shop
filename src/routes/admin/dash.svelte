<script lang="ts">
	import AuthWall from '$lib/authWall.svelte';
	import CheveronDown from '@inqling/svelte-icons/solid/chevron-down.svelte';
	import CheveronRight from '@inqling/svelte-icons/solid/chevron-right.svelte';

	import type ItemStock from '$lib/ItemStock';
	import type { Purchase } from '$lib/Purchase';
	import { onMount } from 'svelte';

	// While the following values could be obtained by `export const`, it is more consistent to actually work if we use onMount()
	let isAuthenticated: boolean | undefined;
	let items: ItemStock[] | undefined;
	let needsContacting: Purchase[] | undefined;
	let contacted: Purchase[] | undefined;
	let pickupArranged: Purchase[] | undefined;

	let showNeedsContacting = true;
	let showContacted = true;
	let showPickupArranged = true;

	let itemFilter = '';
	let purchaseFilter = '';

	onMount(async () => {
		const res = await fetch('/admin/dashInfo/', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const json = await res.json();
		isAuthenticated = json.isAuthenticated;
		items = json.items;
		needsContacting = json.needsContacting;
		contacted = json.contacted;
		pickupArranged = json.pickupArranged;
	});
</script>

<svelte:head>
	<title>Admin Dashboard</title>
</svelte:head>

<!-- NOTE: The values {itemFilter} and {purchaseFilter} are supposed to be lowercase, enforced by the `lowercase` property in their input field's css. 
There is no manual conversion to lowercase for the filters (but there is for the values that are being checked) -->

{#if isAuthenticated == true}
	<div class="flex flex-col xl:flex-row gap-10 justify-center m-4">
		<div
			class="w-11/12 xl:w-1/3 self-center xl:self-auto mt-10 p-4 border-2 border-slate-500 rounded-lg"
		>
			<h2 class="mb-4 border-b-2 border-slate-500">Number of items sold:</h2>
			<input
				type="text"
				placeholder="Search filter"
				class="w-full h-8 p-2 mb-2 border-2 border-slate-500 rounded-lg lowercase"
				bind:value={itemFilter}
			/>

			<div class="grid grid-cols-2">
				<div class="striped">
					{#if items !== undefined && items !== null}
						{#each items as item}
							{#if itemFilter.length == 0 || (itemFilter.length > 0 && item.name
										.toLowerCase()
										.includes(itemFilter))}
								<div>
									<a href="/admin/item/{item.name}" class="block">
										{item.name}:
									</a>
								</div>
							{/if}
						{/each}
					{/if}
				</div>
				<div class="striped">
					{#if items !== undefined && items !== null}
						{#each items as item}
							{#if itemFilter.length == 0 || (itemFilter.length > 0 && item.name
										.toLowerCase()
										.includes(itemFilter))}
								<div>
									<a href="/admin/item/{item.name}" class="block">
										{item.sold} /
										{#if item.isUnlimited}
											Unlimited
										{:else}
											{item.sold + item.remainingIfLimited}{/if}
									</a>
								</div>
							{/if}
						{/each}
					{/if}
				</div>
			</div>
		</div>
		<div
			class="w-11/12 xl:w-2/3 self-center xl:self-auto xl:mt-24 p-3 border-[3px] border-slate-500 rounded-lg"
		>
			<h2 class="mb-4 border-b-2 border-slate-500">Order status:</h2>
			<input
				type="text"
				placeholder="Search filter"
				class="w-full h-8 p-2 mb-2 border-2 border-slate-500 rounded-lg lowercase"
				bind:value={purchaseFilter}
			/>

			<div class="grid grid-cols-1 xl:grid-cols-3 gap-2">
				<div class="striped">
					<button on:click={() => (showNeedsContacting = !showNeedsContacting)}>
						{#if showNeedsContacting}
							<CheveronDown class="h-5" />
						{:else}
							<CheveronRight class="h-5" />
						{/if}
						Needs Contacting:
					</button>

					{#if showNeedsContacting && needsContacting !== undefined && needsContacting !== null}
						{#each needsContacting as purchase}
							{#if purchaseFilter.length == 0 || (purchaseFilter.length > 0 && (purchase.name
										.toLowerCase()
										.includes(purchaseFilter) || purchase.email
											.toLowerCase()
											.includes(purchaseFilter)))}
								<div>
									<a href="/admin/purchase/{purchase._id}" class="block">
										{purchase.email}
									</a>
								</div>
							{/if}
						{/each}
					{/if}
				</div>

				<div class="striped-alt">
					<button on:click={() => (showContacted = !showContacted)}>
						{#if showContacted}
							<CheveronDown class="h-5" />
						{:else}
							<CheveronRight class="h-5" />
						{/if}
						Contacted:
					</button>

					{#if showContacted && contacted !== undefined && contacted !== null}
						{#each contacted as purchase}
							{#if purchaseFilter.length == 0 || (purchaseFilter.length > 0 && (purchase.name
										.toLowerCase()
										.includes(purchaseFilter) || purchase.email
											.toLowerCase()
											.includes(purchaseFilter)))}
								<div>
									<a href="/admin/purchase/{purchase._id}" class="block">
										{purchase.email}
									</a>
								</div>
							{/if}
						{/each}
					{/if}
				</div>

				<div class="striped">
					<button on:click={() => (showPickupArranged = !showPickupArranged)}>
						{#if showPickupArranged}
							<CheveronDown class="h-5" />
						{:else}
							<CheveronRight class="h-5" />
						{/if}
						Pickup Arranged:
					</button>

					{#if showPickupArranged && pickupArranged !== undefined && pickupArranged !== null}
						{#each pickupArranged as purchase}
							{#if purchaseFilter.length == 0 || (purchaseFilter.length > 0 && (purchase.name
										.toLowerCase()
										.includes(purchaseFilter) || purchase.email
											.toLowerCase()
											.includes(purchaseFilter)))}
								<div>
									<a href="/admin/purchase/{purchase._id}" class="block">
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
{:else if isAuthenticated == false}
	<AuthWall />
{/if}
