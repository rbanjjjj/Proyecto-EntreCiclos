const menuOpenButton = document.querySelector("#menu-open-button")
const menuCloseButton = document.querySelector("#menu-close-button")

menuOpenButton.addEventListener("click", () => {
    document.body.classList.toggle("show-mobile-menu");
})

menuCloseButton.addEventListener("click", () => menuOpenButton.click())

const POINTS_BY_MODALITY = {
    "Venta": 5,
    "Empeño": 10,
    "Emergencia": 20
};

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
const greetingEl = document.getElementById("user-greeting");
if (greetingEl) {
    greetingEl.textContent = `Hola, ${currentUser.name} (${currentUser.email})`;
}

const spaceTabs = document.querySelectorAll(".space-tab");
const spacePanels = document.querySelectorAll(".space-panel");

spaceTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        spaceTabs.forEach((btn) => btn.classList.remove("active"));
        spacePanels.forEach((panel) => panel.classList.remove("active"));

        tab.classList.add("active");
        const target = document.getElementById(tab.dataset.tab);
        if (target) {
            target.classList.add("active");
        }
    });
});

function getGlobalPublications() {
    return JSON.parse(localStorage.getItem("entreCiclosPublications") || "[]");
}

function saveGlobalPublications(publications) {
    localStorage.setItem("entreCiclosPublications", JSON.stringify(publications));
}

const publishModal = document.getElementById("publish-modal");
const openPublishBtn = document.getElementById("open-publish-modal");
const closePublishBtn = document.getElementById("close-publish-modal");
const cancelPublishBtn = document.getElementById("cancel-publish-btn");
const publishForm = document.getElementById("publish-form");
const publishFeedback = document.getElementById("publish-feedback");

function closePublishModal() {
    publishModal.classList.remove("open");
    publishFeedback.textContent = "";
}

openPublishBtn.addEventListener("click", () => {
    document.getElementById("pub-author").value = currentUser.name;
    document.getElementById("pub-contact").value = currentUser.email;
    publishModal.classList.add("open");
});

closePublishBtn.addEventListener("click", closePublishModal);
cancelPublishBtn.addEventListener("click", closePublishModal);

publishModal.addEventListener("click", (e) => {
    if (e.target === publishModal) {
        closePublishModal();
    }
});

function readImageAsDataURL(file) {
    return new Promise((resolve) => {
        if (!file) {
            resolve(DEFAULT_PLACEHOLDER_IMG);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(DEFAULT_PLACEHOLDER_IMG);
        reader.readAsDataURL(file);
    });
}

publishForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("pub-title").value.trim();
    const modality = document.getElementById("pub-modality").value;
    const career = document.getElementById("pub-career").value;
    const price = document.getElementById("pub-price").value;
    const dateFrom = document.getElementById("pub-date-from").value;
    const dateTo = document.getElementById("pub-date-to").value;
    const description = document.getElementById("pub-description").value.trim();
    const authorName = document.getElementById("pub-author").value.trim();
    const contact = document.getElementById("pub-contact").value.trim();
    const imageFile = document.getElementById("pub-image").files[0];

    if (!title || !modality || !career || !dateFrom || !dateTo || !authorName || !contact) {
        publishFeedback.textContent = "Completa todos los campos obligatorios (*).";
        publishFeedback.className = "form-feedback error";
        return;
    }

    if (imageFile && imageFile.size > 3 * 1024 * 1024) {
        publishFeedback.textContent = "La imagen supera el límite recomendado de 3 MB.";
        publishFeedback.className = "form-feedback error";
        return;
    }

    const imageData = await readImageAsDataURL(imageFile);

    const newPublication = {
        id: "PUB-" + Date.now(),
        ownerEmail: currentUser.email,
        ownerName: authorName,
        title,
        modality,
        career,
        price: price ? `S/ ${parseFloat(price).toFixed(2)}` : "A coordinar",
        dateFrom,
        dateTo,
        image: imageData,
        description: description || "Sin descripción adicional.",
        contact,
        status: "active",
        createdAt: new Date().toISOString()
    };

    const allPublications = getGlobalPublications();
    allPublications.unshift(newPublication);
    saveGlobalPublications(allPublications);

    renderMyPublications();
    publishForm.reset();
    closePublishModal();
});

const detailModal = document.getElementById("detail-modal");
const closeDetailBtn = document.getElementById("close-detail-modal");

closeDetailBtn.addEventListener("click", () => detailModal.classList.remove("open"));
detailModal.addEventListener("click", (e) => {
    if (e.target === detailModal) {
        detailModal.classList.remove("open");
    }
});

