from flask import Flask, jsonify
from flask_cors import CORS
import requests
import datetime

app = Flask(__name__)
CORS(app)

# API Key de OpenWeatherMap
API_KEY = "a5ab028cba1c32f653a6af3e0d7a8718"

# Ubicación (Puebla, México)
CIUDAD = "Puebla,MX"
LAT = 19.0437
LON = -98.1986

@app.route('/clima', methods=['GET'])
def obtener_clima():
    try:
        # URL de OpenWeather
        url_weather = f"http://api.openweathermap.org/data/2.5/weather?q={CIUDAD}&appid={API_KEY}&units=metric&lang=es"
        response_weather = requests.get(url_weather)

        # URL de NASA POWER (últimos 10 años)
        fecha_actual = datetime.datetime.today()
        fecha_inicio = fecha_actual.replace(year=fecha_actual.year - 10).strftime('%Y%m%d')
        fecha_fin = fecha_actual.strftime('%Y%m%d')
        url_nasa = f"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,ALLSKY_SFC_SW_DWN,RH2M&community=SB&longitude={LON}&latitude={LAT}&start={fecha_inicio}&end={fecha_fin}&format=JSON"
        response_nasa = requests.get(url_nasa)

        if response_weather.status_code == 200 and response_nasa.status_code == 200:
            # Procesar datos
            data_weather = response_weather.json()
            data_nasa = response_nasa.json()

            temp_actual = data_weather["main"]["temp"]
            humedad_actual = data_weather["main"]["humidity"]
            viento_actual = data_weather["wind"]["speed"]
            descripcion = data_weather["weather"][0]["description"]

            temps_hist = data_nasa["properties"]["parameter"]["T2M"]
            humedad_hist = data_nasa["properties"]["parameter"]["RH2M"]
            radiacion_hist = data_nasa["properties"]["parameter"]["ALLSKY_SFC_SW_DWN"]

            # Calcular promedios históricos
            prom_temp = sum(temps_hist.values()) / len(temps_hist)
            prom_humedad = sum(humedad_hist.values()) / len(humedad_hist)
            prom_radiacion = sum(radiacion_hist.values()) / len(radiacion_hist)

            return jsonify({
                "ciudad": CIUDAD,
                "temp_actual": temp_actual,
                "humedad_actual": humedad_actual,
                "viento_actual": viento_actual,
                "descripcion": descripcion.capitalize(),
                "prom_temp": round(prom_temp, 2),
                "prom_humedad": round(prom_humedad, 2),
                "prom_radiacion": round(prom_radiacion, 2)
            })
        else:
            return jsonify({"error": "No se pudieron obtener los datos"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5500)
