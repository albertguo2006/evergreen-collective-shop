<script lang="ts">
	import '../app.css';
	import Fa from 'svelte-fa';
	import {
		faFacebook,
		faGithub,
		faInstagram,
		faTiktok,
		faTwitter
	} from '@fortawesome/free-brands-svg-icons';
	import { faEnvelope, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
</script>

<!-- We need to include the body tag so that we can specify that it is flex. This allows the footer to always be placed to the bottom of the page -->
<body class="flex flex-col h-screen bg-slate-200">
	<!-- Image for shopping cart. We **could** use a fontawesome image, but I personally prefer this one from Google. No noticable difference to user -->
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0"
	/>

	<nav class="grid grid-rows-1 grid-cols-8 place-items-center py-4 bg-slate-50">
		<a href="/" class="justify-self-start ml-[2rem]">
			<!-- Set a minimum size so that the icon does not get shrunk out of existance -->
			<img
				src="src/lib/assets/icon.png"
				alt="The logo for Expedition Cedar"
				class="min-w-[3rem] min-h-[3rem] w-24"
			/>
		</a>

		<a href="https://expeditioncedar.ca" class="col-start-6 col-span-2 justify-self-end">
			Main Site
		</a>

		<a href="/cart" class="col-start-8 justify-self-center">
			<span class="block material-symbols-outlined"> shopping_cart </span>
		</a>
	</nav>

	<slot />

	<!-- mt-auto, allowing with flex on the body, allows the footer to be placed at the bottom of the page -->
	<!-- Am I overusing grids here? Maybe, but they get the job done :p -->
	<footer class="mt-auto grid place-items-center bg-zinc-900">
		<div class="grid grid-cols-1 place-items-center my-5">
			<!-- For some reason, the <Fa/> icon isn't cenetered if it's not a child of something like a grid -->
			<Fa icon={faPaperPlane} size="2x" class="mb-2 mt-5 text-slate-50" />
			<h2 class="text-slate-50 text-2xl">Contact Us!</h2>
		</div>
		<div class="grid grid-cols-6 place-items-center gap-x-5 my-3">
			<a href="https://www.instagram.com/expeditioncedarorg/">
				<Fa icon={faInstagram} size="1.25x" class="text-slate-50" />
			</a>

			<a href="https://twitter.com/cedarorg">
				<Fa icon={faTwitter} size="1.25x" class="text-slate-50" />
			</a>

			<a href="https://www.facebook.com/ExpeditionCedarOrg">
				<Fa icon={faFacebook} size="1.25x" class="text-slate-50" />
			</a>

			<a href="https://www.tiktok.com/@expeditioncedarorg">
				<Fa icon={faTiktok} size="1.25x" class="text-slate-50" />
			</a>

			<a href="malito:expeditioncedarorganization@gmail.com">
				<Fa icon={faEnvelope} size="1.25x" class="text-slate-50" />
			</a>

			<a href="https://github.com/cloudate9/expedition-cedar-shop">
				<Fa icon={faGithub} size="1.25x" class="text-slate-50 break" />
			</a>
		</div>
		<div class="my-5">
			<p class="text-slate-50">Copyright &copy; Expedition Cedar 2022; AGPLv3</p>
		</div>
	</footer>
</body>
