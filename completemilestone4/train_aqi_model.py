import pandas as pd
from prophet import Prophet
import matplotlib.pyplot as plt
from prophet.diagnostics import cross_validation
from prophet.diagnostics import performance_metrics
import joblib
import os

# -----------------------------
# 1 LOAD DATASET
# -----------------------------
INPUT_FILE = "training_data.csv"
if not os.path.exists(INPUT_FILE):
    print(f"Error: {INPUT_FILE} not found. Please run fetch_data.py first.")
    exit(1)

df = pd.read_csv(INPUT_FILE)

print(f"Original Dataset ({INPUT_FILE})")
print(df.head())

# -----------------------------
# 2 DATA CLEANING
# -----------------------------

# Convert date to datetime
df["Date"] = pd.to_datetime(df["Date"])

# Sort by date
df = df.sort_values("Date")

# Drop unnecessary columns if they exist
cols_to_drop = ["City", "AQI_Bucket"]
df = df.drop(columns=[c for c in cols_to_drop if c in df.columns])

# Fill missing values
# Prophet handles missing values to some extent, but filling them can help with initial fit
# We use numeric_only=True to avoid errors with date columns
df = df.fillna(df.mean(numeric_only=True))

print("\nCleaned Dataset")
print(df.head())
 
# -----------------------------
# 3 PREPARE DATA FOR PROPHET
# -----------------------------

prophet_df = df[["Date","AQI"]]

prophet_df = prophet_df.rename(columns={
    "Date":"ds",
    "AQI":"y"
})

# Drop rows where 'y' is still NaN after mean filling (e.g. if all AQI was NaN)
prophet_df = prophet_df.dropna(subset=['y'])

print("\nProphet Dataset")
print(prophet_df.head())

# -----------------------------
# 4 TRAIN MODEL
# -----------------------------

model = Prophet(
    changepoint_prior_scale=0.05,
    holidays_prior_scale=10,
    seasonality_prior_scale=10,
    weekly_seasonality=True,
    yearly_seasonality=True,
    daily_seasonality=False
)

model.fit(prophet_df)

print("\nModel Training Completed")

# -----------------------------
# 5 CREATE FUTURE DATES
# -----------------------------

future = model.make_future_dataframe(periods=7)

print("\nFuture Dates")
print(future.tail())

# -----------------------------
# 6 PREDICT AQI
# -----------------------------

forecast = model.predict(future)

print("\nForecast Output")
print(forecast[["ds","yhat","yhat_lower","yhat_upper"]].tail())

# -----------------------------
# 7 CROSS VALIDATION
# -----------------------------
print("\nRunning Cross Validation...")
try:
    df_cv = cross_validation(
        model,
        initial="730 days",
        period="180 days",
        horizon="30 days"
    )

    df_performance = performance_metrics(df_cv)
    print("\nPerformance Metrics:")
    print(df_performance.head())
    
    # Save metrics to CSV for reference
    df_performance.to_csv("model_performance_metrics.csv", index=False)
except Exception as e:
    print(f"Cross validation failed: {e}")

# -----------------------------
# 8 PLOT FORECAST
# -----------------------------

fig1 = model.plot(forecast)
plt.title("AQI Forecast")
plt.savefig("aqi_forecast_plot.png")
plt.close()

# -----------------------------
# 9 PLOT TREND COMPONENTS
# -----------------------------

fig2 = model.plot_components(forecast)
plt.savefig("aqi_trend_components.png")
plt.close()

# -----------------------------
# 10 SAVE THE MODEL
# -----------------------------
joblib.dump(model, "prophet_model.pkl")
print("\nModel saved successfully to 'prophet_model.pkl'!")
print("Plots saved as 'aqi_forecast_plot.png' and 'aqi_trend_components.png'.")
