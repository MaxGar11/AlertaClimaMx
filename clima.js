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
    document.getElementById(
      "humedad"
    ).innerHTML = `💧 ${data.humedad_actual}%`;
    document.getElementById(
      "hum-promedio"
    ).innerHTML = `Promedio: ${data.prom_humedad}%`;
    document.getElementById(
      "viento"
    ).textContent = `💨 ${data.viento_actual} m/s`;
    document.getElementById(
      "radiacion"
    ).textContent = `☀ ${data.prom_radiacion}`;

    // 2.2) Graficar comparativa Actual vs Histórico
    graficarComparativa("compareChart", {
      actual: [data.temp_actual, data.humedad_actual, data.prom_radiacion], // ojo: radiación actual no la tienes, uso prom_radiacion
      historico: [data.prom_temp, data.prom_humedad, data.prom_radiacion],
    });

    // 2.3) Graficar serie histórica de temperatura
    graficarHistorico(
      "tempHistoryChart",
      data.hist_temp,
      "Temperatura diaria (°C)"
    );

    // 2.4) Graficar serie histórica de radiación
    graficarHistorico(
      "radiationHistoryChart",
      data.hist_radiacion,
      "Radiación diaria (W/m²)"
    );
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

function graficarHistorico(canvasId, histData, etiqueta) {
  // histData es un objeto { 'YYYYMMDD': valor, ... }
  const fechas = Object.keys(histData)
    .sort()
    .map((fecha) => {
      // Convertir 'YYYYMMDD' a 'YYYY-MM-DD'
      return (
        fecha.slice(0, 4) + "-" + fecha.slice(4, 6) + "-" + fecha.slice(6, 8)
      );
    });

  const valores = Object.keys(histData)
    .sort()
    .map((fecha) => histData[fecha]);

  const ctx = document.getElementById(canvasId).getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: fechas,
      datasets: [
        {
          label: etiqueta,
          data: fechas.map((fecha, i) => ({
            x: fecha,
            y: valores[i],
          })),
          fill: false,
          borderWidth: 2,
          tension: 0.3, // curva suave
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "month", // o "year" si prefieres por año
            tooltipFormat: "yyyy-MM-dd",
          },
          title: {
            display: true,
            text: "Fecha",
            font: {
              family: "Montserrat",
              weight: "bold",
            },
          },
          ticks: {
            font: {
              family: "Montserrat",
            },
          },
        },
        y: {
          title: {
            display: true,
            text: etiqueta,
            font: {
              family: "Montserrat",
              weight: "bold",
            },
          },
          ticks: {
            font: {
              family: "Montserrat",
            },
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            font: {
              family: "Montserrat",
            },
          },
        },
      },
      elements: {
        point: {
          radius: 0,
        },
      },
    },
  });
}

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
