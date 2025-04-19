from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from models.schema import Organization, OrganizationMember, User, ApplicationStatus
from utils.mongo import MongoProvider
from typing import Dict, List
from cryptography.fernet import Fernet
from bson import ObjectId
import os
from dotenv import load_dotenv
import uvicorn
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

mongo_client = MongoProvider()

@app.get("/")
async def root():
    return {"message": "Welcome to the API"}



@app.post("/set-github/{org_id}")
async def set_org_github(org_id: str, request: Request):
    try:
        github_url = (await request.json())["github_url"]
        mongo_client.set_org_github(org_id, github_url)
        return {"message": "Organization GitHub set successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/create-organization")
async def create_organization(organization: Request):
    try:
        organization_data = await organization.json()
        key = Fernet.generate_key().decode("utf-8")
        print(key)
        organization_data["key"] = key
        org = Organization(**organization_data)
        mongo_client.store_organization(org)
        return {"message": "Organization created successfully", "key": key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/create-user")
async def create_user(user: Request):
    try:
        user_data = await user.json()
        user = User(**user_data)
        print(user)
        mongo_client.store_user(user)
        return {"message": "User created successfully", "github_id": user.github_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/apply-organization")
async def apply_organization(request: Request):
    try:
        application_data = await request.json()
        github_id = application_data["github_id"]
        key = application_data["key"]
        org = mongo_client.get_organization_by_key(key)
        if org:
            application_status = ApplicationStatus(github_id=github_id, organization_id=str(org["_id"]), status="pending")
            mongo_client.store_application_status(application_status)
            return {"message": "Application status created successfully"}
        else:
            raise HTTPException(status_code=404, detail="Organization not found") 

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/applications/{admin_id}")
async def get_applications(admin_id: str):
    try:
        applications = mongo_client.get_applications_by_admin_id(admin_id)
        return {"applications": applications}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/update-application-status")
async def update_application_status(request: Request):
    try:
        application_data = await request.json()
        application_id = application_data["application_id"]
        status = application_data["status"]
        role = application_data.get("role")
        
        if status == "approved" and not role:
            raise HTTPException(status_code=400, detail="Role is required when approving an application")
            
        mongo_client.update_application_status(application_id, status, role)
        return {"message": "Application status updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/organization-members")
async def create_organization_member(member: OrganizationMember):
    try:
        mongo_client.store_organization_member(member)
        return {"message": "Organization member created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/organizations/{organization_id}/members")
async def get_organization_members(organization_id: str):
    try:
        members = mongo_client.get_organization_members_by_organization_id(organization_id)
        return {"members": list(members)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
