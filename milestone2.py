import pandas as pd
import matplotlib.pyplot as plt
from prophet import Prophet

# load sample data from csv file
data=pd.read_csv("AQI2.csv")

df = pd.DataFrame(data)

print("Original Data:")
print(df)

# preprocessing

# datetime format
df["Date"] = pd.to_datetime(df["Date"])

# Rename columns for Prophet
df = df.rename(columns={"Date": "ds", "AQI": "y"})

print("\nData Prepared for Prophet:")
print(df)


# model training

model = Prophet()
model.fit(df)


# create future dates 

# Predict next 7 days
future = model.make_future_dataframe(periods=7)

print("\nFuture Dates:")
print(future.tail())


# predict AQI for future dates

forecast = model.predict(future)

print("\nPredicted AQI:")
print(forecast[["ds", "yhat"]].tail(7))


# visualization of predictions

model.plot(forecast)
plt.title("Future AQI Prediction")
plt.xlabel("Date")
plt.ylabel("AQI")
plt.show()


# trend analysis

model.plot_components(forecast)
plt.show()


