document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const copyButtons = document.querySelectorAll('.copy-btn');
    const toast = document.getElementById('toast');
    let toastTimeout;

    // Centralized function to show toast with forced reflow
    async function showToast(message) {
        // Hide/Reset state
        toast.classList.remove('show');

        // Small delay to ensure the browser paints the "hidden" state.
        // Triggers the slide-in animation
        await new Promise(resolve => setTimeout(resolve, 50));

        // Update content
        toast.textContent = message;

        // Trigger the slide-in animation
        toast.classList.add('show');

        // Auto-hide after 2.5 seconds
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    copyButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const valueToCopy = button.getAttribute('data-copy-value');
            const copyType = button.getAttribute('data-copy-type') || 'Value';
            if (!valueToCopy) return;

            try {
                await navigator.clipboard.writeText(valueToCopy);
                showToast(`${copyType} copied to clipboard`);
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        });
    });

    const themeToggle = document.getElementById('themeToggle');
    const themeIconPath = document.getElementById('themeIconPath');
    const themeSvg = document.getElementById('themeSvg');
    const themes = ['system', 'light', 'dark'];

    const configs = {
        system: { path: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-2V4a8 8 0 1 1 0 16z', box: '0 0 24 24' },
        light: { path: 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm-1.06-12.37c-.39-.39-1.03-.39-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zM7.05 18.01c-.39-.39-1.03-.39-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06z', box: '0 0 24 24' },
        dark: { path: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z', box: '0 0 24 24' }
    };

    function updateIcon(theme) {
        themeIconPath.setAttribute('d', configs[theme].path);
        themeSvg.setAttribute('viewBox', configs[theme].box);
        themeToggle.setAttribute('title', `Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`);
    }

    let currentTheme = document.documentElement.getAttribute('data-theme') || 'system';
    updateIcon(currentTheme);

    themeToggle.addEventListener('click', () => {
        let index = themes.indexOf(currentTheme);
        currentTheme = themes[(index + 1) % themes.length];
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
        updateIcon(currentTheme);
    });
});
