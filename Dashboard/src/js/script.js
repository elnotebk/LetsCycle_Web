const galleryTrack = document.querySelector("#gallery-track");

if (galleryTrack) {
    document.querySelectorAll("[data-carousel-direction]").forEach((button) => {
        button.addEventListener("click", () => {
            const firstCard = galleryTrack.querySelector(".gallery-card");
            if (!firstCard) return;

            const direction = button.dataset.carouselDirection === "next" ? 1 : -1;
            const trackStyle = window.getComputedStyle(galleryTrack);
            const gap = Number.parseFloat(trackStyle.columnGap) || 0;
            galleryTrack.scrollBy({
                left: direction * (firstCard.getBoundingClientRect().width + gap),
                behavior: "smooth",
            });
        });
    });
}
