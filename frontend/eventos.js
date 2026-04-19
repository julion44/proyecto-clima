const API = "http://localhost:3000/api";

const token = localStorage.getItem("token");
const usuario_id = localStorage.getItem("usuario_id");
const nombre = localStorage.getItem("nombre");

if (!token) {
    window.location.href = "index.html";
}

document.getElementById("nombre-usuario").textContent = `👤 ${nombre}`;

// Funciones del wizard
function siguientePasoEvento(paso) {
    const msg = document.getElementById("msg-evento");

    if (paso === 1) {
        const nombre = document.getElementById("evento-nombre").value.trim();
        if (!nombre) {
            msg.style.color = "red";
            msg.textContent = "Por favor escribe el nombre del evento.";
            return;
        }
    }

    if (paso === 2) {
        const ciudad = document.getElementById("evento-ciudad").value.trim();
        const fecha = document.getElementById("evento-fecha").value;

        if (!ciudad || !fecha) {
            msg.style.color = "red";
            msg.textContent = "Por favor llena todos los campos.";
            return;
        }

        const hoy = new Date();
        const fechaEvento = new Date(fecha);
        hoy.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((fechaEvento - hoy) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            msg.style.color = "red";
            msg.textContent = "La fecha no puede ser pasada.";
            return;
        }

        if (diffDays > 5) {
            msg.style.color = "red";
            msg.textContent = "Solo puedes registrar eventos con hasta 5 días de anticipación.";
            return;
        }
    }

    msg.textContent = "";
    document.getElementById(`evento-paso-${paso}`).style.display = "none";
    document.getElementById(`evento-paso-${paso + 1}`).style.display = "flex";
    document.getElementById(`evento-ind-${paso}`).classList.remove("activo");
    document.getElementById(`evento-ind-${paso}`).classList.add("completado");
    document.getElementById(`evento-ind-${paso + 1}`).classList.add("activo");

    // Mostrar resumen en paso 3
    if (paso === 2) {
        const nombre = document.getElementById("evento-nombre").value;
        const ciudad = document.getElementById("evento-ciudad").value;
        const fecha = document.getElementById("evento-fecha").value;
        document.getElementById("resumen-evento").innerHTML = `
            🎵 <b>Evento:</b> ${nombre}<br>
            📍 <b>Ciudad:</b> ${ciudad}<br>
            📅 <b>Fecha:</b> ${fecha}
        `;
    }
}

function anteriorPasoEvento(paso) {
    document.getElementById(`evento-paso-${paso}`).style.display = "none";
    document.getElementById(`evento-paso-${paso - 1}`).style.display = "flex";
    document.getElementById(`evento-ind-${paso}`).classList.remove("activo");
    document.getElementById(`evento-ind-${paso - 1}`).classList.remove("completado");
    document.getElementById(`evento-ind-${paso - 1}`).classList.add("activo");
}

async function registrarEvento() {
    const nombre_evento = document.getElementById("evento-nombre").value.trim();
    const ciudad = document.getElementById("evento-ciudad").value.trim();
    const fecha = document.getElementById("evento-fecha").value;
    const msg = document.getElementById("msg-evento");

    try {
        const res = await fetch(`${API}/eventos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ usuario_id, nombre: nombre_evento, ciudad, fecha })
        });

        const datos = await res.json();

        if (!res.ok) {
            msg.style.color = "red";
            msg.textContent = datos.error;
            return;
        }

        msg.style.color = "green";
        msg.textContent = "¡Evento registrado correctamente!";
        document.getElementById("evento-nombre").value = "";
        document.getElementById("evento-ciudad").value = "";
        document.getElementById("evento-fecha").value = "";

        // Resetear wizard
        document.getElementById("evento-paso-3").style.display = "none";
        document.getElementById("evento-paso-1").style.display = "flex";
        document.querySelectorAll(".paso").forEach((p, i) => {
            p.classList.remove("activo", "completado");
            if (i === 0) p.classList.add("activo");
        });

        cargarEventos();

    } catch (error) {
        msg.style.color = "red";
        msg.textContent = "Error al conectar con el servidor.";
    }
}

async function cargarEventos() {
    try {
        const res = await fetch(`${API}/eventos/${usuario_id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const eventos = await res.json();
        const cuerpo = document.getElementById("cuerpo-eventos");
        cuerpo.innerHTML = "";

        if (eventos.length === 0) {
            cuerpo.innerHTML = "<tr><td colspan='6' style='text-align:center'>No tienes eventos registrados</td></tr>";
            return;
        }

        eventos.forEach(evento => {
            const fecha = new Date(evento.fecha).toLocaleDateString("es-MX");
            const temp = evento.temperatura ? `${Math.round(evento.temperatura)}°C` : "N/A";
            cuerpo.innerHTML += `
                <tr>
                    <td>${evento.nombre}</td>
                    <td>${evento.ciudad}</td>
                    <td>${fecha}</td>
                    <td>${temp}</td>
                    <td>${evento.descripcion}</td>
                    <td><button class="btn-eliminar" onclick="eliminarEvento(${evento.id})">Eliminar</button></td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error al cargar eventos:", error);
    }
}

async function eliminarEvento(id) {
    try {
        await fetch(`${API}/eventos/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        cargarEventos();
    } catch (error) {
        console.error("Error al eliminar evento:", error);
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

cargarEventos();