from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from models.schema import Organization, OrganizationMember, User, ApplicationStatus
from utils.mongo import MongoProvider
from cryptography.fernet import Fernet
from dotenv import load_dotenv
import uvicorn
import requests
from datetime import datetime
import datetime as dt
from agents.dev_report import DevReportAgent

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


@app.get("/get-organization/{user_id}")
async def get_organization(user_id: str):
    try:
        org = mongo_client.get_organization_by_user_id(user_id)
        return {"organization": org}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/get-github/{user_id}")
async def get_github(user_id: str):
    try:
        organization = mongo_client.get_organization_by_user_id(user_id)
        organization_id = organization["_id"]
        github_url = mongo_client.get_org_github_url(organization_id)
        return {"github_url": github_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/set-github/{admin_id}")
async def set_org_github(admin_id: str, request: Request):
    try:
        github_url = (await request.json())["github_url"]
        mongo_client.set_org_github(admin_id, github_url)
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
    

@app.get("/get-key/{org_id}")
async def get_key(org_id: str):
    try:
        key = mongo_client.get_key(org_id)
        return {"key": key}
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
        name = application_data.get("name")
        email = application_data.get("email")
        image = application_data.get("image")
        
        # Check if user exists by github_id or email
        existing_user = mongo_client.get_user({"github_id": github_id})
        if not existing_user and email:
            existing_user = mongo_client.get_user({"email": email})
        
        # Only create new user if they don't exist and we have all required fields
        if not existing_user and all([name, email, image]):
            user = User(github_id=github_id, name=name, email=email, image=image)
            mongo_client.store_user(user)
        
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
    

@app.get("/get-latest-dev-report/{user_id}")
async def get_latest_dev_report(user_id: str):
    try:
        # Get organization for the user
        org = mongo_client.get_organization_by_user_id(user_id)
        if not org:
            raise HTTPException(status_code=404, detail="User is not affiliated with any organization")
            
        # Check if we have a cached report for today
        cached_report = mongo_client.get_todays_dev_report(str(org["_id"]))
        if cached_report:
            return {"report": cached_report["report"]}
            
        # Get GitHub URL from database
        github_url = mongo_client.get_org_github_url(str(org["_id"]))
        
        # Extract owner and repo from GitHub URL
        # URL format: https://github.com/owner/repo
        parts = github_url.strip('/').split('/')
        if len(parts) < 2:
            raise HTTPException(status_code=400, detail="Invalid GitHub URL format")
        owner, repo = parts[-2], parts[-1]
        
        # Get today's date range
        today = datetime.now(dt.UTC)
        start_time = datetime.combine(today, datetime.min.time())
        end_time = datetime.combine(today, datetime.max.time())
        
        # Format dates for GitHub API
        start_time_str = start_time.strftime("%Y-%m-%dT%H:%M:%SZ")
        end_time_str = end_time.strftime("%Y-%m-%dT%H:%M:%SZ")
        
        # Get commits from GitHub API
        headers = {
            "Accept": "application/vnd.github+json"
        }
        
        url = f"https://api.github.com/repos/{owner}/{repo}/commits"
        params = {
            "since": start_time_str,
            "until": end_time_str
        }
        
        response = requests.get(url, headers=headers, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch commits from GitHub")
            
        commits = response.json()
        commit_messages = [commit["commit"]["message"] for commit in commits]
        
        # Generate dev report
        dev_report_agent = DevReportAgent()
        report = dev_report_agent.generate_dev_report(commit_messages)
        
        # Cache the report
        mongo_client.store_dev_report(str(org["_id"]), report)
        
        return {"report": report}
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
