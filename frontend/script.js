const API = "http://localhost:3000/api";

// Verificar que el usuario esté logueado
const token = localStorage.getItem("token");
const usuario_id = localStorage.getItem("usuario_id");
const nombre = localStorage.getItem("nombre");

if (!token) {
    window.location.href = "index.html";
}

document.getElementById("nombre-usuario").textContent = `👤 ${nombre}`;

// Buscar clima
async function buscarClima() {
    const ciudad = document.getElementById("inputCiudad").value.trim();

    if (ciudad === "") {
        mostrarError("Por favor escribe una ciudad.");
        return;
    }

    try {
        const res = await fetch(`${API}/clima/buscar?ciudad=${ciudad}&usuario_id=${usuario_id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const datos = await res.json();

        if (!res.ok) {
            mostrarError(datos.error);
            return;
        }

        mostrarResultado(datos);
        cargarHistorial();

    } catch (error) {
        mostrarError("Error al conectar con el servidor.");
    }
}

function mostrarResultado(datos) {
    document.getElementById("error").textContent = "";
    document.getElementById("nombreCiudad").textContent = `📍 ${datos.name}, ${datos.sys.country}`;
    document.getElementById("temperatura").textContent = `${Math.round(datos.main.temp)}°C`;
    document.getElementById("descripcion").textContent = datos.weather[0].description;
    document.getElementById("humedad").textContent = `💧 Humedad: ${datos.main.humidity}%`;
    document.getElementById("viento").textContent = `💨 Viento: ${datos.wind.speed} m/s`;
    document.getElementById("resultado").style.display = "block";
}

function mostrarError(mensaje) {
    document.getElementById("resultado").style.display = "none";
    document.getElementById("error").textContent = mensaje;
}

// Cargar historial
async function cargarHistorial() {
    try {
        const res = await fetch(`${API}/historial/${usuario_id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const historial = await res.json();
        const cuerpo = document.getElementById("cuerpo-historial");
        cuerpo.innerHTML = "";

        historial.forEach(item => {
            const fecha = new Date(item.fecha).toLocaleString();
            cuerpo.innerHTML += `
                <tr>
                    <td>${item.ciudad}</td>
                    <td>${Math.round(item.temperatura)}°C</td>
                    <td>${item.descripcion}</td>
                    <td>${item.humedad}%</td>
                    <td>${fecha}</td>
                    <td><button class="btn-eliminar" onclick="eliminar(${item.id})">Eliminar</button></td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error al cargar historial:", error);
    }
}

// Eliminar registro
async function eliminar(id) {
    try {
        await fetch(`${API}/historial/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        cargarHistorial();
    } catch (error) {
        console.error("Error al eliminar:", error);
    }
}

// Buscar con Enter
document.getElementById("inputCiudad").addEventListener("keypress", (e) => {
    if (e.key === "Enter") buscarClima();
});

// Cerrar sesión
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

// Cargar historial al iniciar
cargarHistorial();

// Editar perfil
async function editarPerfil() {
    const nombre = document.getElementById("perfil-nombre").value.trim();
    const password = document.getElementById("perfil-password").value.trim();
    const msg = document.getElementById("msg-perfil");

    if (!nombre) {
        msg.style.color = "red";
        msg.textContent = "El nombre no puede estar vacío.";
        return;
    }

    try {
        const res = await fetch(`${API}/auth/perfil/${usuario_id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ nombre, password })
        });

        const datos = await res.json();

        if (!res.ok) {
            msg.style.color = "red";
            msg.textContent = datos.error;
            return;
        }

        msg.style.color = "green";
        msg.textContent = "¡Perfil actualizado correctamente!";
        localStorage.setItem("nombre", nombre);
        document.getElementById("nombre-usuario").textContent = `👤 ${nombre}`;
        document.getElementById("perfil-nombre").value = "";
        document.getElementById("perfil-password").value = "";

    } catch (error) {
        msg.style.color = "red";
        msg.textContent = "Error al conectar con el servidor.";
    }
}