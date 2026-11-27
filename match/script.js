const menuOpenButton = document.querySelector("#menu-open-button")
const menuCloseButton = document.querySelector("#menu-close-button")

menuOpenButton.addEventListener("click", () => {
    document.body.classList.toggle("show-mobile-menu");
})

menuCloseButton.addEventListener("click", () => menuOpenButton.click())

const DEFAULT_PLACEHOLDER_IMG = "../assets/logomain.png";

function getCurrentUser() {
    const savedSession = JSON.parse(localStorage.getItem("entreCiclosSession"));
    if (savedSession && savedSession.email) {
        return savedSession;
    }
    return {
        name: "Usuario Demo",
        email: "demo@aloe.ulima.edu.pe"
    };
}

const currentUser = getCurrentUser();

function getPublicationsDatabase() {
    const saved = JSON.parse(localStorage.getItem("entreCiclosPublications"));
    if (saved && saved.length > 0) {
        return saved;
    }

    const initialCatalog = [
        {
            id: "PUB-201",
            ownerEmail: "20231045@aloe.ulima.edu.pe",
            ownerName: "Camila Rojas",
            title: "Calculadora científica Casio fx-991LA Plus",
            modality: "Venta",
            career: "Ingeniería Industrial",
            price: "S/ 45.00",
            dateFrom: "2026-11-01",
            dateTo: "2026-12-20",
            image: DEFAULT_PLACEHOLDER_IMG,
            description: "En perfecto estado, incluye tapa protectora y pila recién cambiada. Entrega en Pabellón A o biblioteca.",
            contact: "20231045@aloe.ulima.edu.pe",
            status: "active"
        },
        {
            id: "PUB-202",
            ownerEmail: "20220891@aloe.ulima.edu.pe",
            ownerName: "Diego Salazar",
            title: "Bata de laboratorio blanca talla M",
            modality: "Empeño",
            career: "Ingeniería Industrial",
            price: "S/ 12.00",
            dateFrom: "2026-11-15",
            dateTo: "2026-12-18",
            image: DEFAULT_PLACEHOLDER_IMG,
            description: "Limpia y sin manchas, ideal para prácticas de Química o Física en el Pabellón L.",
            contact: "20220891@aloe.ulima.edu.pe",
            status: "active"
        },
        {
            id: "PUB-203",
            ownerEmail: "20240112@aloe.ulima.edu.pe",
            ownerName: "Valeria Torres",
            title: "Escalímetro profesional y juego de escuadras",
            modality: "Venta",
            career: "Arquitectura",
            price: "S/ 25.00",
            dateFrom: "2026-11-10",
            dateTo: "2026-12-30",
            image: DEFAULT_PLACEHOLDER_IMG,
            description: "Estuche completo sin rayaduras, poco uso durante el ciclo.",
            contact: "20240112@aloe.ulima.edu.pe",
            status: "active"
        }
    ];

    localStorage.setItem("entreCiclosPublications", JSON.stringify(initialCatalog));
    return initialCatalog;
}

let selectedMatchItem = null;
const detailModal = document.getElementById("match-detail-modal");

function openDetailModal(item) {
    selectedMatchItem = item;

    const badge = document.getElementById("detail-modality-badge");
    badge.textContent = item.modality;
    badge.className = "modality-badge";
    if (item.modality === "Empeño") badge.classList.add("empeno");
    if (item.modality === "Emergencia") badge.classList.add("emergencia");

    document.getElementById("detail-title").textContent = item.title;
    document.getElementById("detail-img").src = item.image || DEFAULT_PLACEHOLDER_IMG;
    document.getElementById("detail-price").textContent = item.price;
    document.getElementById("detail-career").textContent = item.career;
    document.getElementById("detail-from").textContent = item.dateFrom;
    document.getElementById("detail-to").textContent = item.dateTo;
    document.getElementById("detail-author").textContent = item.ownerName;
    document.getElementById("detail-contact").textContent = item.contact;
    document.getElementById("detail-description").textContent = item.description;

    detailModal.classList.add("open");
}

document.getElementById("close-detail-modal").addEventListener("click", () => detailModal.classList.remove("open"));
document.getElementById("close-detail-btn").addEventListener("click", () => detailModal.classList.remove("open"));
detailModal.addEventListener("click", (e) => {
    if (e.target === detailModal) detailModal.classList.remove("open");
});

