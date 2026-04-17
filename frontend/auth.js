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

function validarPaso1() {
    const nombre = document.getElementById("reg-nombre").value.trim();
    const apellido = document.getElementById("reg-apellido").value.trim();
    const fechaNac = document.getElementById("reg-fecha-nac").value;
    const edad = parseInt(document.getElementById("reg-edad").value);
    const genero = document.getElementById("reg-genero").value;
    const curp = document.getElementById("reg-curp").value.trim().toUpperCase();
    const msg = document.getElementById("msg-registro");

    // Requeridos
    if (!nombre || !apellido || !fechaNac || !edad || !genero || !curp) {
        msg.style.color = "red";
        msg.textContent = "Todos los campos son obligatorios.";
        return false;
    }

    // Longitud nombre y apellido
    if (nombre.length < 2 || nombre.length > 50) {
        msg.style.color = "red";
        msg.textContent = "El nombre debe tener entre 2 y 50 caracteres.";
        return false;
    }

    if (apellido.length < 2 || apellido.length > 50) {
        msg.style.color = "red";
        msg.textContent = "El apellido debe tener entre 2 y 50 caracteres.";
        return false;
    }

    // Caracteres válidos (solo letras y espacios)
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!soloLetras.test(nombre)) {
        msg.style.color = "red";
        msg.textContent = "El nombre solo puede contener letras.";
        return false;
    }

    if (!soloLetras.test(apellido)) {
        msg.style.color = "red";
        msg.textContent = "El apellido solo puede contener letras.";
        return false;
    }

    // Coherencia edad vs fecha de nacimiento
    const hoy = new Date();
    const nacimiento = new Date(fechaNac);
    const edadCalculada = hoy.getFullYear() - nacimiento.getFullYear();
    const diff = edadCalculada - edad;

    if (diff < -1 || diff > 1) {
        msg.style.color = "red";
        msg.textContent = "La edad no coincide con la fecha de nacimiento.";
        return false;
    }

    // CURP
    const curpRegex = /^[A-Z]{4}[0-9]{6}[A-Z]{6}[0-9A-Z]{2}$/;
    if (!curpRegex.test(curp)) {
        msg.style.color = "red";
        msg.textContent = "CURP inválida. Debe tener 18 caracteres con el formato correcto.";
        return false;
    }

    msg.textContent = "";
    return true;
}

function validarPaso2() {
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const password2 = document.getElementById("reg-password2").value;
    const telefono = document.getElementById("reg-telefono").value.trim();
    const msg = document.getElementById("msg-registro");

    // Requeridos
    if (!email || !password || !password2 || !telefono) {
        msg.style.color = "red";
        msg.textContent = "Correo, contraseña y teléfono son obligatorios.";
        return false;
    }

    // Formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        msg.style.color = "red";
        msg.textContent = "El correo electrónico no tiene un formato válido.";
        return false;
    }

    // Longitud contraseña
    if (password.length < 6) {
        msg.style.color = "red";
        msg.textContent = "La contraseña debe tener al menos 6 caracteres.";
        return false;
    }

    // Contraseñas coinciden
    if (password !== password2) {
        msg.style.color = "red";
        msg.textContent = "Las contraseñas no coinciden.";
        return false;
    }

    // Formato teléfono (10 dígitos)
    const telRegex = /^[0-9]{10}$/;
    if (!telRegex.test(telefono)) {
        msg.style.color = "red";
        msg.textContent = "El teléfono debe tener exactamente 10 dígitos.";
        return false;
    }

    // Teléfono alternativo (opcional pero si se llena debe ser válido)
    const telefonoAlt = document.getElementById("reg-telefono-alt").value.trim();
    if (telefonoAlt && !telRegex.test(telefonoAlt)) {
        msg.style.color = "red";
        msg.textContent = "El teléfono alternativo debe tener exactamente 10 dígitos.";
        return false;
    }

    msg.textContent = "";
    return true;
}

