<script>
	import { onMount } from 'svelte';
	import 'swagger-ui-dist/swagger-ui.css';

	onMount(async () => {
		// @ts-ignore
		const SwaggerUI = (await import('swagger-ui-dist/swagger-ui-bundle')).default;
		// @ts-ignore
		const SwaggerUIStandalonePreset = (await import('swagger-ui-dist/swagger-ui-standalone-preset'))
			.default;

		SwaggerUI({
			url: '/swagger.json',
			dom_id: '#swagger-ui',
			presets: [SwaggerUI.presets.apis, SwaggerUIStandalonePreset],
			layout: 'StandaloneLayout'
		});
	});
</script>

<div id="swagger-ui"></div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}

	#swagger-ui {
		background-color: white;
		min-height: 100vh;
	}
</style>
