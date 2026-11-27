const menuOpenButton = document.querySelector("#menu-open-button")
const menuCloseButton = document.querySelector("#menu-close-button")

menuOpenButton.addEventListener("click", () => {
    document.body.classList.toggle("show-mobile-menu");
})

menuCloseButton.addEventListener("click", () => menuOpenButton.click())

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
document.getElementById("sos-author").value = currentUser.name;
document.getElementById("sos-contact").value = currentUser.email;

const subscribeBtn = document.getElementById("subscribe-sos-btn");
const sosUserStatus = document.getElementById("sos-user-status");

function getSubscriptions() {
    return JSON.parse(localStorage.getItem("entreCiclosSosSubscriptions") || "[]");
}

function updateSubscriptionUI() {
    const subs = getSubscriptions();
    const isSubscribed = subs.includes(currentUser.email);

    if (isSubscribed) {
        subscribeBtn.classList.add("subscribed");
        subscribeBtn.innerHTML = `<i class="fas fa-check-circle"></i> <span>Suscrito (${currentUser.email})</span>`;
        sosUserStatus.textContent = `Alertas de emergencia activas para la cuenta ${currentUser.email}.`;
    } else {
        subscribeBtn.classList.remove("subscribed");
        subscribeBtn.innerHTML = `<i class="fas fa-bell"></i> <span>Suscribirme a alertas</span>`;
        sosUserStatus.textContent = `Préstamos inmediatos dentro del campus • Cuenta: ${currentUser.email}`;
    }
}

subscribeBtn.addEventListener("click", () => {
    let subs = getSubscriptions();
    if (subs.includes(currentUser.email)) {
        subs = subs.filter((email) => email !== currentUser.email);
    } else {
        subs.push(currentUser.email);
    }
    localStorage.setItem("entreCiclosSosSubscriptions", JSON.stringify(subs));
    updateSubscriptionUI();
});

updateSubscriptionUI();

const itemSelect = document.getElementById("sos-item");
const customItemGroup = document.getElementById("sos-custom-item-group");
const customItemInput = document.getElementById("sos-custom-item");

itemSelect.addEventListener("change", () => {
    if (itemSelect.value === "Otro") {
        customItemGroup.style.display = "flex";
        customItemInput.required = true;
    } else {
        customItemGroup.style.display = "none";
        customItemInput.required = false;
    }
});

function getSosRequests() {
    const saved = JSON.parse(localStorage.getItem("entreCiclosSosRequests"));
    if (saved) {
        return saved;
    }

    const initialSeed = [
        {
            id: "SOS-101",
            requesterEmail: "20234410@aloe.ulima.edu.pe",
            item: "Calculadora científica",
            pavilion: "Pabellón B",
            meeting: "3.º piso, frente al aula B-304",
            duration: "2 horas",
            tip: "S/ 8.00",
            author: "Emily R.",
            contact: "20234410@aloe.ulima.edu.pe",
            expiresAt: Date.now() + 18 * 60 * 1000,
            acceptedBy: null
        }
    ];
    localStorage.setItem("entreCiclosSosRequests", JSON.stringify(initialSeed));
    return initialSeed;
}

function saveSosRequests(list) {
    localStorage.setItem("entreCiclosSosRequests", JSON.stringify(list));
}

function findEmergencyMatches(requestedItem) {
    const allPublications = JSON.parse(localStorage.getItem("entreCiclosPublications") || "[]");
    const query = requestedItem.toLowerCase().trim();

    return allPublications.filter((pub) => {
        if (pub.modality !== "Emergencia") return false;
        const pubTitle = pub.title.toLowerCase();
        return pubTitle.includes(query) || query.includes(pubTitle);
    });
}

