function showLanding() {
    const home = document.getElementById('home-section');
    const about = document.getElementById('about-section');
    const nav = document.getElementById('main-nav');

    if (home) home.classList.add('active-section');
    if (about) about.classList.add('active-section'); // Ensure about is visible too
    if (nav) nav.style.display = 'block';
}

function scrollToSection(sectionId) {
    showLanding();
    setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showLanding();
});