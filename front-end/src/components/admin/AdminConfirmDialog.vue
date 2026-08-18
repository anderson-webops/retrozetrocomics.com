<script lang="ts" setup>
import { nextTick, onBeforeUnmount, ref, watch } from "vue";

const props = withDefaults(
	defineProps<{
		busy?: boolean;
		confirmLabel: string;
		description: string;
		open: boolean;
		title: string;
	}>(),
	{
		busy: false
	}
);

const emit = defineEmits<{
	cancel: [];
	confirm: [];
}>();

const dialog = ref<HTMLElement | null>(null);
const cancelButton = ref<HTMLButtonElement | null>(null);
let returnFocus: HTMLElement | null = null;

function close() {
	if (!props.busy) emit("cancel");
}

function handleKeydown(event: KeyboardEvent) {
	if (event.key === "Escape") {
		event.preventDefault();
		close();
		return;
	}
	if (event.key !== "Tab" || !dialog.value) return;

	const focusable = Array.from(
		dialog.value.querySelectorAll<HTMLElement>(
			'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
		)
	);
	if (!focusable.length) return;

	const first = focusable[0];
	const last = focusable.at(-1);
	if (event.shiftKey && document.activeElement === first) {
		event.preventDefault();
		last?.focus();
	} else if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault();
		first.focus();
	}
}

watch(
	() => props.open,
	async open => {
		if (open) {
			returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
			await nextTick();
			cancelButton.value?.focus();
			return;
		}

		returnFocus?.focus();
		returnFocus = null;
	}
);

onBeforeUnmount(() => {
	returnFocus?.focus();
});
</script>

<template>
	<Teleport to="body">
		<div v-if="props.open" class="confirm-dialog" role="presentation" @click.self="close">
			<section
				ref="dialog"
				aria-describedby="confirm-dialog-description"
				aria-labelledby="confirm-dialog-title"
				aria-modal="true"
				class="confirm-dialog__panel"
				role="alertdialog"
				@keydown="handleKeydown"
			>
				<p class="confirm-dialog__eyebrow">Please confirm</p>
				<h2 id="confirm-dialog-title">{{ props.title }}</h2>
				<p id="confirm-dialog-description">{{ props.description }}</p>

				<div class="confirm-dialog__actions">
					<button ref="cancelButton" type="button" :disabled="props.busy" @click="close">
						Cancel — keep it
					</button>
					<button
						class="confirm-dialog__confirm"
						type="button"
						:disabled="props.busy"
						@click="emit('confirm')"
					>
						{{ props.busy ? "Working..." : props.confirmLabel }}
					</button>
				</div>
			</section>
		</div>
	</Teleport>
</template>

<style scoped>
.confirm-dialog {
	position: fixed;
	inset: 0;
	z-index: 140;
	display: grid;
	place-items: center;
	padding: 1rem;
	background: rgba(4, 8, 16, 0.78);
	backdrop-filter: blur(12px);
}

.confirm-dialog__panel {
	display: grid;
	gap: 1rem;
	width: min(100%, 32rem);
	border: 1px solid rgba(255, 255, 255, 0.14);
	border-radius: var(--radius-panel);
	background: #101a2a;
	box-shadow: var(--shadow-modal);
	color: #fff8ef;
	padding: clamp(1.35rem, 5vw, 2rem);
}

.confirm-dialog__panel h2,
.confirm-dialog__panel p {
	margin: 0;
}

.confirm-dialog__panel h2 {
	font-size: clamp(1.5rem, 5vw, 2rem);
}

.confirm-dialog__panel > p:not(.confirm-dialog__eyebrow) {
	color: rgba(255, 255, 255, 0.75);
	line-height: 1.7;
}

.confirm-dialog__eyebrow {
	color: #ffb36f;
	font-size: 0.76rem;
	font-weight: 900;
	letter-spacing: var(--tracking-eyebrow);
	text-transform: uppercase;
}

.confirm-dialog__actions {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0.75rem;
	padding-top: 0.4rem;
}

.confirm-dialog__actions button {
	min-height: 3rem;
	border: 1px solid rgba(255, 255, 255, 0.16);
	border-radius: var(--radius-pill);
	background: rgba(255, 255, 255, 0.08);
	color: #fff8ef;
	cursor: pointer;
	font: inherit;
	font-weight: 850;
	padding: 0.75rem 1rem;
}

.confirm-dialog__actions .confirm-dialog__confirm {
	border-color: rgba(255, 143, 143, 0.35);
	background: rgba(255, 143, 143, 0.18);
	color: #ffdada;
}

.confirm-dialog__actions button:disabled {
	cursor: wait;
	opacity: 0.65;
}

@media (max-width: 520px) {
	.confirm-dialog__actions {
		grid-template-columns: 1fr;
	}
}
</style>
