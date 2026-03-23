const API = "http://localhost:3000/api";

const token = localStorage.getItem("token");
const usuario_id = localStorage.getItem("usuario_id");
const nombre = localStorage.getItem("nombre");

if (!token) {
    window.location.href = "index.html";
}

document.getElementById("nombre-usuario").textContent = `👤 ${nombre}`;

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

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}