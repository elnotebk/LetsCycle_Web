const impactData = {
    waste: { value: 1240, decimals: 0, suffix: " kg" },
    members: { value: 350, decimals: 0, suffix: "+" },
    dropPoints: { value: 53, decimals: 0, suffix: "" },
    funds: { value: 8.2, decimals: 1, prefix: "Rp ", suffix: " Jt" },
};

const formatImpactValue = (value, stat) => {
    const formatted = new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: stat.decimals,
        maximumFractionDigits: stat.decimals,
    }).format(value);

    return `${stat.prefix || ""}${formatted}${stat.suffix || ""}`;
};

const animateImpactCount = (element, key) => {
    const stat = impactData[key];
    if (!stat) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        element.textContent = formatImpactValue(stat.value, stat);
        return;
    }

    const duration = 1200;
    const startTime = performance.now();
    const updateCount = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        element.textContent = formatImpactValue(stat.value * easedProgress, stat);

        if (progress < 1) {
            requestAnimationFrame(updateCount);
        } else {
            element.textContent = formatImpactValue(stat.value, stat);
        }
    };

    requestAnimationFrame(updateCount);
};

const revealTargets = document.querySelectorAll("[data-reveal]");
const impactSection = document.querySelector(".impact-section");
const impactCounters = document.querySelectorAll("[data-impact-count]");

if (revealTargets.length && "IntersectionObserver" in window) {
    document.body.classList.add("has-motion");
    const animatedSections = new WeakSet();
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add("is-visible");
            if (entry.target === impactSection && !animatedSections.has(entry.target)) {
                animatedSections.add(entry.target);
                impactCounters.forEach((counter) => {
                    animateImpactCount(counter, counter.dataset.impactCount);
                });
            }

            observer.unobserve(entry.target);
        });
    }, { threshold: 0.18 });

    revealTargets.forEach((target) => revealObserver.observe(target));
} else {
    impactCounters.forEach((counter) => {
        animateImpactCount(counter, counter.dataset.impactCount);
    });
}

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
