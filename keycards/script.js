const images = document.querySelectorAll('.image-container img');
const dots = document.querySelectorAll('.dots span');

let currentImageIndex = 0;

function updateActiveImage(index) {
    images.forEach((img, i) => {
        img.style.transform = `translateY(-${index * 100}%)`;
    });
    dots.forEach(dot => dot.classList.remove('active'));
    dots[index].classList.add('active');
}

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentImageIndex = index;
        updateActiveImage(index);
    });
});

// Initial setup
updateActiveImage(0);
