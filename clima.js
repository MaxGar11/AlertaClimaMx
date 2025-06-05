// clima.js
// -----------------------------
// 1) Espera a que el DOM cargue
document.addEventListener("DOMContentLoaded", () => {
  obtenerClima();
});

// 2) Función principal: obtiene los datos y dispara todas las gráficas
async function obtenerClima() {
  try {
    const resp = await fetch("http://127.0.0.1:5001/clima");
    const data = await resp.json();

    // 2.1) Actualiza estadísticas actuales
    document.getElementById("ciudad").textContent = `📍 ${data.ciudad}`;
    document.getElementById(
      "temp-actual"
    ).innerHTML = `🌡️ ${data.temp_actual}°C`;
    document.getElementById(
      "temp-promedio"
    ).innerHTML = `Promedio: ${data.prom_temp}°C`;
    document.getElementById("humedad").innerHTML = `💧 ${data.humedad_actual}%`;
    document.getElementById(
      "hum-promedio"
    ).innerHTML = `Promedio: ${data.prom_humedad}%`;
    document.getElementById(
      "viento"
    ).textContent = `💨 ${data.viento_actual} m/s`;
    document.getElementById(
      "radiacion"
    ).textContent = `🌞 ${data.prom_radiacion}`;

    // 2.2) Graficar comparativa Actual vs Histórico
    graficarComparativa("compareChart", {
      actual: [data.temp_actual, data.humedad_actual, data.prom_radiacion], // ojo: radiación actual no la tienes, uso prom_radiacion
      historico: [data.prom_temp, data.prom_humedad, data.prom_radiacion],
    });

    // decideCultivo() ya está definida; ahora agrégala al flujo
    const color = decideCultivo(data);
    updateTrafficLight(color);

    // Mostrar lista de riesgos
    const lista = document.getElementById("lista-riesgos");
    lista.innerHTML = "";

    if (data.riesgos.length > 0) {
      data.riesgos.forEach((riesgo) => {
        const li = document.createElement("li");
        li.textContent = `⚠ ${riesgo}`;
        lista.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.textContent = "✅ Sin riesgos detectados.";
      lista.appendChild(li);
    }

    // Mostrar explicación del semáforo
    const explicacion = document.getElementById("explicacion-semaforo");
    if (color === "red") {
      explicacion.textContent =
        "El semáforo está en ROJO debido a múltiples riesgos críticos para el cultivo.";
    } else if (color === "yellow") {
      explicacion.textContent =
        "El semáforo está en AMARILLO porque existen algunos riesgos que podrían afectar el cultivo.";
    } else {
      explicacion.textContent =
        "El semáforo está en VERDE: las condiciones actuales son adecuadas para el cultivo.";
    }
  } catch (e) {
    console.error("Error obteniendo el clima:", e);
  }
}

// 3) Función para barras dobles: actual vs promedio histórico
function graficarComparativa(canvasId, { actual, historico }) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Temp (°C)", "Humedad (%)", "Radiación"],
      datasets: [
        {
          label: "Actual",
          data: actual,
          backgroundColor: "rgba(54, 162, 235, 0.4)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
        {
          label: "Histórico",
          data: historico,
          backgroundColor: "rgba(255, 99, 132, 0.4)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

function updateTrafficLight(status) {
  ["red", "yellow", "green"].forEach((color) => {
    const el = document.getElementById(`light-${color}`);
    if (!el) return;
    el.classList.toggle("on", status === color);
  });
}

// Ejemplo de función que decide el estado de cultivo
function decideCultivo(datosClima) {
  const riesgos = datosClima.riesgos || [];

  if (riesgos.length >= 3) {
    return "red"; // Riesgo alto
  } else if (riesgos.length > 0) {
    return "yellow"; // Riesgo moderado
  } else {
    return "green"; // Todo en orden
  }
}