function formatRemainingTime(ms) {
    if (ms <= 0) return "Vencido";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} min`;
}

let selectedRequestId = null;
const detailModal = document.getElementById("sos-detail-modal");

function openSosDetail(req) {
    selectedRequestId = req.id;
    document.getElementById("sos-detail-item").textContent = req.item;
    document.getElementById("sos-detail-tip").textContent = req.tip;
    document.getElementById("sos-detail-duration").textContent = req.duration;
    document.getElementById("sos-detail-pavilion").textContent = req.pavilion;
    document.getElementById("sos-detail-meeting").textContent = req.meeting || "No especificado";
    document.getElementById("sos-detail-author").textContent = req.author;
    document.getElementById("sos-detail-contact").textContent = req.contact;
    document.getElementById("sos-detail-timer").textContent = formatRemainingTime(req.expiresAt - Date.now());

    detailModal.classList.add("open");
}

document.getElementById("close-sos-detail").addEventListener("click", () => detailModal.classList.remove("open"));
document.getElementById("close-sos-detail-btn").addEventListener("click", () => detailModal.classList.remove("open"));
detailModal.addEventListener("click", (e) => {
    if (e.target === detailModal) detailModal.classList.remove("open");
});

document.getElementById("accept-sos-btn").addEventListener("click", () => {
    if (!selectedRequestId) return;

    const requests = getSosRequests();
    const targetReq = requests.find((r) => r.id === selectedRequestId);

    if (targetReq) {
        const updatedRequests = requests.filter((r) => r.id !== selectedRequestId);
        saveSosRequests(updatedRequests);

        const transactions = JSON.parse(localStorage.getItem("entreCiclosTransactions") || "[]");
        transactions.unshift({
            id: "TX-" + Date.now(),
            userEmail: currentUser.email,
            role: "Préstamo Emergencia",
            modality: "Emergencia",
            item: targetReq.item,
            counterpart: `${targetReq.author} (${targetReq.contact})`,
            date: new Date().toISOString().split("T")[0],
            completed: true,
            rating: 0
        });
        localStorage.setItem("entreCiclosTransactions", JSON.stringify(transactions));
    }

    detailModal.classList.remove("open");
    selectedRequestId = null;
    renderActiveRequests();
});

function renderActiveRequests() {
    const now = Date.now();
    const allRequests = getSosRequests();
    const validRequests = allRequests.filter((req) => !req.acceptedBy && req.expiresAt > now);

    if (validRequests.length !== allRequests.length) {
        saveSosRequests(validRequests);
    }

    const listEl = document.getElementById("sos-requests-list");
    const countEl = document.getElementById("active-requests-count");
    countEl.textContent = `${validRequests.length} activa${validRequests.length === 1 ? "" : "s"}`;

    if (validRequests.length === 0) {
        listEl.innerHTML = `
            <div class="empty-state">
                <p>No hay solicitudes de emergencia activas en este momento.</p>
            </div>
        `;
        return;
    }

    listEl.innerHTML = "";
    validRequests.forEach((req) => {
        const remaining = formatRemainingTime(req.expiresAt - now);
        const card = document.createElement("article");
        card.className = "sos-request-card";
        card.innerHTML = `
            <div class="sos-req-main">
                <h3 class="sos-req-title">${req.item}</h3>
                <span class="sos-req-tip">Propina ofrecida: ${req.tip}</span>
            </div>
            <div class="sos-req-right">
                <span class="sos-countdown" data-expires="${req.expiresAt}">
                    <i class="fas fa-clock"></i> ${remaining}
                </span>
                <span class="sos-req-hint">Ver detalles <i class="fas fa-arrow-right"></i></span>
            </div>
        `;
        card.addEventListener("click", () => openSosDetail(req));
        listEl.appendChild(card);
    });
}

setInterval(() => {
    const now = Date.now();
    const requests = getSosRequests();
    const hasExpired = requests.some((r) => r.expiresAt <= now);

    if (hasExpired) {
        renderActiveRequests();
        return;
    }

    document.querySelectorAll(".sos-countdown").forEach((el) => {
        const exp = parseInt(el.dataset.expires, 10);
        el.innerHTML = `<i class="fas fa-clock"></i> ${formatRemainingTime(exp - now)}`;
    });

    if (detailModal.classList.contains("open") && selectedRequestId) {
        const currentReq = requests.find((r) => r.id === selectedRequestId);
        if (currentReq) {
            document.getElementById("sos-detail-timer").textContent = formatRemainingTime(currentReq.expiresAt - now);
        } else {
            detailModal.classList.remove("open");
        }
    }
}, 1000);

let pendingRequestPayload = null;
const matchPopup = document.getElementById("match-popup");
const matchResultsList = document.getElementById("match-results-list");
const sosFeedback = document.getElementById("sos-feedback");

function publishSosRequest(payload) {
    const requests = getSosRequests();
    requests.unshift(payload);
    saveSosRequests(requests);
    renderActiveRequests();

    sosFeedback.textContent = "Buscando a un prestador... Tu solicitud ya aparece en las solicitudes actuales.";
    sosFeedback.className = "form-feedback success";
}

document.getElementById("close-match-popup").addEventListener("click", () => matchPopup.classList.remove("open"));
document.getElementById("done-match-btn").addEventListener("click", () => matchPopup.classList.remove("open"));

document.getElementById("publish-anyway-btn").addEventListener("click", () => {
    if (pendingRequestPayload) {
        publishSosRequest(pendingRequestPayload);
        pendingRequestPayload = null;
    }
    matchPopup.classList.remove("open");
});

document.getElementById("sos-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const selectedItem = itemSelect.value === "Otro" ? customItemInput.value.trim() : itemSelect.value;
    const pavilion = document.getElementById("sos-pavilion").value;
    const meeting = document.getElementById("sos-meeting").value.trim();
    const startsInMinutes = parseInt(document.getElementById("sos-starts-in").value, 10);
    const duration = document.getElementById("sos-duration").value;
    const tipValue = document.getElementById("sos-tip").value;
    const author = document.getElementById("sos-author").value.trim();
    const contact = document.getElementById("sos-contact").value.trim();

    if (!selectedItem || !pavilion || !startsInMinutes || !duration || tipValue === "" || !author || !contact) {
        sosFeedback.textContent = "Por favor, completa todos los campos obligatorios (*).";
        sosFeedback.className = "form-feedback error";
        return;
    }

    const newPayload = {
        id: "SOS-" + Date.now(),
        requesterEmail: currentUser.email,
        item: selectedItem,
        pavilion,
        meeting: meeting || "Punto por coordinar",
        duration,
        tip: `S/ ${parseFloat(tipValue).toFixed(2)}`,
        author,
        contact,
        expiresAt: Date.now() + startsInMinutes * 60 * 1000,
        acceptedBy: null
    };

    const matches = findEmergencyMatches(selectedItem);

    if (matches.length > 0) {
        pendingRequestPayload = newPayload;
        matchResultsList.innerHTML = "";

        matches.forEach((m) => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "match-item-card";
            itemDiv.innerHTML = `
                <h4>${m.title}</h4>
                <span class="match-item-meta">Publicado por: <strong>${m.ownerName}</strong> • Carrera: ${m.career}</span>
                <span class="match-item-meta">Tarifa referencial: ${m.price} • Disponible: ${m.dateFrom} al ${m.dateTo}</span>
                <span class="match-item-meta">${m.description}</span>
                <span class="match-item-contact"><i class="fas fa-phone-alt"></i> Contacto directo: ${m.contact}</span>
            `;
            matchResultsList.appendChild(itemDiv);
        });

        sosFeedback.textContent = "";
        matchPopup.classList.add("open");
    } else {
        publishSosRequest(newPayload);
        document.getElementById("sos-tip").value = "";
        document.getElementById("sos-meeting").value = "";
        if (itemSelect.value === "Otro") {
            customItemInput.value = "";
        }
    }
});

renderActiveRequests();