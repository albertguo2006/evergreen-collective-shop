<script lang="ts" context="module">
	export const prerender = true;
</script>

<svelte:head>
    <title>Admin Unauthorized</title>
</svelte:head>

<article class="h-screen grid grid-column-1 place-items-center text-center">
	<div class="top-1/4 text-3xl font-extrabold text-stone-900 dark:text-stone-50 mx-5">
		<h2>Oops, you've stumbled onto an admin page.</h2>
		<h2>Should you wish to go back to the main shop, click <a href="/" class="text-blue-600 dark:text-blue-300">here</a>.</h2>
	</div>
	<a href="/admin/login" class="top-3/4 dark:text-stone-50"><p>Are you an admin? Login</p></a>
</article>
