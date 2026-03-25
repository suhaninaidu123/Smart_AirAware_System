import pandas as pd
import requests
import os

URL = "https://raw.githubusercontent.com/adityarc19/aqi-india/main/city_day.csv"
DATA_FILE = "city_day.csv"

def download_data():
    if not os.path.exists(DATA_FILE):
        print(f"Downloading {URL}...")
        response = requests.get(URL)
        with open(DATA_FILE, "wb") as f:
            f.write(response.content)
        print("Download complete.")
    else:
        print(f"{DATA_FILE} already exists.")

def analyze_and_extract():
    df = pd.read_csv(DATA_FILE)
    df["Date"] = pd.to_datetime(df["Date"])
    
    # Analyze cities to find the one with the most records and fewest missing AQI values
    city_stats = df.groupby("City").agg(
        total_records=("AQI", "count"),
        missing_aqi=("AQI", lambda x: x.isnull().sum()),
        min_date=("Date", "min"),
        max_date=("Date", "max")
    ).reset_index()
    
    city_stats["completeness"] = city_stats["total_records"] / (city_stats["total_records"] + city_stats["missing_aqi"])
    
    # Sort by total records and completeness
    best_cities = city_stats.sort_values(by=["total_records", "completeness"], ascending=False)
    
    top_n = 10
    print(f"\nTop {top_n} Cities by Record Count and Completeness:")
    print(best_cities.head(top_n))
    
    selected_cities = best_cities.head(top_n)["City"].tolist()
    print(f"\nSelecting {selected_cities} for batch training.")
    
    # Extract data for the selected cities
    multi_city_df = df[df["City"].isin(selected_cities)]
    multi_city_df.to_csv("multi_city_training_data.csv", index=False)
    print(f"Saved data for {len(selected_cities)} cities to 'multi_city_training_data.csv'.")

if __name__ == "__main__":
    download_data()
    analyze_and_extract()
