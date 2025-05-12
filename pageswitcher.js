document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    const button = document.getElementById('page-switcher-button');

    window.api.on('window-ready', () => {
        console.log('window-ready event received');

        if (button) {
            console.log('Button found, adding click listener');
            button.addEventListener('click', () => {
                const target = button.getAttribute('data-target');
                console.log('button clicked with target ' + target);
                window.api.gotoPage(target);
            });
        } else {
            console.log('Button not found!');
        }
    });
});