import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Path to the models directory
MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))

import requests
from datetime import datetime, timedelta

PREDICTION_CACHE = {}
PREDICTION_CACHE_TTL_SECONDS = 30 * 60


def _cache_key(city, base_aqi):
    normalized_city = (city or "").strip().lower()
    base = int(round(base_aqi)) if isinstance(base_aqi, (int, float)) else None
    return f"{normalized_city}|{base}"


def _get_cached_prediction(cache_key):
    record = PREDICTION_CACHE.get(cache_key)
    if not record:
        return None

    age = (datetime.utcnow() - record["created_at"]).total_seconds()
    if age > PREDICTION_CACHE_TTL_SECONDS:
        del PREDICTION_CACHE[cache_key]
        return None
    return record["payload"]


def _set_cached_prediction(cache_key, payload):
    PREDICTION_CACHE[cache_key] = {
        "created_at": datetime.utcnow(),
        "payload": payload
    }


def _build_baseline_forecast(base_aqi, days=7):
    base = max(0, min(500, int(round(base_aqi))))
    data = []
    for i in range(1, days + 1):
        dt = (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d")
        wave = ((i % 3) - 1) * 3
        data.append({"date": dt, "aqi": max(0, min(500, base + wave))})
    return data

def calculate_pm25_aqi(pm25):
    if pm25 <= 12: return round((50 / 12) * pm25)
    if pm25 <= 35.4: return round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51)
    if pm25 <= 55.4: return round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101)
    if pm25 <= 150.4: return round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151)
    if pm25 <= 250.4: return round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201)
    return round(((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5) + 301)

def get_primary_history_token():
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                if "VITE_OPENAQ_TOKEN" in line:
                    return line.split("=")[1].strip()
    return "b590e813cc01928caf2e17f4e6dc48ae4605022cd71d5f3a496833406dc65cb8"

def get_secondary_token():
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                if "VITE_WAQI_TOKEN" in line:
                    return line.split("=")[1].strip()
    return "20a6538b9758e578da7054694df6f98797f1e68b"

# Monitoring Constants
REGION_ID = 9
PARAMETER_ID = 2

def parse_iso_dt(dt_str):
    if not dt_str: return None
    try:
        return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    except: return None

def fetch_recent_pm25_aqi(city, days_back=14, limit_points=14):
    """Fetch recent daily PM2.5-based AQI points for a city from OpenAQ."""
    auth_token = get_primary_history_token()
    headers = {"X-API-Key": auth_token, "Accept": "application/json"}

    # 1) Find active PM2.5 monitoring locations in India and match city.
    loc_url = "https://api.openaq.org/v3/locations"
    loc_params = {
        "countries_id": REGION_ID,
        "parameters_id": PARAMETER_ID,
        "monitor": "true",
        "limit": 1000
    }
    loc_res = requests.get(loc_url, headers=headers, params=loc_params, timeout=10).json()

    query = city.strip().split(',')[0].lower()
    candidates = loc_res.get("results", [])
    matches = [
        l for l in candidates
        if query in l.get("name", "").lower()
        or (l.get("locality") and query in l.get("locality", "").lower())
        or (l.get("label") and query in l.get("label", "").lower())
    ]

    if not matches:
        # fallback search by query when strict filtering misses naming variations
        q_url = f"https://api.openaq.org/v3/locations?q={requests.utils.quote(city)}&limit=20"
        matches = requests.get(q_url, headers=headers, timeout=10).json().get("results", [])

    if not matches:
        return []

    # Prefer most recently updated locations.
    from datetime import timezone
    matches.sort(
        key=lambda x: parse_iso_dt(x.get("datetimeLast", {}).get("utc")) or datetime.min.replace(tzinfo=timezone(timedelta(0))),
        reverse=True
    )

    # 2) Collect PM2.5 daily measurements from multiple matching sensors.
    rows = []
    for loc in matches[:8]:
        sensor = next(
            (s for s in loc.get("sensors", []) if s.get("parameter", {}).get("name") == "pm25"),
            None
        )
        if not sensor:
            continue

        sensor_id = sensor.get("id")
        if not sensor_id:
            continue

        start_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")
        m_url = f"https://api.openaq.org/v3/sensors/{sensor_id}/measurements/daily"
        m_params = {"limit": 100, "datetime_from": start_date}
        m_res = requests.get(m_url, headers=headers, params=m_params, timeout=8).json()
        sensor_rows = m_res.get("results", [])
        if sensor_rows:
            rows.extend(sensor_rows)

    if not rows:
        return []

    # 3) Convert to Prophet-ready points (date + AQI from PM2.5).
    points = []
    for item in rows:
        val = item.get("summary", {}).get("avg") or item.get("value")
        if val is None:
            continue

        dt_str = item.get("period", {}).get("datetimeFrom", {}).get("local") or item.get("period", {}).get("datetimeFrom")
        dt = parse_iso_dt(dt_str)
        if not dt:
            continue

        points.append({
            "ds": dt.strftime("%Y-%m-%d"),
            "y": calculate_pm25_aqi(val)
        })

    if not points:
        return []

    # Aggregate by date across sensors to reduce missing-day failures.

    by_date = {}
    for p in points:
        if p["ds"] not in by_date:
            by_date[p["ds"]] = []
        by_date[p["ds"]].append(p["y"])

    ordered = []
    for d in sorted(by_date.keys()):
        vals = by_date[d]
        ordered.append({"ds": d, "y": round(sum(vals) / len(vals), 2)})

    return ordered[-limit_points:]

@app.route("/history", methods=["GET"])
def history():
    city = request.args.get("city", "Pune")
    param_name = request.args.get("parameter", "pm25")
    
    # Map parameter names to IDs (OpenAQ v3)
    # 2: pm25, 1: pm10, 10: o3, 7: no2, 8: so2, 11: co
    param_mapping = {
        "pm25": 2,
        "pm10": 1,
        "o3": 10,
        "no2": 7,
        "so2": 8,
        "co": 11
    }
    parameter_id = param_mapping.get(param_name.lower(), 2)
    
    auth_token = get_primary_history_token()
    headers = {"X-API-Key": auth_token, "Accept": "application/json"}
    
    try:
        # Step 1: Broad search for matching locations in region
        loc_url = "https://api.openaq.org/v3/locations"
        params = {
            "countries_id": REGION_ID,
            "parameters_id": parameter_id,
            "monitor": "true",
            "limit": 1000
        }
        loc_res = requests.get(loc_url, headers=headers, params=params).json()
        
        # Normalize city for cleaner searching
        query = city.strip().split(',')[0].lower()
        results = loc_res.get("results", [])
        
        # Match by name or locality or label
        matches = [
            l for l in results 
            if query in l.get("name", "").lower() or 
               (l.get("locality") and query in l.get("locality", "").lower()) or
               (l.get("label") and query in l.get("label", "").lower())
        ]
        
        # Sort by latest update to get active sensors
        from datetime import timezone
        matches.sort(
            key=lambda x: parse_iso_dt(x.get("datetimeLast", {}).get("utc")) or datetime.min.replace(tzinfo=timezone(timedelta(0))),
            reverse=True
        )
        
        if not matches:
            # Fallback 1: search without parameter filter first to find local stations
            loc_url = f"https://api.openaq.org/v3/locations?q={requests.utils.quote(city)}&limit=10"
            matches = requests.get(loc_url, headers=headers).json().get("results", [])
            
        if not matches:
            # Fallback 2: Search without city constraint but with region to find nearby
            loc_url = f"https://api.openaq.org/v3/locations?countries_id={REGION_ID}&parameters_id={parameter_id}&monitor=true&limit=1000"
            all_res = requests.get(loc_url, headers=headers).json().get("results", [])
            matches = [l for l in all_res if query in l.get("name", "").lower() or query in l.get("locality", "").lower()]

        if not matches:
            return jsonify({"error": f"No monitoring stations found for {city}"}), 404
            
        # Select best sensor
        location = matches[0]
        primary_sensor = next((s for s in location.get("sensors", []) if s.get("parameter", {}).get("name") == param_name.lower()), None)
        
        if not primary_sensor:
            # If our target parameter isn't on this station, try finding ANY station in the result set that has it
            for loc in matches:
                primary_sensor = next((s for s in loc.get("sensors", []) if s.get("parameter", {}).get("name") == param_name.lower()), None)
                if primary_sensor:
                    location = loc
                    break
            
        if not primary_sensor:
            primary_sensor = location["sensors"][0]
            
        sensor_id = primary_sensor["id"]
        
        # Step 2: Fetch Daily History
        def fetch_history_range(s_id, days_back=30):
            start_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")
            m_url = f"https://api.openaq.org/v3/sensors/{s_id}/measurements/daily"
            m_params = {"limit": 100, "datetime_from": start_date}
            res = requests.get(m_url, headers=headers, params=m_params).json()
            return res.get("results", [])
        
        # Increase range for better trend visibility if needed
        rows = fetch_history_range(sensor_id, 30)
        is_stale_data = False
        
        if not rows:
            # Stale data fallback
            m_url = f"https://api.openaq.org/v3/sensors/{sensor_id}/measurements/daily"
            first_page = requests.get(m_url, headers=headers, params={"limit": 100}).json()
            found = first_page.get("meta", {}).get("found", 0)
            
            if isinstance(found, str) and found.startswith(">"):
                found = 1000
            else:
                found = int(found)
                
            if found > 0:
                if not rows:
                    rows = first_page.get("results", [])
                    is_stale_data = True

        if not rows:
            # Final attempt: search without region filter
            loc_url = f"https://api.openaq.org/v3/locations?q={requests.utils.quote(query)}&limit=5"
            matches = requests.get(loc_url, headers=headers).json().get("results", [])
            if matches:
                location = matches[0]
                primary_sensor = next((s for s in location.get("sensors", []) if s.get("parameter", {}).get("name") == param_name.lower()), None)
                if primary_sensor:
                    rows = fetch_history_range(primary_sensor["id"], 365)
                    is_stale_data = True

        if not rows:
            return jsonify({"error": f"No historical data available for: {city}"}), 404
            
        # Format results
        formatted = []
        for item in rows:
            try:
                val = item.get("summary", {}).get("avg") or item.get("value")
                if val is None: continue
                
                dt_str = item.get("period", {}).get("datetimeFrom", {}).get("local") or item.get("period", {}).get("datetimeFrom")
                dt = parse_iso_dt(dt_str)
                if not dt: continue
                
                formatted.append({
                    "date": dt.strftime("%b %d"),
                    "fullDate": dt.strftime("%B %d, %Y"),
                    "timestamp": dt.timestamp(),
                    "aqi": calculate_pm25_aqi(val),
                    "pm25": round(val, 2),
                    "isStale": is_stale_data
                })
            except: continue
            
        formatted.sort(key=lambda x: x["timestamp"])
        
        # Limit to the most recent 30 items
        if len(formatted) > 30:
            formatted = formatted[-30:]
            
        return jsonify({
            "city": city,
            "station": location["name"],
            "isStale": is_stale_data,
            "data": formatted
        })
        
    except Exception as e:
        return jsonify({"error": "Historical data service error"}), 500

@app.route("/yearly", methods=["GET"])
def yearly():
    city = request.args.get("city", "Delhi")
    print(f"\n[DEBUG] Fetching yearly CSV data for: {city}")
    
    csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "multi_city_training_data.csv"))
    
    if not os.path.exists(csv_path):
        return jsonify({"error": "Yearly data file not found"}), 404
        
    try:
        df = pd.read_csv(csv_path)
        # Filter for the city and convert date to datetime
        city_df = df[df['City'].str.lower() == city.lower()].copy()
        
        if city_df.empty:
            return jsonify({"error": f"No yearly data found for {city}"}), 404
            
        city_df['Date'] = pd.to_datetime(city_df['Date'])
        city_df = city_df.sort_values('Date')
        
        # We'll return all available data for this city to show multi-year trends
        # To avoid sending too many points, we might want to resample if it's huge, 
        # but for a CSV trend, a few thousand points is usually fine for Recharts if handled well.
        
        formatted = []
        for _, row in city_df.iterrows():
            if pd.isna(row['AQI']): continue
            dt = row['Date']
            formatted.append({
                "date": dt.strftime("%Y-%m-%d"), # Full iso for sorting/processing
                "displayDate": dt.strftime("%b %Y"), # Month and Year for X-Axis
                "fullDate": dt.strftime("%B %d, %Y"),
                "year": dt.strftime("%Y"), # Year only
                "timestamp": dt.timestamp(),
                "aqi": int(row['AQI']),
                "pm25": float(row['PM2.5']) if not pd.isna(row['PM2.5']) else 0,
                "isCSV": True
            })
            
        return jsonify({
            "city": city,
            "data": formatted,
            "cities": df['City'].unique().tolist()
        })
        
    except Exception as e:
        import traceback
        print(f"[ERROR] Yearly CSV failed: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route("/predict", methods=["GET"])
def predict():
    city = request.args.get("city")
    base_aqi_raw = request.args.get("base_aqi")
    print(f"\n[DEBUG] Received real-time prediction request for: {city}")
    
    if not city:
        return jsonify({"error": "City name is required"}), 400

    base_aqi = None
    if base_aqi_raw is not None:
        try:
            base_aqi = float(base_aqi_raw)
        except ValueError:
            base_aqi = None

    cache_key = _cache_key(city, base_aqi)
    cached_payload = _get_cached_prediction(cache_key)
    if cached_payload:
        return jsonify(cached_payload)
    
    try:
        from prophet import Prophet

        # 1) Fetch recent real observations from OpenAQ.
        recent_points = fetch_recent_pm25_aqi(city, days_back=14, limit_points=14)
        if len(recent_points) < 7:
            recent_points = fetch_recent_pm25_aqi(city, days_back=45, limit_points=21)
        if len(recent_points) < 7:
            if isinstance(base_aqi, (int, float)):
                payload = {
                    "city": city,
                    "forecast": _build_baseline_forecast(base_aqi, 7)
                }
                _set_cached_prediction(cache_key, payload)
                return jsonify(payload)
            return jsonify({
                "error": f"Not enough AQI history available for {city}.",
                "required_points": 7,
                "available_points": len(recent_points)
            }), 404

        # 2) Train Prophet on fresh city data.
        df = pd.DataFrame(recent_points)
        df["ds"] = pd.to_datetime(df["ds"])

        print(f"[DEBUG] Training Prophet on {len(df)} real-time points...")
        model = Prophet(
            daily_seasonality=True,
            weekly_seasonality=True,
            yearly_seasonality=False
        )
        model.fit(df)

        # 3) Predict next 7 days.
        future = model.make_future_dataframe(periods=7, freq="D")
        forecast = model.predict(future)

        results = forecast[['ds', 'yhat']].tail(7).copy()

        results['date'] = results['ds'].dt.strftime('%Y-%m-%d')
        results['aqi'] = results['yhat'].clip(lower=0).round(0).astype(int)

        final_data = results[['date', 'aqi']].to_dict('records')

        if isinstance(base_aqi, (int, float)) and final_data:
            base = max(0, min(500, int(round(base_aqi))))
            first_pred = final_data[0]["aqi"]
            for row in final_data:
                delta = row["aqi"] - first_pred
                row["aqi"] = max(0, min(500, base + delta))

        print(f"[DEBUG] Success! Prepared {len(final_data)} forecast points from real-time training data.")

        payload = {
            "city": city,
            "forecast": final_data
        }
        _set_cached_prediction(cache_key, payload)
        return jsonify(payload)
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"[CRITICAL ERROR] Prediction failed for {city}:\n{error_trace}")
        if isinstance(base_aqi, (int, float)):
            payload = {
                "city": city,
                "forecast": _build_baseline_forecast(base_aqi, 7)
            }
            _set_cached_prediction(cache_key, payload)
            return jsonify(payload)
        return jsonify({
            "error": "Prediction engine encountered an internal error.",
            "details": str(e)
        }), 500

if __name__ == "__main__":
    # Note: Port 5000 is default for Flask
    print("Server started. Real-time forecasting enabled on /predict")
    app.run(debug=True, port=5000)
