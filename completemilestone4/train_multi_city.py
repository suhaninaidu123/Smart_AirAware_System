import pandas as pd
from prophet import Prophet
import joblib
import os
from prophet.diagnostics import cross_validation, performance_metrics

# -----------------------------
# CONFIGURATION
# -----------------------------
INPUT_FILE = "multi_city_training_data.csv"
MODEL_DIR = "models"
SUMMARY_FILE = "batch_performance_summary.csv"

if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

def train_city_model(city_name, city_df):
    print(f"\nTraining model for: {city_name}...")
    
    # Prepare data for Prophet
    prophet_df = city_df[["Date", "AQI"]].rename(columns={"Date": "ds", "AQI": "y"})
    prophet_df["ds"] = pd.to_datetime(prophet_df["ds"])
    prophet_df = prophet_df.dropna(subset=['y'])
    
    if len(prophet_df) < 365:
        print(f"Skipping {city_name}: Insufficient data ({len(prophet_df)} records).")
        return None

    # Train Model
    model = Prophet(
        changepoint_prior_scale=0.05,
        weekly_seasonality=True,
        yearly_seasonality=True,
        daily_seasonality=False
    )
    model.fit(prophet_df)
    
    # Save Model
    model_path = os.path.join(MODEL_DIR, f"{city_name.lower()}_aqi_model.pkl")
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")
    
    # Performance Evaluation (Simplified for batch)
    try:
        df_cv = cross_validation(model, initial='730 days', period='180 days', horizon='30 days', parallel="processes")
        df_p = performance_metrics(df_cv)
        avg_rmse = df_p['rmse'].mean()
        avg_mae = df_p['mae'].mean()
        return {"City": city_name, "RMSE": avg_rmse, "MAE": avg_mae, "Records": len(prophet_df)}
    except Exception as e:
        print(f"Valdiation skipped for {city_name}: {e}")
        return {"City": city_name, "RMSE": None, "MAE": None, "Records": len(prophet_df)}

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"Error: {INPUT_FILE} not found.")
        return

    df = pd.read_csv(INPUT_FILE)
    cities = df["City"].unique()
    print(f"Found data for cities: {cities}")
    
    summaries = []
    for city in cities:
        city_data = df[df["City"] == city]
        res = train_city_model(city, city_data)
        if res:
            summaries.append(res)
    
    # Save Summary
    summary_df = pd.DataFrame(summaries)
    summary_df.to_csv(SUMMARY_FILE, index=False)
    print(f"\nBatch training complete. Summary saved to {SUMMARY_FILE}")

if __name__ == "__main__":
    main()
