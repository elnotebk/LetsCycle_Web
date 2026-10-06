/** Renders the shared LetCycle footer layout with working page and contact links. */
export class FooterComponent {
    #root;
    #dashboardUrl = new URL("../../../Dashboard/index.html", import.meta.url).href;

    /** Creates a footer renderer for the supplied footer element. */
    constructor(root) {
        this.#root = root;
    }

    /** Renders the footer using the dashboard's shared footer classes. */
    render() {
        const content = document.createElement("div");
        content.className = "footer-content content-width";

        const about = document.createElement("div");
        about.className = "footer-about";
        const brand = this.#link(this.#dashboardUrl, "", "brand footer-brand");
        const brandMark = document.createElement("span");
        brandMark.className = "brand-mark";
        brandMark.setAttribute("aria-hidden", "true");
        brandMark.textContent = "↻";
        const brandName = document.createElement("span");
        brandName.append(document.createTextNode("Let"));
        const brandCycle = document.createElement("span");
        brandCycle.textContent = "Cycle";
        brandName.append(brandCycle);
        brand.append(brandMark, brandName);
        const description = document.createElement("p");
        description.textContent = "Platform pengelolaan sampah warga ubah kebiasaan kecil jadi dampak nyata untuk lingkungan.";
        about.append(brand, description);

        const links = document.createElement("div");
        links.className = "footer-links";
        const explore = document.createElement("div");
        explore.append(this.#heading("Jelajahi"));
        explore.append(
            this.#link(this.#dashboardUrl, "Beranda"),
            this.#link(`${this.#dashboardUrl}#tentang`, "Tentang kami"),
            this.#link(`${this.#dashboardUrl}#layanan`, "Layanan"),
            this.#link(`${this.#dashboardUrl}#kontak`, "Kontak"),
        );

        const contact = document.createElement("div");
        contact.append(this.#heading("Hubungi kami"));
        contact.append(
            this.#link("mailto:halo@letcycle.id", "halo@LetCycle.id"),
            this.#link("tel:081234567890", "0812-3456-7890"),
            this.#link(
                "https://www.google.com/maps/search/?api=1&query=Malang%2C%20Jawa%20Timur",
                "Malang, Jawa Timur",
            ),
        );
        links.append(explore, contact);
        content.append(about, links);

        const bottom = document.createElement("div");
        bottom.className = "footer-bottom content-width";
        const copyright = document.createElement("p");
        copyright.textContent = `© ${new Date().getFullYear()} LetCycle. Hak cipta dilindungi.`;
        const note = document.createElement("span");
        note.textContent = "Bersama menjaga bumi tetap lestari.";
        bottom.append(copyright, note);

        this.#root.replaceChildren(content, bottom);
    }

    #heading(text) {
        const heading = document.createElement("h2");
        heading.textContent = text;
        return heading;
    }

    #link(href, label, className = "") {
        const link = document.createElement("a");
        link.href = href;
        link.textContent = label;
        if (className) link.className = className;
        return link;
    }
}
