const API = "http://localhost:3000/api";

const token = localStorage.getItem("token");
const usuario_id = localStorage.getItem("usuario_id");
const nombre = localStorage.getItem("nombre");

if (!token) {
    window.location.href = "index.html";
}

document.getElementById("nombre-usuario").textContent = `👤 ${nombre}`;

async function cargarEventosDisponibles() {
    try {
        const res = await fetch(`${API}/reservas/disponibles/todos`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const eventos = await res.json();
        const cuerpo = document.getElementById("cuerpo-eventos-disponibles");
        cuerpo.innerHTML = "";

        if (eventos.length === 0) {
            cuerpo.innerHTML = "<tr><td colspan='7' style='text-align:center'>No hay eventos disponibles</td></tr>";
            return;
        }

        eventos.forEach(evento => {
            const fecha = new Date(evento.fecha).toLocaleDateString("es-MX");
            const temp = evento.temperatura ? `${Math.round(evento.temperatura)}°C` : "N/A";
            cuerpo.innerHTML += `
                <tr>
                    <td>${evento.nombre}</td>
                    <td>${evento.organizador}</td>
                    <td>${evento.ciudad}</td>
                    <td>${fecha}</td>
                    <td>${temp}</td>
                    <td>${evento.descripcion}</td>
                    <td><button class="btn-guardar" onclick="reservar(${evento.id})">Reservar</button></td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error al cargar eventos:", error);
    }
}

async function reservar(evento_id) {
    const msg = document.getElementById("msg-reserva");
    try {
        const res = await fetch(`${API}/reservas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ usuario_id, evento_id })
        });

        const datos = await res.json();

        if (!res.ok) {
            msg.style.color = "red";
            msg.textContent = datos.error;
            return;
        }

        msg.style.color = "green";
        msg.textContent = "¡Reserva realizada correctamente!";
        cargarReservas();

    } catch (error) {
        msg.style.color = "red";
        msg.textContent = "Error al conectar con el servidor.";
    }
}

async function cargarReservas() {
    try {
        const res = await fetch(`${API}/reservas/${usuario_id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const reservas = await res.json();
        const cuerpo = document.getElementById("cuerpo-reservas");
        cuerpo.innerHTML = "";

        if (reservas.length === 0) {
            cuerpo.innerHTML = "<tr><td colspan='7' style='text-align:center'>No tienes reservas</td></tr>";
            return;
        }

        reservas.forEach(reserva => {
            const fecha = new Date(reserva.fecha).toLocaleDateString("es-MX");
            const temp = reserva.temperatura ? `${Math.round(reserva.temperatura)}°C` : "N/A";
            cuerpo.innerHTML += `
                <tr>
                    <td>${reserva.nombre}</td>
                    <td>${reserva.organizador}</td>
                    <td>${reserva.ciudad}</td>
                    <td>${fecha}</td>
                    <td>${temp}</td>
                    <td>${reserva.descripcion}</td>
                    <td><button class="btn-eliminar" onclick="cancelarReserva(${reserva.id})">Cancelar</button></td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error al cargar reservas:", error);
    }
}

async function cancelarReserva(id) {
    try {
        await fetch(`${API}/reservas/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        cargarReservas();
    } catch (error) {
        console.error("Error al cancelar reserva:", error);
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

cargarEventosDisponibles();
cargarReservas();