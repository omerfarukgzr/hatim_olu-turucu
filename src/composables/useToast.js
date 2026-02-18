import { ref } from 'vue';

const toasts = ref([]);

export function useToast() {
    function show(msg, type = 'success') {
        const id = Date.now() + Math.random();
        toasts.value.push({ id, msg, type });
        setTimeout(() => remove(id), 3000);
    }

    function remove(id) {
        const idx = toasts.value.findIndex(t => t.id === id);
        if (idx !== -1) toasts.value.splice(idx, 1);
    }

    return { toasts, show, remove };
}
