
# Data Preprocessing & Basic Analysis
import pandas as pd
import matplotlib.pyplot as plt

# 1. CREATE SAMPLE DATA 
data = {
"Date": ["2026-02-08", "2026-02-09", "2026-02-10",
"2026-02-11", "2026-02-12", "2026-02-13" , "2026-02-14", "2026-02-15"],
"PM25": [60, 57, None, 63, 61, 66, 62, 63],
"PM10": [77, 72, 69, None, 74, 85, 101, 95],
"NO2": [12, 19, 19, 17, None, 12, 11, 18]
}

df = pd.DataFrame(data)
print("ORIGINAL DATA")
print(df)

# 2. PREPROCESSING

# Convert Date column to proper format
df["Date"] = pd.to_datetime(df["Date"])

# Handle Missing Values - fill with average
df["PM25"] = df["PM25"].fillna(df["PM25"].mean())
df["PM10"] = df["PM10"].fillna(df["PM10"].mean())
df["NO2"] = df["NO2"].fillna(df["NO2"].mean())

print("\nAFTER CLEANING")
print(df)

# 3. FEATURE ENGINEERING

df["Day"] = df["Date"].dt.day
df["Weekday"] = df["Date"].dt.day_name()

print("\nAFTER FEATURE ENGINEERING")
print(df)

# 4. BASIC EDA (ANALYSIS)
print("\nSTATISTICAL SUMMARY")
print(df.describe())


# 5. SIMPLE VISUALIZATION
plt.title("PM2.5 Trend")
plt.plot(df["Date"], df["PM25"])
plt.xlabel("Date")
plt.ylabel("PM2.5")
plt.show()
