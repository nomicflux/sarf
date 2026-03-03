from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from analyzer import create_analyzers, analyze_word

analyzers = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    global analyzers
    analyzers = create_analyzers()
    yield


app = FastAPI(lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["POST"], allow_headers=["*"])


class AnalyzeRequest(BaseModel):
    word: str
    dialect: str = "msa"


@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    results = analyze_word(analyzers, req.word, req.dialect)
    return {"analyses": results}
