from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.init_db import init_db
from app.routes import interview
from app.routes import coding_arena

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

app.include_router(interview.router)
app.include_router(coding_arena.router)

@app.get("/")
def home():
    return {"message": "AI Interview Simulator running"}