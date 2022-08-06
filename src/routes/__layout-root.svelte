<script lang="ts">
	import "../app.css";
	import { theme } from "$lib/theme";

	$: themeCSS = $theme === "light" ? "" : "dark";
</script>

<div class={themeCSS}>
	<!-- Reset to almost a blank slate. Admins don't need things like the cart or the socials footer -->
	<div class="min-h-screen bg-slate-200 dark:bg-zinc-700">
		<slot />
	</div>
</div>
