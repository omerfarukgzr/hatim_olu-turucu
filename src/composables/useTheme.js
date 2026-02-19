import { ref, onMounted } from 'vue';

const isDark = ref(false);

export function useTheme() {
    function toggleTheme() {
        isDark.value = !isDark.value;
        updateTheme();
    }

    function updateTheme() {
        if (isDark.value) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }

    function initTheme() {
        const stored = localStorage.getItem('theme');
        if (stored) {
            isDark.value = stored === 'dark';
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            isDark.value = prefersDark;
        }
        updateTheme();
    }

    return {
        isDark,
        toggleTheme,
        initTheme
    };
}
