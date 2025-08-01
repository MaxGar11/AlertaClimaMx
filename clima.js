// clima.js
// -----------------------------
// 1) Espera a que el DOM cargue
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("select-municipio")
    .addEventListener("change", (e) => {
      const municipio = e.target.value;
      obtenerClima(municipio);
    });

  obtenerClima();
});

// 2) Función principal: obtiene los datos y dispara todas las gráficas
async function obtenerClima(ciudad = "Puebla,MX") {
  try {
    document.getElementById("loader").style.display = "flex";

    const resp = await fetch(
      `http://127.0.0.1:5001/clima?ciudad=${encodeURIComponent(ciudad)}`
    );
    const data = await resp.json();

    if (data.error) {
      throw new Error(data.error);
    }

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

    // Elementos para análisis
    const cardAnalisis = document.getElementById("card-analisis");
    const headerAnalisis = document.getElementById("header-analisis");
    const textoAnalisis = document.getElementById("texto-analisis");

    // Limpiar clases anteriores
    headerAnalisis.classList.remove(
      "bg-success",
      "bg-warning",
      "bg-danger",
      "text-white"
    );

    // Mensajes según el color
    if (color === "green") {
      headerAnalisis.textContent = "🌱 Buen momento para el cultivo";
      headerAnalisis.classList.add("bg-success", "text-white");
      textoAnalisis.innerHTML = `
    Las condiciones climáticas actuales son ideales para la actividad agrícola.<br><br>
    ✅ <strong>Temperatura</strong> dentro del rango óptimo.<br>
    ✅ <strong>Humedad</strong> adecuada, sin riesgo de sequía o plagas.<br>
    ✅ <strong>Viento</strong> leve, sin efectos adversos.<br>
    ✅ <strong>Radiación solar</strong> apropiada para la fotosíntesis.<br><br>
    Este escenario representa una excelente oportunidad para sembrar o mantener cultivos en desarrollo.
  `;
    } else if (color === "yellow") {
      headerAnalisis.textContent = "⚠ Precaución: Condiciones moderadas";
      headerAnalisis.classList.add("bg-warning");
      textoAnalisis.innerHTML = `
    Se han detectado algunas condiciones que podrían afectar el cultivo:<br><br>
    ⚠ Uno o más factores como <strong>viento fuerte, humedad inadecuada o lluvias moderadas</strong> podrían representar un riesgo parcial.<br><br>
    No se recomienda iniciar nuevos cultivos sensibles, aunque algunos ya establecidos podrían resistir con cuidados adicionales.
  `;
    } else if (color === "red") {
      headerAnalisis.textContent = "⛔ Riesgo alto para cultivo";
      headerAnalisis.classList.add("bg-danger", "text-white");
      textoAnalisis.innerHTML = `
    Las condiciones climáticas actuales no son favorables para actividades agrícolas.<br><br>
    ❌ Se han detectado múltiples factores críticos como <strong>heladas, granizo, sequía, o estrés térmico</strong>.<br><br>
    Es recomendable esperar a que las condiciones mejoren antes de sembrar o realizar labores importantes en el campo.
  `;
    }

    // Mostrar lista de riesgos
    //const lista = document.getElementById("lista-riesgos");
    //lista.innerHTML = "";

    //if (data.riesgos.length > 0) {
    //data.riesgos.forEach((riesgo) => {
    //const li = document.createElement("li");
    //li.textContent = `⚠ ${riesgo}`;
    //lista.appendChild(li);
    // });
    //} else {
    //  const li = document.createElement("li");
    //  li.textContent = "✅ Sin riesgos detectados.";
    //  lista.appendChild(li);
    //}

    // Mostrar explicación del semáforo
    //const explicacion = document.getElementById("explicacion-semaforo");
    //if (color === "red") {
    //  explicacion.textContent =
    //    "El semáforo está en ROJO debido a múltiples riesgos críticos para el cultivo.";
    //} else if (color === "yellow") {
    //  explicacion.textContent =
    //    "El semáforo está en AMARILLO porque existen algunos riesgos que podrían afectar el cultivo.";
    //} else {
    //  explicacion.textContent =
    //    "El semáforo está en VERDE: las condiciones actuales son adecuadas para el cultivo.";
    //}

    const tbody = document.getElementById("tabla-umbrales");

    // Define los umbrales
    const variables = [
      {
        nombre: "🌡 Temperatura (°C)",
        valor: data.temp_actual,
        min: 5,
        max: 35,
      },
      {
        nombre: "💧 Humedad (%)",
        valor: data.humedad_actual,
        min: 30,
        max: 80,
      },
      {
        nombre: "💨 Viento (m/s)",
        valor: data.viento_actual,
        min: 0,
        max: 10,
      },
    ];

    // Construye el HTML en bloque
    let html = "";
    variables.forEach((v) => {
      const fueraDeRango = v.valor < v.min || v.valor > v.max;
      const clase = fueraDeRango ? "table-danger fw-bold" : "";
      const alerta = fueraDeRango ? " ⚠️" : "";

      html += `
    <tr>
      <td>${v.nombre}</td>
      <td class="${clase}">${v.valor}${alerta}</td>
      <td>${v.min}</td>
      <td>${v.max}</td>
    </tr>
  `;
    });
    console.log("Generando tabla de umbrales");
    console.log("Datos usados:", data);
    console.log("tbody:", tbody);
    // Ahora sí: reemplaza todo el contenido de la tabla
    tbody.innerHTML = html;

    // Obtiene la fecha y hora actual
    const ahora = new Date();
    const fechaHora = ahora.toLocaleString("es-MX", {
      dateStyle: "short",
      timeStyle: "short",
    });

    // Muestra en el contenedor
    document.getElementById(
      "ultima-actualizacion"
    ).textContent = `Última actualización: ${fechaHora}`;
  } catch (e) {
    console.error("Error obteniendo el clima:", e);
  } finally {
    document.getElementById("loader").style.display = "none";
  }
}

let compareChartInstance = null;

// 3) Función para barras dobles: actual vs promedio histórico
function graficarComparativa(canvasId, { actual, historico }) {
  const ctx = document.getElementById(canvasId).getContext("2d");

  // Si ya existe un gráfico previo, destrúyelo
  if (compareChartInstance) {
    compareChartInstance.destroy();
  }

  compareChartInstance = new Chart(ctx, {
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
