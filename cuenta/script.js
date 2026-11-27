const menuOpenButton = document.querySelector("#menu-open-button")
const menuCloseButton = document.querySelector("#menu-close-button")

menuOpenButton.addEventListener("click", () => {
    document.body.classList.toggle("show-mobile-menu");
})

menuCloseButton.addEventListener("click", () => menuOpenButton.click())

const authTabs = document.querySelectorAll(".auth-tab");
const authForms = document.querySelectorAll(".auth-form");

authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        authTabs.forEach((btn) => btn.classList.remove("active"));
        authForms.forEach((form) => form.classList.remove("active"));

        tab.classList.add("active");
        const targetForm = document.getElementById(tab.dataset.target);
        if (targetForm) {
            targetForm.classList.add("active");
        }
    });
});

const togglePasswordButtons = document.querySelectorAll(".toggle-password");

togglePasswordButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.input);
        const icon = button.querySelector("i");

        if (input.type === "password") {
            input.type = "text";
            icon.classList.replace("fa-eye", "fa-eye-slash");
        } else {
            input.type = "password";
            icon.classList.replace("fa-eye-slash", "fa-eye");
        }
    });
});

const ALLOWED_DOMAIN = "@aloe.ulima.edu.pe";

function isValidInstitutionalEmail(email) {
    const cleanEmail = email.trim().toLowerCase();
    const parts = cleanEmail.split("@");
    return (
        parts.length === 2 &&
        parts[0].length > 0 &&
        cleanEmail.endsWith(ALLOWED_DOMAIN)
    );
}

function showFeedback(element, message, type) {
    element.textContent = message;
    element.className = `form-feedback ${type}`;
}

const registerForm = document.getElementById("register-form");
const registerFeedback = document.getElementById("register-feedback");

if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("reg-name").value.trim();
        const email = document.getElementById("reg-email").value.trim().toLowerCase();
        const password = document.getElementById("reg-password").value;
        const confirm = document.getElementById("reg-confirm").value;

        if (!name) {
            showFeedback(registerFeedback, "Ingresa tu nombre completo.", "error");
            return;
        }

        if (!isValidInstitutionalEmail(email)) {
            showFeedback(registerFeedback, "Solo se permiten correos @aloe.ulima.edu.pe.", "error");
            return;
        }

        if (password.length < 8) {
            showFeedback(registerFeedback, "La contraseña debe tener al menos 8 caracteres.", "error");
            return;
        }

        if (password !== confirm) {
            showFeedback(registerFeedback, "Las contraseñas no coinciden.", "error");
            return;
        }

        const users = JSON.parse(localStorage.getItem("entreCiclosUsers") || "[]");
        const alreadyExists = users.some((user) => user.email === email);

        if (alreadyExists) {
            showFeedback(registerFeedback, "Este correo institucional ya está registrado.", "error");
            return;
        }

        users.push({ name, email, password });
        localStorage.setItem("entreCiclosUsers", JSON.stringify(users));
        localStorage.setItem("entreCiclosSession", JSON.stringify({ name, email }));

        showFeedback(registerFeedback, "Cuenta creada con éxito. Redirigiendo...", "success");
        registerForm.reset();

        setTimeout(() => {
            window.location.href = "../miespacio/myspace.html";
        }, 1200);
    });
}

const loginForm = document.getElementById("login-form");
const loginFeedback = document.getElementById("login-feedback");

if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("login-email").value.trim().toLowerCase();
        const password = document.getElementById("login-password").value;

        if (!isValidInstitutionalEmail(email)) {
            showFeedback(loginFeedback, "Debes usar un correo @aloe.ulima.edu.pe.", "error");
            return;
        }

        const users = JSON.parse(localStorage.getItem("entreCiclosUsers") || "[]");
        const matchedUser = users.find((user) => user.email === email && user.password === password);

        if (!matchedUser) {
            showFeedback(loginFeedback, "Correo o contraseña incorrectos.", "error");
            return;
        }

        localStorage.setItem("entreCiclosSession", JSON.stringify({ name: matchedUser.name, email: matchedUser.email }));
        showFeedback(loginFeedback, `Bienvenido, ${matchedUser.name}. Redirigiendo...`, "success");

        setTimeout(() => {
            window.location.href = "../miespacio/myspace.html";
        }, 1000);
    });
}