const API = "http://localhost:3000/api";

function mostrarTab(tab) {
    document.getElementById("tab-login").style.display = tab === "login" ? "block" : "none";
    document.getElementById("tab-registro").style.display = tab === "registro" ? "block" : "none";

    document.querySelectorAll(".tab").forEach(t => t.classList.remove("activo"));
    event.target.classList.add("activo");
}

async function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const msg = document.getElementById("msg-login");

    try {
        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const datos = await res.json();

        if (!res.ok) {
            msg.style.color = "red";
            msg.textContent = datos.error;
            return;
        }

        localStorage.setItem("token", datos.token);
        localStorage.setItem("nombre", datos.nombre);
        localStorage.setItem("usuario_id", datos.id);
        window.location.href = "home.html";

    } catch (error) {
        msg.style.color = "red";
        msg.textContent = "Error al conectar con el servidor";
    }
}

async function registro() {
    const nombre = document.getElementById("reg-nombre").value;
    const curp = document.getElementById("reg-curp").value.trim().toUpperCase();
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    const password2 = document.getElementById("reg-password2").value;
    const msg = document.getElementById("msg-registro");

    if (!password) {
        msg.style.color = "red";
        msg.textContent = "Por favor escribe una contraseña.";
        return;
    }

    if (password !== password2) {
        msg.style.color = "red";
        msg.textContent = "Las contraseñas no coinciden.";
        return;
    }

    try {
        const res = await fetch(`${API}/auth/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, curp, email, password })
        });

        const datos = await res.json();

        if (!res.ok) {
            msg.style.color = "red";
            msg.textContent = datos.error;
            return;
        }

        msg.style.color = "green";
        msg.textContent = "¡Registro exitoso! Ahora inicia sesión.";

    } catch (error) {
        msg.style.color = "red";
        msg.textContent = "Error al conectar con el servidor.";
    }
}

function siguientePaso(paso) {
    const msg = document.getElementById("msg-registro");

    if (paso === 1) {
        const nombre = document.getElementById("reg-nombre").value.trim();
        const curp = document.getElementById("reg-curp").value.trim().toUpperCase();
        const curpRegex = /^[A-Z]{4}[0-9]{6}[A-Z]{6}[0-9A-Z]{2}$/;
    
        if (!nombre) {
            msg.style.color = "red";
            msg.textContent = "Por favor escribe tu nombre.";
            return;
        }
    
        if (!curp) {
            msg.style.color = "red";
            msg.textContent = "Por favor escribe tu CURP.";
            return;
        }
    
        if (!curpRegex.test(curp)) {
            msg.style.color = "red";
            msg.textContent = "CURP inválida. Debe tener 18 caracteres con el formato correcto.";
            return;
        }
    }

    if (paso === 2) {
        const email = document.getElementById("reg-email").value.trim();
        if (!email) {
            msg.style.color = "red";
            msg.textContent = "Por favor escribe tu correo.";
            return;
        }
    }

    msg.textContent = "";
    document.getElementById(`paso-${paso}`).style.display = "none";
    document.getElementById(`paso-${paso + 1}`).style.display = "flex";
    document.getElementById(`indicador-${paso}`).classList.remove("activo");
    document.getElementById(`indicador-${paso}`).classList.add("completado");
    document.getElementById(`indicador-${paso + 1}`).classList.add("activo");
}

function anteriorPaso(paso) {
    document.getElementById(`paso-${paso}`).style.display = "none";
    document.getElementById(`paso-${paso - 1}`).style.display = "flex";
    document.getElementById(`indicador-${paso}`).classList.remove("activo");
    document.getElementById(`indicador-${paso - 1}`).classList.remove("completado");
    document.getElementById(`indicador-${paso - 1}`).classList.add("activo");
}

function irAPaso(paso) {
    // Solo permitir ir a pasos anteriores o al actual
    const pasoActual = document.querySelector(".paso.activo");
    const numeroPasoActual = parseInt(pasoActual.id.split("-")[1]);
    
    if (paso >= numeroPasoActual) return;

    document.getElementById(`paso-${numeroPasoActual}`).style.display = "none";
    document.getElementById(`paso-${paso}`).style.display = "flex";
    document.getElementById(`indicador-${numeroPasoActual}`).classList.remove("activo");
    document.getElementById(`indicador-${numeroPasoActual}`).classList.remove("completado");
    document.getElementById(`indicador-${paso}`).classList.remove("completado");
    document.getElementById(`indicador-${paso}`).classList.add("activo");
}