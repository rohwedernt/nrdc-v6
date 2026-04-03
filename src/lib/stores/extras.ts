import { writable } from 'svelte/store';

interface ExtrasState {
	open: boolean;
	showPong: boolean;
}

function createExtrasStore() {
	const { subscribe, update, set } = writable<ExtrasState>({ open: false, showPong: false });
	return {
		subscribe,
		openExtras: () => update((s) => ({ ...s, open: true, showPong: false })),
		closeExtras: () => set({ open: false, showPong: false }),
		openPong: () => update((s) => ({ ...s, showPong: true })),
		closePong: () => update((s) => ({ ...s, showPong: false }))
	};
}

export const extrasStore = createExtrasStore();
