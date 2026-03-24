import streamlit as st
import pandas as pd
import numpy as np
import joblib
from prophet import Prophet
import plotly.express as px
import plotly.graph_objects as go


st.set_page_config(
    page_title="AirAware Dashboard",
    page_icon="🌫",
    layout="wide"
)

st.markdown("""
<style>

[data-testid="stAppViewContainer"]{
background: linear-gradient(120deg,#0f2027,#203a43,#2c5364);
color:white;
}

h1,h2,h3{
color:white;
}

</style>
""", unsafe_allow_html=True)

st.title("🌫 AirAware Smart Air Quality Dashboard")
st.write("AI Powered Air Quality Monitoring System")

model = joblib.load("random_forest_model.pkl")

st.header("AQI Prediction (Using Pollutants)")

col1,col2,col3,col4,col5 = st.columns(5)

with col1:
    pm25 = st.number_input("PM2.5",0.0,500.0,60.0)

with col2:
    pm10 = st.number_input("PM10",0.0,500.0,100.0)

with col3:
    no2 = st.number_input("NO2",0.0,200.0,30.0)

with col4:
    so2 = st.number_input("SO2",0.0,200.0,15.0)

with col5:
    co = st.number_input("CO",0.0,10.0,1.0)



if st.button("Predict AQI"):

    input_data = np.array([[pm25,pm10,no2,so2,co]])

    prediction = model.predict(input_data)[0]

    st.subheader("Predicted AQI")

    st.metric("AQI Value", round(prediction,2))

    fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=prediction,
        title={'text': "AQI Level"},
        gauge={
            'axis': {'range': [0,500]},
            'steps':[
                {'range':[0,50],'color':'green'},
                {'range':[50,100],'color':'yellow'},
                {'range':[100,200],'color':'orange'},
                {'range':[200,500],'color':'red'}
            ]
        }
    ))

    st.plotly_chart(fig,use_container_width=True)

    if prediction <= 50:
        st.success("🟢 Good Air Quality. Safe for outdoor activities.")

    elif prediction <= 100:
        st.info("🟡 Moderate Air Quality.")

    elif prediction <= 200:
        st.warning("🟠 Poor Air Quality. Sensitive groups should avoid outdoor exposure.")

    else:
        st.error("🔴 Severe Air Quality. Avoid outdoor activities.")

    pollutant_data = {
        "Pollutant":["PM2.5","PM10","NO2","SO2","CO"],
        "Value":[pm25,pm10,no2,so2,co]
    }

    poll_df = pd.DataFrame(pollutant_data)

    fig2 = px.bar(
        poll_df,
        x="Pollutant",
        y="Value",
        title="Pollutant Levels"
    )

    st.plotly_chart(fig2,use_container_width=True)

df = pd.read_csv("Mumbai_AQI.csv")

df["Date"] = pd.to_datetime(df["Date"], format="%d-%m-%Y")

daily = df.groupby("Date").mean(numeric_only=True).reset_index()





st.header("Historical AQI Trend")

fig3 = px.line(
    daily,
    x="Date",
    y="AQI",
    title="AQI Trend Over Time"
)

st.plotly_chart(fig3,use_container_width=True)



st.header("Future AQI Forecast (7 Days)")

prophet_df = daily[["Date","AQI"]]

prophet_df.columns = ["ds","y"]

forecast_model = Prophet()

forecast_model.fit(prophet_df)

future = forecast_model.make_future_dataframe(periods=7)

forecast = forecast_model.predict(future)

fig4 = px.line(
    forecast,
    x="ds",
    y="yhat",
    title="Next 7 Days AQI Forecast"
)

st.plotly_chart(fig4,use_container_width=True)