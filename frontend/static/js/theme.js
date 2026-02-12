// Theme switcher — persists to localStorage
(function() {
    const theme = localStorage.getItem('theme') || 'retro';
    document.documentElement.dataset.theme = theme;

    document.addEventListener('DOMContentLoaded', function() {
        const btn = document.querySelector('.theme-toggle');
        if (!btn) return;
        btn.textContent = theme === 'retro' ? 'brutalist' : 'retro';
        btn.addEventListener('click', function() {
            const next = document.documentElement.dataset.theme === 'retro' ? 'brutalist' : 'retro';
            document.documentElement.dataset.theme = next;
            localStorage.setItem('theme', next);
            btn.textContent = next === 'retro' ? 'brutalist' : 'retro';
        });
    });
})();