function openPublicationDetail(pub) {
    const badge = document.getElementById("detail-modality-badge");
    badge.textContent = pub.modality;
    badge.className = "modality-badge";
    if (pub.modality === "Empeño") badge.classList.add("empeno");
    if (pub.modality === "Emergencia") badge.classList.add("emergencia");

    document.getElementById("detail-title").textContent = pub.title;
    document.getElementById("detail-img").src = pub.image || DEFAULT_PLACEHOLDER_IMG;
    document.getElementById("detail-price").textContent = pub.price;
    document.getElementById("detail-career").textContent = pub.career;
    document.getElementById("detail-from").textContent = pub.dateFrom;
    document.getElementById("detail-to").textContent = pub.dateTo;
    document.getElementById("detail-author").textContent = pub.ownerName;
    document.getElementById("detail-contact").textContent = pub.contact;
    document.getElementById("detail-description").textContent = pub.description;

    detailModal.classList.add("open");
}

function renderMyPublications() {
    const grid = document.getElementById("publications-grid");
    const myPubs = getGlobalPublications().filter((pub) => pub.ownerEmail === currentUser.email);

    if (myPubs.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <p>Aún no has creado ninguna publicación. Haz clic en "Crear publicación" para empezar.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = "";
    myPubs.forEach((pub) => {
        const badgeClass =
            pub.modality === "Empeño" ? "empeno" :
            pub.modality === "Emergencia" ? "emergencia" : "";

        const card = document.createElement("article");
        card.className = "pub-card";
        card.innerHTML = `
            <div class="pub-card-img-wrap">
                <img src="${pub.image || DEFAULT_PLACEHOLDER_IMG}" alt="${pub.title}">
                <span class="modality-badge ${badgeClass}">${pub.modality}</span>
            </div>
            <div class="pub-card-body">
                <h3 class="pub-card-title">${pub.title}</h3>
                <span class="pub-card-career">${pub.career}</span>
                <div class="pub-card-footer">
                    <span class="pub-card-price">${pub.price}</span>
                    <span class="pub-card-more">Ver completo <i class="fas fa-arrow-right"></i></span>
                </div>
            </div>
        `;
        card.addEventListener("click", () => openPublicationDetail(pub));
        grid.appendChild(card);
    });
}

function getTransactions() {
    const saved = JSON.parse(localStorage.getItem("entreCiclosTransactions"));
    if (saved && saved.length > 0) {
        return saved;
    }

    const seedTransactions = [
        {
            id: "TX-101",
            userEmail: currentUser.email,
            role: "Venta",
            modality: "Venta",
            item: "Calculadora científica Casio fx-991LA",
            counterpart: "Camila R. (20231045@aloe.ulima.edu.pe)",
            date: "2026-11-20",
            completed: false,
            rating: 0
        },
        {
            id: "TX-102",
            userEmail: currentUser.email,
            role: "Compra",
            modality: "Emergencia",
            item: "Bata de laboratorio talla M",
            counterpart: "Diego S. (20220891@aloe.ulima.edu.pe)",
            date: "2026-11-15",
            completed: true,
            rating: 5
        },
        {
            id: "TX-103",
            userEmail: currentUser.email,
            role: "Venta",
            modality: "Empeño",
            item: "Libro Cálculo de Una Variable - Stewart",
            counterpart: "Valeria T. (20240112@aloe.ulima.edu.pe)",
            date: "2026-11-10",
            completed: true,
            rating: 0
        }
    ];

    localStorage.setItem("entreCiclosTransactions", JSON.stringify(seedTransactions));
    return seedTransactions;
}

function saveTransactions(txList) {
    localStorage.setItem("entreCiclosTransactions", JSON.stringify(txList));
}

function calculateUserPoints(email) {
    const allTx = getTransactions();
    return allTx
        .filter((tx) => tx.userEmail === email && tx.completed)
        .reduce((acc, tx) => acc + (POINTS_BY_MODALITY[tx.modality] || 0), 0);
}

function renderTransactions() {
    const container = document.getElementById("transactions-list");
    const allTx = getTransactions();
    const myTx = allTx.filter((tx) => tx.userEmail === currentUser.email);

    container.innerHTML = "";
    myTx.forEach((tx) => {
        const pts = POINTS_BY_MODALITY[tx.modality] || 0;
        const card = document.createElement("div");
        card.className = "tx-card";

        let starsHTML = "";
        for (let i = 1; i <= 5; i++) {
            const activeClass = i <= tx.rating ? "active" : "";
            starsHTML += `<button type="button" class="star-btn ${activeClass}" data-tx="${tx.id}" data-star="${i}" title="${i} estrellas"><i class="fas fa-star"></i></button>`;
        }

        card.innerHTML = `
            <div class="tx-info">
                <div class="tx-top-tags">
                    <span class="tx-role-tag">${tx.role}</span>
                    <span class="modality-badge ${tx.modality === "Empeño" ? "empeno" : tx.modality === "Emergencia" ? "emergencia" : ""}">${tx.modality}</span>
                    <span class="tx-points-tag">+${pts} pts</span>
                </div>
                <h3 class="tx-title">${tx.item}</h3>
                <span class="tx-meta">Contraparte: ${tx.counterpart} • Fecha: ${tx.date}</span>
            </div>

            <div class="tx-actions">
                <span class="status-pill ${tx.completed ? "completed" : "pending"}">
                    ${tx.completed ? "Transacción completada" : "Pendiente de confirmación"}
                </span>
                ${
                    !tx.completed
                        ? `<button type="button" class="primary-btn confirm-tx-btn" data-id="${tx.id}">Confirmar completada</button>`
                        : `<div class="star-rating"><span>Review:</span> ${starsHTML}</div>`
                }
            </div>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll(".confirm-tx-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const updated = getTransactions().map((tx) =>
                tx.id === btn.dataset.id ? { ...tx, completed: true } : tx
            );
            saveTransactions(updated);
            renderTransactions();
            renderRanking();
        });
    });

    document.querySelectorAll(".star-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const starValue = parseInt(btn.dataset.star, 10);
            const updated = getTransactions().map((tx) =>
                tx.id === btn.dataset.tx ? { ...tx, rating: starValue } : tx
            );
            saveTransactions(updated);
            renderTransactions();
        });
    });
}

function renderRanking() {
    const myPoints = calculateUserPoints(currentUser.email);
    document.getElementById("user-total-points").textContent = `${myPoints} pts`;

    const registeredUsers = JSON.parse(localStorage.getItem("entreCiclosUsers") || "[]");
    const baseParticipants = [
        { name: "Camila Rojas", email: "20231045@aloe.ulima.edu.pe", points: 95 },
        { name: "Diego Salazar", email: "20220891@aloe.ulima.edu.pe", points: 80 },
        { name: "Valeria Torres", email: "20240112@aloe.ulima.edu.pe", points: 65 },
        { name: "Mateo Paredes", email: "20213410@aloe.ulima.edu.pe", points: 50 },
        { name: "Sofía Mendoza", email: "20232988@aloe.ulima.edu.pe", points: 40 }
    ];

    const mapByEmail = new Map();
    baseParticipants.forEach((p) => mapByEmail.set(p.email, p));

    registeredUsers.forEach((u) => {
        if (!mapByEmail.has(u.email)) {
            mapByEmail.set(u.email, {
                name: u.name,
                email: u.email,
                points: calculateUserPoints(u.email)
            });
        }
    });

    mapByEmail.set(currentUser.email, {
        name: currentUser.name,
        email: currentUser.email,
        points: myPoints
    });

    const sortedRanking = Array.from(mapByEmail.values()).sort((a, b) => b.points - a.points);
    const myIndex = sortedRanking.findIndex((u) => u.email === currentUser.email);
    const myRank = myIndex >= 0 ? myIndex + 1 : "-";

    document.getElementById("user-rank-pill").textContent = `Tu puesto: #${myRank}`;

    const leaderboardEl = document.getElementById("leaderboard-list");
    leaderboardEl.innerHTML = "";

    const topFive = sortedRanking.slice(0, 5);
    topFive.forEach((user, idx) => {
        const isMe = user.email === currentUser.email;
        const row = document.createElement("div");
        row.className = `leader-row ${isMe ? "is-me" : ""}`;
        row.innerHTML = `
            <div class="leader-left">
                <span class="leader-pos">${idx + 1}</span>
                <div>
                    <span class="leader-name">${user.name} ${isMe ? "(Tú)" : ""}</span>
                    <span class="leader-email">${user.email}</span>
                </div>
            </div>
            <span class="leader-points">${user.points} pts</span>
        `;
        leaderboardEl.appendChild(row);
    });

    if (myIndex >= 5) {
        const myRow = document.createElement("div");
        myRow.className = "leader-row is-me";
        myRow.innerHTML = `
            <div class="leader-left">
                <span class="leader-pos">${myRank}</span>
                <div>
                    <span class="leader-name">${currentUser.name} (Tú)</span>
                    <span class="leader-email">${currentUser.email}</span>
                </div>
            </div>
            <span class="leader-points">${myPoints} pts</span>
        `;
        leaderboardEl.appendChild(myRow);
    }
}

renderMyPublications();
renderTransactions();
renderRanking();