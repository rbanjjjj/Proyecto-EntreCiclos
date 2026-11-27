const menuOpenButton = document.querySelector("#menu-open-button")
const menuCloseButton = document.querySelector("#menu-close-button")

menuOpenButton.addEventListener("click", () => {
    document.body.classList.toggle("show-mobile-menu");
})

menuCloseButton.addEventListener("click", () => menuOpenButton.click())

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
    const questionBtn = item.querySelector(".faq-question");

    questionBtn.addEventListener("click", () => {
        const isOpen = item.classList.contains("active");

        faqItems.forEach((otherItem) => {
            otherItem.classList.remove("active");
            otherItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        });

        if (!isOpen) {
            item.classList.add("active");
            questionBtn.setAttribute("aria-expanded", "true");
        }
    });
});

const contactForm = document.getElementById("contact-form");
const contactFeedback = document.getElementById("contact-feedback");

if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("contact-name").value.trim();
        const email = document.getElementById("contact-email").value.trim().toLowerCase();
        const subject = document.getElementById("contact-subject").value.trim();
        const message = document.getElementById("contact-message").value.trim();

        if (!name || !email || !subject || !message) {
            contactFeedback.textContent = "Por favor, completa todos los campos.";
            contactFeedback.className = "form-feedback error";
            return;
        }

        if (!email.includes("@")) {
            contactFeedback.textContent = "Ingresa un correo electrónico válido.";
            contactFeedback.className = "form-feedback error";
            return;
        }

        contactFeedback.textContent = "Mensaje enviado con éxito. Nos pondremos en contacto contigo pronto.";
        contactFeedback.className = "form-feedback success";
        contactForm.reset();
    });
}