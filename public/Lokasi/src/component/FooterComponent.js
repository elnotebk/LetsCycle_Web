/** Renders the shared LetCycle footer layout with working page and contact links. */
export class FooterComponent {
    #root;
    #dashboardUrl = new URL("../../../Dashboard/index.html", import.meta.url).href;

    /** Creates a footer renderer for the supplied footer element. */
    constructor(root) {
        this.#root = root;
    }

    /** Renders the footer with the same styling as the dashboard's. */
    render() {
        const content = document.createElement("div");
        content.className = "mx-auto grid w-page grid-cols-[minmax(0,1.4fr)_minmax(260px,1fr)] gap-[100px] pb-[45px] mobile:w-page-sm mobile:grid-cols-1 mobile:gap-6 mobile:pb-6";

        const about = document.createElement("div");
        const brand = this.#link(
            this.#dashboardUrl,
            "",
            "inline-flex w-fit items-center gap-2 text-[22px] font-extrabold tracking-[-0.8px] mobile:gap-1.5 mobile:text-[18px] tiny:text-[16px]",
        );
        const brandMark = document.createElement("span");
        brandMark.className = "grid h-[34px] w-[34px] place-items-center rounded-b-[50%] border-2 border-current text-[24px] leading-none mobile:h-[26px] mobile:w-[26px] mobile:text-[18px] tiny:h-[23px] tiny:w-[23px] tiny:text-[16px]";
        brandMark.setAttribute("aria-hidden", "true");
        brandMark.textContent = "↻";
        const brandName = document.createElement("span");
        brandName.append(document.createTextNode("Let"));
        const brandCycle = document.createElement("span");
        brandCycle.className = "text-lime";
        brandCycle.textContent = "Cycle";
        brandName.append(brandCycle);
        brand.append(brandMark, brandName);
        const description = document.createElement("p");
        description.className = "mb-[15px] mt-3 max-w-[430px] text-[13px] text-white/[0.82] mobile:max-w-[340px] mobile:text-[11px]";
        description.textContent = "Platform pengelolaan sampah warga ubah kebiasaan kecil jadi dampak nyata untuk lingkungan.";
        about.append(brand, description);

        const links = document.createElement("div");
        links.className = "grid grid-cols-2 gap-[26px] pt-[7px] mobile:max-w-[390px]";
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
        bottom.className = "mx-auto flex w-page items-center justify-between gap-[15px] border-t border-white/[0.13] pb-[22px] pt-[18px] text-[11px] text-white/[0.76] mobile:w-page-sm mobile:flex-col mobile:items-start mobile:gap-1 mobile:pb-4 mobile:pt-3 mobile:text-[8px]";
        const copyright = document.createElement("p");
        copyright.textContent = `© ${new Date().getFullYear()} LetCycle. Hak cipta dilindungi.`;
        const note = document.createElement("span");
        note.textContent = "Bersama menjaga bumi tetap lestari.";
        bottom.append(copyright, note);

        this.#root.replaceChildren(content, bottom);
    }

    #heading(text) {
        const heading = document.createElement("h2");
        heading.className = "mb-2.5 text-[14px] font-bold mobile:text-[11px]";
        heading.textContent = text;
        return heading;
    }

    #link(href, label, className = "mt-1.5 block w-fit text-[13px] text-white/[0.82] hover:text-lime mobile:text-[10px]") {
        const link = document.createElement("a");
        link.href = href;
        link.textContent = label;
        link.className = className;
        return link;
    }
}
