import torch
import torch.nn as nn
import torch.nn.functional as F
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List
import pandas as pd
import io

# Define the model architecture (must match training)
class BayesianRegressor(nn.Module):
    def __init__(self):
        super().__init__()
        self.hidden = nn.Linear(1, 4)
        self.out = nn.Linear(4, 1)

    def forward(self, x):
        x = F.relu(self.hidden(x))
        return torch.sigmoid(self.out(x))

# Load the trained model
MODEL_PATH = "bayesian_regressor_model.pth"
bnn = BayesianRegressor()
bnn.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
bnn.eval()

# MinMaxScaler params (from training)
# If you used a saved scaler, load it here. Otherwise, use fit params from training.
# For demo, we use 0 to N-1 row indices, scaled to [0,1]
def minmax_scale(indices, n_rows):
    return [[i / (n_rows - 1) if n_rows > 1 else 0.0] for i in indices]

app = FastAPI()

class PredictResponse(BaseModel):
    id: int
    confidence: float

@app.post("/predict_csv", response_model=List[PredictResponse])
async def predict_csv(file: UploadFile = File(...)):
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content))
    n_rows = len(df)
    indices = list(range(n_rows))
    X_scaled = torch.tensor(minmax_scale(indices, n_rows), dtype=torch.float32)
    with torch.no_grad():
        preds = bnn(X_scaled).numpy().flatten()
    results = [PredictResponse(id=int(i), confidence=float(preds[i])) for i in range(n_rows)]
    return results

# Health check
@app.get("/")
def root():
    return {"status": "ok"}
