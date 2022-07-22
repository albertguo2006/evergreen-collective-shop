<script lang="ts">
	import '../app.css';
	import ChatAlt2 from '@inqling/svelte-icons/outline/chat-alt-2.svelte';
	import Facebook from '@inqling/svelte-icons/brand/facebook.svelte';
	import GitHub from '@inqling/svelte-icons/brand/github.svelte';
	import Instagram from '@inqling/svelte-icons/brand/instagram.svelte';
	import Mail from '@inqling/svelte-icons/outline/mail.svelte';
	import ShoppingCart from '@inqling/svelte-icons/outline/shopping-cart.svelte';
	import TikTok from '@inqling/svelte-icons/brand/tiktok.svelte';
	import Twitter from '@inqling/svelte-icons/brand/twitter.svelte';

	import logo from "$lib/assets/logo.png";
</script>

<!-- We need to include the body tag so that we can specify that it is flex. This allows the footer to always be placed to the bottom of the page -->
<div class="flex flex-col h-screen bg-slate-200">
	<nav
		class="grid grid-rows-1 grid-cols-8 place-items-center py-4 bg-slate-50 text-zinc-900 font-bold"
	>
		<a href="/" class="justify-self-start ml-[2rem]">
			<!-- Set a minimum size so that the icon does not get shrunk out of existance -->
			<img
				src={logo}
				alt="The logo for Evergreen Collective"
				class="min-w-[3rem] min-h-[3rem] w-24"
			/>
		</a>

		<a
			href="https://expeditioncedar.ca"
			class="col-start-6 col-span-2 justify-self-end text-xl hover:text-indigo-400"
		>
			Main Site
		</a>

		<a href="/cart" class="col-start-8 justify-self-center">
			<ShoppingCart class="h-10 hover:text-indigo-400" />
		</a>
	</nav>

	<slot />

	<!-- mt-auto, allowing with flex on the body, allows the footer to be placed at the bottom of the page -->
	<!-- Am I overusing grids here? Maybe, but they get the job done :p -->
	<footer class="mt-auto grid place-items-center bg-zinc-900">
		<div class="grid grid-cols-1 place-items-center my-5">
			<!-- For some reason, the <Fa/> icon isn't cenetered if it's not a child of something like a grid -->
			<ChatAlt2 class="h-10 mb-2 mt-5 text-slate-50" />
			<h2 class="text-slate-50 text-2xl">Contact Us!</h2>
		</div>
		<div class="grid grid-cols-6 place-items-center gap-x-5 my-3">
			<a href="https://www.instagram.com/evergreencollectivefoundation/">
				<Instagram class="h-5 text-slate-50 hover:text-indigo-200" />
			</a>

			<a href="https://twitter.com/cedarorg">
				<Twitter class="h-5 text-slate-50 hover:text-indigo-200" />
			</a>

			<a href="https://www.facebook.com/EvergreenCollectiveFoundation">
				<Facebook class="h-5 text-slate-50 hover:text-indigo-200" />
			</a>

			<a href="https://www.tiktok.com/@expeditioncedarorg">
				<TikTok class="h-5 text-slate-50 hover:text-indigo-200" />
			</a>

			<a href="malito:evergreencollectivefound@gmail.com">
				<Mail class="h-6 text-slate-50 hover:text-indigo-200" />
			</a>

			<a href="https://github.com/cloudate9/evergreen-collective-shop">
				<GitHub class="h-5 text-slate-50 hover:text-indigo-200" />
			</a>
		</div>
		<div class="my-5">
			<p class="text-slate-50">Copyright &copy; Evergreen Collective Foundation 2022; AGPLv3</p>
		</div>
	</footer>
</div>
