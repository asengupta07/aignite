from pydantic import BaseModel

class Organization(BaseModel):
    name: str
    description: str
    members: list[str]
    projects: list[str]