/** Owns dashboard scroll reveals, impact counts, and gallery controls. */
export class DashboardInteractions {
    #impactData = {
        waste: { value: 1240, decimals: 0, suffix: " kg" },
        members: { value: 350, decimals: 0, suffix: "+" },
        dropPoints: { value: 53, decimals: 0, suffix: "" },
        funds: { value: 8.2, decimals: 1, prefix: "Rp ", suffix: " Jt" },
    };

    /** Binds the dashboard's reveal, count-up, and carousel interactions. */
    init() {
        this.#initRevealAndCounters();
        this.#initGalleryControls();
    }

    #initRevealAndCounters() {
        const revealTargets = document.querySelectorAll("[data-reveal]");
        const impactSection = document.querySelector(".impact-section");
        const counters = document.querySelectorAll("[data-impact-count]");
        const animateCounters = () => {
            counters.forEach((counter) => this.#animateImpactCount(counter));
        };

        if (revealTargets.length && "IntersectionObserver" in window) {
            document.body.classList.add("has-motion");
            const animatedSections = new WeakSet();
            const observer = new IntersectionObserver((entries, currentObserver) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("is-visible");
                    if (entry.target === impactSection && !animatedSections.has(entry.target)) {
                        animatedSections.add(entry.target);
                        animateCounters();
                    }
                    currentObserver.unobserve(entry.target);
                });
            }, { threshold: 0.18 });

            revealTargets.forEach((target) => observer.observe(target));
        } else {
            animateCounters();
        }
    }

    #animateImpactCount(element) {
        const stat = this.#impactData[element.dataset.impactCount];
        if (!stat) return;

        const format = (value) => {
            const formatted = new Intl.NumberFormat("id-ID", {
                minimumFractionDigits: stat.decimals,
                maximumFractionDigits: stat.decimals,
            }).format(value);
            return `${stat.prefix || ""}${formatted}${stat.suffix || ""}`;
        };

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            element.textContent = format(stat.value);
            return;
        }

        const startTime = performance.now();
        const update = (now) => {
            const progress = Math.min((now - startTime) / 1200, 1);
            const easedProgress = 1 - (1 - progress) ** 3;
            element.textContent = format(stat.value * easedProgress);
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = format(stat.value);
            }
        };
        requestAnimationFrame(update);
    }

    #initGalleryControls() {
        const galleryTrack = document.querySelector("#gallery-track");
        if (!galleryTrack) return;

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
}

if (document.querySelector("[data-reveal], #gallery-track")) {
    new DashboardInteractions().init();
}
