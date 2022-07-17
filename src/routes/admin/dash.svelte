<script lang="ts">
	import AuthWall from '$lib/authWall.svelte';
	import CheveronDown from '@inqling/svelte-icons/solid/chevron-down.svelte';
	import CheveronRight from '@inqling/svelte-icons/solid/chevron-right.svelte';

	import type ItemStock from '$lib/ItemStock';
	import type { Purchase } from '$lib/Purchase';

	export let isAuthenticated: boolean;
	export let items: ItemStock[] | undefined;
	export let needsContacting: Purchase[] | undefined;
	export let contacted: Purchase[] | undefined;
	export let pickupArranged: Purchase[] | undefined;

	let showNeedsContacting = true;
	let showContacted = true;
	let showPickupArranged = true;
</script>

<svelte:head>
	<title>Admin Dashboard</title>
</svelte:head>

{#if isAuthenticated}
	<div class="flex flex-col xl:flex-row gap-10 justify-center m-4">
		<div
			class="w-11/12 xl:w-1/3 self-center xl:self-auto mt-10 p-4 border-2 border-slate-500 rounded-lg "
		>
			<h2 class="mb-4 border-b-2 border-slate-500">Number of items sold:</h2>

			<div class="grid grid-cols-2">
				<div class="striped">
					{#if items !== undefined && items !== null}
						{#each items as item}
							<div>
								<a href="/admin/item/{item.name}" class="block">
									{item.name}:
								</a>
							</div>
						{/each}
					{/if}
				</div>
				<div class="striped">
					{#if items !== undefined && items !== null}
						{#each items as item}
							<div>
								<a href="/admin/item/{item.name}" class="block">
									{item.sold} /
									{#if item.isUnlimited}
										Unlimited
									{:else}
										{item.sold + item.remainingIfLimited}{/if}
								</a>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
		<div
			class="w-11/12 xl:w-2/3 self-center xl:self-auto xl:mt-24 p-3 border-[3px] border-slate-500 rounded-lg"
		>
			<h2 class="mb-4 border-b-2 border-slate-500">Order status:</h2>
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
							<div>
								<a href="/admin/purchase/{purchase._id}" class="block">
									{purchase.email}
								</a>
							</div>
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
							<div>
								<a href="/admin/purchase/{purchase._id}" class="block">
									{purchase.email}
								</a>
							</div>
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
							<div>
								<a href="/admin/purchase/{purchase._id}" class="block">
									{purchase.email}
								</a>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>
{:else}
	<AuthWall />
{/if}
