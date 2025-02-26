let lastScrollTop = 0;
const bottomNavbar = document.querySelector('.bottom-navbar');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop) {
    // Scrolling down
    bottomNavbar.classList.add('hidden');
    } else {
    // Scrolling up
    bottomNavbar.classList.remove('hidden');
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For mobile or negative scrolling
});