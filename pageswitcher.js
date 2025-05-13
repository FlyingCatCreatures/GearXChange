document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.page-switcher-button');

    window.api.on('window-ready', () => {

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const target = button.getAttribute('data-target');
                window.api.gotoPage(target);
            });
        });
    });
});