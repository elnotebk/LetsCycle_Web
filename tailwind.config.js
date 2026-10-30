/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./public/**/*.{html,js}", "!./public/assets/**"],
    future: { hoverOnlyWhenSupported: true },
    theme: {
        // Desktop-first: max-width screens, widest first so narrower ones win.
        screens: {
            "lg-down": { max: "1024px" },
            "tablet": { max: "900px" },
            "md-down": { max: "760px" },
            "mobile": { max: "680px" },
            "sm-down": { max: "640px" },
            "phone": { max: "480px" },
            "tiny": { max: "370px" },
        },
        extend: {
            colors: {
                primary: "#3A7D44",
                deep: "#1F5C2E",
                soft: "#E8F0E2",
                teal: "#174A4A",
                lime: "#A7C957",
                paper: "#F5F7F2",
                ink: "#263238",
                muted: "var(--text-muted)",
                line: "#D5E2CC",
                market: {
                    dark: "#1e5e33",
                    green: "#2e7d46",
                    mid: "#3c8c54",
                    bg: "#eaf3e6",
                    soft: "#f3f8f1",
                    ink: "#14251a",
                    muted: "#5a6b60",
                },
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                serif: ["Playfair Display", "Georgia", "serif"],
                quote: ["Georgia", "serif"],
                market: ["Poppins", "Segoe UI", "system-ui", "-apple-system", "sans-serif"],
            },
            width: {
                page: "min(100% - 64px, 1200px)",
                "page-sm": "min(100% - 36px, 520px)",
            },
            transitionTimingFunction: {
                DEFAULT: "ease",
            },
        },
    },
};
