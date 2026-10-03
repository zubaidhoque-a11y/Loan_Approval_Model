import joblib 
import pandas as pd 
from fastapi import FastAPI 
from pydantic import BaseModel, Field 
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware

model = joblib.load('Loan Predictor Model.pkl')

app= FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoanData(BaseModel):
    ApplicantIncome: float
    CoapplicantIncome :float 
    LoanAmount: float
    Loan_Amount_Term: float
    Credit_History: float
    Dependents: int
    Gender: int
    Married: int
    Education: int
    Self_Employed: int
    Property_Area: int


@app.get("/")
def greet():
    return {
        "message": "Loan Approval Prediction API is running "
    }

@app.post("/predict")
def predict_loan(data : LoanData):
    input_data = pd.DataFrame([{
        "ApplicantIncome": data.ApplicantIncome,
        "CoapplicantIncome": data.CoapplicantIncome,
        "LoanAmount": data.LoanAmount,
        "Loan_Amount_Term": data.Loan_Amount_Term,
        "Credit_History": data.Credit_History,
        "Dependents": data.Dependents,
        "Gender": data.Gender,
        "Married": data.Married,
        "Education": data.Education,
        "Self_Employed": data.Self_Employed,
        "Property_Area": data.Property_Area
    }])
    prediction = model.predict(input_data)[0]

    if prediction == 1:
        result = "Loan Approved"
    else:
        result = "Loan Not Approved"

    return {
        "status": result
    }