function validarPaso3() {
    const calle = document.getElementById("reg-calle").value.trim();
    const numExt = document.getElementById("reg-num-ext").value.trim();
    const colonia = document.getElementById("reg-colonia").value.trim();
    const ciudad = document.getElementById("reg-ciudad").value.trim();
    const estado = document.getElementById("reg-estado").value.trim();
    const pais = document.getElementById("reg-pais").value.trim();
    const cp = document.getElementById("reg-cp").value.trim();
    const msg = document.getElementById("msg-registro");

    // Campos obligatorios
    if (!calle || !numExt || !colonia || !ciudad || !estado || !pais || !cp) {
        msg.style.color = "red";
        msg.textContent = "Todos los campos de dirección son obligatorios excepto número interior.";
        return false;
    }

    // Formato código postal (5 dígitos)
    const cpRegex = /^[0-9]{5}$/;
    if (!cpRegex.test(cp)) {
        msg.style.color = "red";
        msg.textContent = "El código postal debe tener exactamente 5 dígitos.";
        return false;
    }

    // Consistencia estado-ciudad (no pueden ser iguales)
    if (estado.toLowerCase() === ciudad.toLowerCase()) {
        msg.style.color = "red";
        msg.textContent = "La ciudad y el estado no pueden ser iguales.";
        return false;
    }

    msg.textContent = "";
    return true;
}

function siguientePaso(paso) {
    if (paso === 1 && !validarPaso1()) return;
    if (paso === 2 && !validarPaso2()) return;

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
    const pasoActual = document.querySelector(".paso.activo");
    const numeroPasoActual = parseInt(pasoActual.id.split("-")[1]);

    if (paso === numeroPasoActual) return;

    document.getElementById(`paso-${numeroPasoActual}`).style.display = "none";
    document.getElementById(`paso-${paso}`).style.display = "flex";

    document.querySelectorAll(".paso").forEach((p, i) => {
        p.classList.remove("activo", "completado");
        if (i + 1 < paso) p.classList.add("completado");
        if (i + 1 === paso) p.classList.add("activo");
    });
}

async function registro() {
    if (!validarPaso3()) return;

    const datos = {
        nombre: document.getElementById("reg-nombre").value.trim(),
        apellido: document.getElementById("reg-apellido").value.trim(),
        fecha_nacimiento: document.getElementById("reg-fecha-nac").value,
        edad: document.getElementById("reg-edad").value,
        genero: document.getElementById("reg-genero").value,
        curp: document.getElementById("reg-curp").value.trim().toUpperCase(),
        email: document.getElementById("reg-email").value.trim(),
        password: document.getElementById("reg-password").value,
        telefono: document.getElementById("reg-telefono").value.trim(),
        telefono_alt: document.getElementById("reg-telefono-alt").value.trim(),
        calle: document.getElementById("reg-calle").value.trim(),
        num_exterior: document.getElementById("reg-num-ext").value.trim(),
        num_interior: document.getElementById("reg-num-int").value.trim(),
        colonia: document.getElementById("reg-colonia").value.trim(),
        ciudad: document.getElementById("reg-ciudad").value.trim(),
        estado: document.getElementById("reg-estado").value.trim(),
        pais: document.getElementById("reg-pais").value.trim(),
        codigo_postal: document.getElementById("reg-cp").value.trim()
    };

    try {
        const res = await fetch(`${API}/auth/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        const respuesta = await res.json();

        if (!res.ok) {
            document.getElementById("msg-registro").style.color = "red";
            document.getElementById("msg-registro").textContent = respuesta.error;
            return;
        }

        document.getElementById("msg-registro").style.color = "green";
        document.getElementById("msg-registro").textContent = "¡Registro exitoso! Ahora inicia sesión.";

    } catch (error) {
        document.getElementById("msg-registro").style.color = "red";
        document.getElementById("msg-registro").textContent = "Error al conectar con el servidor.";
    }
}