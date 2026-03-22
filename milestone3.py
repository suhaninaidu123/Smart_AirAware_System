import pandas as pd


#predicted AQI values for next 7 days
data = {
    "Date": [
        "2026-03-10",
        "2026-03-11",
        "2026-03-12",
        "2026-03-13",
        "2026-03-14",
        "2026-03-15",
        "2026-03-16",
    ],
    "Predicted_AQI": [153, 124, 119, 132, 125, 132, 128]
}

df = pd.DataFrame(data)

print("Predicted AQI Data:")
print(df)

# AQI categorization
def get_aqi_category(aqi):
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    elif aqi <= 200:
        return "Unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"

# apply categorization

df["Category"] = df["Predicted_AQI"].apply(get_aqi_category)

print("\nAQI with Categories:")
print(df)

# generate alerts
def generate_alert(aqi):
    if aqi > 200:
        return "⚠ HIGH ALERT! Avoid outdoor activities."
    elif aqi > 150:
        return "⚠ Warning! Wear mask outside."
    else:
        return "Air quality is safe."

df["Alert"] = df["Predicted_AQI"].apply(generate_alert)
print("\nFinal Alert Report:")
print(df)

