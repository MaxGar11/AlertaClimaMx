async function obtenerClima() {
    try {
        let response = await fetch("http://127.0.0.1:5001/clima");
        let data = await response.json();

        document.getElementById("clima-actual").innerHTML = `
            <p><strong>📍 Ciudad:</strong> ${data.ciudad}</p>
            <p><strong>🌡️ Temperatura Actual:</strong> ${data.temp_actual}°C (Histórico: ${data.prom_temp}°C)</p>
            <p><strong>💧 Humedad:</strong> ${data.humedad_actual}% (Histórico: ${data.prom_humedad}%)</p>
            <p><strong>💨 Viento:</strong> ${data.viento_actual} m/s</p>
            <p><strong>🌤️ Descripción:</strong> ${data.descripcion}</p>
        `;
    } catch (error) {
        console.error("Error obteniendo el clima:", error);
    }
}

// Llamar a la función cuando cargue la página
window.onload = obtenerClima;
