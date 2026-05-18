from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import curriculum, planning

description = r"""
### Academic Planning Engine 🚀

This is the core backend of the **AcademicFlow** system. It provides a RESTful API to manage curriculum maps, academic histories, and the automated generation of optimal study plans using the **A* Search Algorithm** over a **Directed Acyclic Graph (DAG)**.

#### Key Features:
* **Curriculum**: Retrieve the complete course graph and calculate the topological sort.
* **Planning**: Manage student histories, calculate real-time GPA, and get the **Critical Path**.
* **A* Engine**: Use the `/plan` endpoint to automatically generate perfect schedules without exceeding the semester credit limits.
"""

app = FastAPI(
    title="AcademicFlow Engine API",
    description=description,
    version="1.0.0",
    contact={
        "name": "Juan",
        "url": "https://github.com/juanesgl",
    }
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
def read_health():
    return {"status": "ok"}

app.include_router(curriculum.router)
app.include_router(planning.router)