from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OrganizationMember(BaseModel):
    organization_id: str
    github_id: str
    role: str

class Organization(BaseModel):
    name: str
    description: str
    owner_id: str
    key: str
    image_url: Optional[str] = None

class User(BaseModel):
    github_id: str
    name: str
    email: str
    image: str
    
class ApplicationStatus(BaseModel):
    github_id: str
    organization_id: str
    status: str

class OrganizationGitHub(BaseModel):
    organization_id: str
    github_url: str

class DevReport(BaseModel):
    organization_id: str
    date: str
    report: dict

class ProductGoal(BaseModel):
    title: str
    description: str
    status: str
    priority: str
    due_date: datetime
    assignee: str
    tags: list[str]
    created_at: Optional[datetime] = None
