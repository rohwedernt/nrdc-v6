import '$lib/i18n';
import { waitLocale } from 'svelte-i18n';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
	// locale dictionaries load async; wait so hydrating pages can call $t safely
	await waitLocale();
	return {
		url
	};
};
