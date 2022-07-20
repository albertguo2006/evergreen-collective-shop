<script lang="ts" context="module">
	export const prerender = true;
</script>

<nav class="grid grid-cols-3 h-20 content-center bg-neutral-700 text-slate-100">
	<a href="/admin/dash" class="col-start-2 place-self-center hover:text-indigo-200">
		<h2 class="text-xl font-extrabold text-center">Admin Panel</h2>
	</a>
	<a href="/" class="col-start-3 place-self-end text-right text-lg mr-6 hover:text-indigo-200">Back to user site</a>
</nav>
<slot />
