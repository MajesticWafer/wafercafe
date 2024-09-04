/* script.js */
document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll('.section, .detail');
    
    function reveal() {
        for (let i = 0; i < sections.length; i++) {
            let windowHeight = window.innerHeight;
            let elementTop = sections[i].getBoundingClientRect().top;
            let elementVisible = 150;

            if (elementTop < windowHeight - elementVisible) {
                sections[i].classList.add("active");
            } else {
                sections[i].classList.remove("active");
            }
        }
    }

    window.addEventListener("scroll", reveal);
    
    // To check the scroll position on page load
    reveal();
});