document.getElementById("request-match-btn").addEventListener("click", () => {
    if (!selectedMatchItem) return;

    const transactions = JSON.parse(localStorage.getItem("entreCiclosTransactions") || "[]");
    transactions.unshift({
        id: "TX-" + Date.now(),
        userEmail: currentUser.email,
        role: "Compra / Solicitud",
        modality: selectedMatchItem.modality,
        item: selectedMatchItem.title,
        counterpart: `${selectedMatchItem.ownerName} (${selectedMatchItem.contact})`,
        date: new Date().toISOString().split("T")[0],
        completed: false,
        rating: 0
    });
    localStorage.setItem("entreCiclosTransactions", JSON.stringify(transactions));

    const updatedPubs = getPublicationsDatabase().map((p) =>
        p.id === selectedMatchItem.id ? { ...p, status: "reserved" } : p
    );
    localStorage.setItem("entreCiclosPublications", JSON.stringify(updatedPubs));

    detailModal.classList.remove("open");
    selectedMatchItem = null;

    const feedbackEl = document.getElementById("search-feedback");
    feedbackEl.textContent = "Solicitud registrada. Puedes verla y confirmarla en 'Mi espacio > Mis transacciones'.";
    feedbackEl.className = "form-feedback success";

    renderResults(getAvailablePublications());
});

function getAvailablePublications() {
    return getPublicationsDatabase().filter((pub) => pub.status !== "reserved");
}

function renderResults(items, customHeading = null) {
    const grid = document.getElementById("match-results-grid");
    const countPill = document.getElementById("results-count");
    const headingEl = document.getElementById("results-heading");

    if (customHeading) {
        headingEl.textContent = customHeading;
    }

    countPill.textContent = `${items.length} coincidencia${items.length === 1 ? "" : "s"}`;

    if (items.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <p>No encontramos artículos disponibles que coincidan con el nombre y las fechas seleccionadas.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = "";
    items.forEach((pub) => {
        const badgeClass =
            pub.modality === "Empeño" ? "empeno" :
            pub.modality === "Emergencia" ? "emergencia" : "";

        const card = document.createElement("article");
        card.className = "match-card";
        card.innerHTML = `
            <div class="match-card-top">
                <span class="status-badge">Estado: Disponible</span>
                <span class="modality-badge ${badgeClass}">${pub.modality}</span>
            </div>
            <h3 class="match-card-title">${pub.title}</h3>
            <span class="match-card-price">${pub.price}</span>
            <p class="match-card-comment">${pub.description}</p>
            <div class="match-card-footer">
                <span>${pub.dateFrom} al ${pub.dateTo}</span>
                <span>Ver detalle <i class="fas fa-arrow-right"></i></span>
            </div>
        `;
        card.addEventListener("click", () => openDetailModal(pub));
        grid.appendChild(card);
    });
}

document.getElementById("match-search-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const query = document.getElementById("search-query").value.trim().toLowerCase();
    const dateFrom = document.getElementById("search-date-from").value;
    const dateTo = document.getElementById("search-date-to").value;
    const feedbackEl = document.getElementById("search-feedback");

    if (!query || !dateFrom || !dateTo) {
        feedbackEl.textContent = "Ingresa el objeto que buscas y el rango de fechas completo.";
        feedbackEl.className = "form-feedback error";
        return;
    }

    if (dateFrom > dateTo) {
        feedbackEl.textContent = "La fecha inicial no puede ser posterior a la fecha final.";
        feedbackEl.className = "form-feedback error";
        return;
    }

    feedbackEl.textContent = "";

    const available = getAvailablePublications();
    const matches = available.filter((pub) => {
        const textMatches =
            pub.title.toLowerCase().includes(query) ||
            pub.description.toLowerCase().includes(query) ||
            pub.career.toLowerCase().includes(query);

        const dateMatches = pub.dateFrom <= dateFrom && pub.dateTo >= dateTo;

        return textMatches && dateMatches;
    });

    renderResults(matches, `Resultados para "${document.getElementById("search-query").value.trim()}"`);
});

renderResults(getAvailablePublications());