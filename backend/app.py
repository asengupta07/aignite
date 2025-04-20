from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from models.schema import Organization, OrganizationMember, User, ApplicationStatus, ProductGoal
from utils.mongo import MongoProvider
from cryptography.fernet import Fernet
from dotenv import load_dotenv
import uvicorn
import requests
from datetime import datetime, timedelta
import datetime as dt
from agents.dev_report import DevReportAgent
from agents.progress_report import ProgressReportAgent
from agents.documentation_agent import DocumentationAgent
from agents.codebase_analyzer import CodebaseAnalyzer

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
        print(applications)
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
    

@app.get("/get-dev-team/{org_id}")
async def get_dev_team(org_id: str):
    try:
        dev_team = mongo_client.get_dev_team(org_id)
        return {"dev_team": dev_team}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/create-product-goals/{org_id}")
async def create_product_goals(org_id: str, product_goal: Request):
    try:
        # Validate the product goal data
        product_goal_dict = await product_goal.json()
        
        mongo_client.store_product_goals(org_id, product_goal_dict)
        return {"message": "Product goals created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/get-product-goals/{org_id}")
async def get_product_goals(org_id: str):
    try:
        print(org_id)
        product_goals = mongo_client.get_product_goals(org_id)
        return {"product_goals": product_goals}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/get-latest-dev-report/{user_id}")
async def get_latest_dev_report(user_id: str):
    try:
        org = mongo_client.get_organization_by_user_id(user_id)
        if not org:
            raise HTTPException(status_code=404, detail="User is not affiliated with any organization")
            
        org_id = str(org["_id"])
        
        github_url = mongo_client.get_org_github_url(org_id)
        
        parts = github_url.strip('/').split('/')
        if len(parts) < 2:
            raise HTTPException(status_code=400, detail="Invalid GitHub URL format")
        owner, repo = parts[-2], parts[-1]
        
        last_commit_id = mongo_client.get_last_commit_id(org_id)
        
        headers = {
            "Accept": "application/vnd.github+json"
        }
        
        url = f"https://api.github.com/repos/{owner}/{repo}/commits"
        params = {"per_page": 1}
        
        response = requests.get(url, headers=headers, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch commits from GitHub")
            
        latest_commit = response.json()[0] if response.json() else None
        
        if not last_commit_id or (latest_commit and latest_commit["sha"] != last_commit_id):
            four_days_ago = datetime.now(dt.UTC) - timedelta(days=4)
            start_time = datetime.combine(four_days_ago, datetime.min.time())
            end_time = datetime.combine(datetime.now(dt.UTC), datetime.max.time())
            
            start_time_str = start_time.strftime("%Y-%m-%dT%H:%M:%SZ")
            end_time_str = end_time.strftime("%Y-%m-%dT%H:%M:%SZ")
            
            params = {
                "since": start_time_str,
                "until": end_time_str
            }
            
            response = requests.get(url, headers=headers, params=params)
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch commits from GitHub")
                
            commits = response.json()
            commit_messages = [commit["commit"]["message"] for commit in commits]
            
            dev_report_agent = DevReportAgent()
            report = dev_report_agent.generate_dev_report(commit_messages)
            
            mongo_client.store_dev_report(org_id, report)
            if latest_commit:
                mongo_client.store_last_commit_id(org_id, latest_commit["sha"])
            
            return {"report": report}
        else:
            cached_report = mongo_client.get_todays_dev_report(org_id)
            return {"report": cached_report["report"]}
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/get-progress-report/{org_id}")
async def get_progress_report(org_id: str):
    try:
        # First check if we have a cached report for today
        cached_report = mongo_client.get_todays_progress_report(org_id)
        if cached_report:
            return {"progress_reports": cached_report["reports"]}

        # If no cached report, generate a new one
        goals = mongo_client.get_product_goals(org_id)
        github_url = mongo_client.get_org_github_url(org_id)
        
        parts = github_url.strip('/').split('/')
        if len(parts) < 2:
            raise HTTPException(status_code=400, detail="Invalid GitHub URL format")
        owner, repo = parts[-2], parts[-1]
        
        headers = {
            "Accept": "application/vnd.github+json"
        }
        
        url = f"https://api.github.com/repos/{owner}/{repo}/commits"
        
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch commits from GitHub")
        
        commits = response.json()
        commit_messages = [commit["commit"]["message"] for commit in commits]

        url = f"https://api.github.com/repos/{owner}/{repo}/pulls"
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch PRs from GitHub")
        
        prs = response.json()
        prs = [{"title": pr["title"], "description": pr["body"]} for pr in prs]
        
        progress_report_agent = ProgressReportAgent()
        progress_reports = []
        
        for goal in goals:
            print("Goal: ", goal)
            progress_report = progress_report_agent.generate_progress_report(goal, commit_messages, prs)
            progress_report["goal_id"] = str(goal["_id"])
            print("Progress Report:")
            print(progress_report)
            progress_reports.append(progress_report)

        # Cache the generated reports
        mongo_client.store_progress_report(org_id, progress_reports)

        return {"progress_reports": progress_reports}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get-user-commits/{org_id}/{github_id}")
async def get_user_commits(org_id: str, github_id: str):
    try:
        github_url = mongo_client.get_org_github_url(org_id)
        parts = github_url.strip('/').split('/')
        if len(parts) < 2:
            raise HTTPException(status_code=400, detail="Invalid GitHub URL format")
        owner, repo = parts[-2], parts[-1]
        
        headers = {
            "Accept": "application/vnd.github+json"
        }
        
        # Get user's GitHub username from their ID
        user = mongo_client.get_user({"github_id": github_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        url = f"https://api.github.com/repos/{owner}/{repo}/commits"
        params = {"author": user["name"]}
        
        response = requests.get(url, headers=headers, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch commits from GitHub")
            
        commits = response.json()
        return {"commits": commits}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get-user-prs/{org_id}/{github_id}")
async def get_user_prs(org_id: str, github_id: str):
    try:
        github_url = mongo_client.get_org_github_url(org_id)
        if not github_url:
            raise HTTPException(status_code=404, detail="GitHub URL not found for organization")
            
        parts = github_url.strip('/').split('/')
        if len(parts) < 2:
            raise HTTPException(status_code=400, detail="Invalid GitHub URL format")
        owner, repo = parts[-2], parts[-1]
        
        headers = {
            "Accept": "application/vnd.github+json"
        }
        
        # Get user's GitHub username from their ID
        user = mongo_client.get_user({"github_id": github_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        url = f"https://api.github.com/repos/{owner}/{repo}/pulls"
        params = {"state": "all", "author": user["name"]}
        
        response = requests.get(url, headers=headers, params=params)
        if response.status_code != 200:
            error_detail = f"Failed to fetch PRs from GitHub: {response.text}"
            print(error_detail)
            raise HTTPException(status_code=response.status_code, detail=error_detail)
            
        prs = response.json()
        return {"pull_requests": prs}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get-user-prs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/generate-documentation")
async def generate_documentation(request: Request):
    try:
        data = await request.json()
        type = data["type"]
        item_id = data["id"]
        github_id = data["github_id"]
        
        # Get organization and GitHub URL
        org = mongo_client.get_organization_by_user_id(github_id)
        github_url = mongo_client.get_org_github_url(str(org["_id"]))
        
        parts = github_url.strip('/').split('/')
        if len(parts) < 2:
            raise HTTPException(status_code=400, detail="Invalid GitHub URL format")
        owner, repo = parts[-2], parts[-1]
        
        headers = {
            "Accept": "application/vnd.github+json"
        }
        
        if type == "commit":
            url = f"https://api.github.com/repos/{owner}/{repo}/commits/{item_id}"
            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch commit from GitHub")
                
            commit_data = response.json()
            files = commit_data["files"]
            commit_message = commit_data["commit"]["message"]
            
            doc_agent = DocumentationAgent()
            documentation = doc_agent.generate_commit_documentation(files, commit_message)
            
        else:
            url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{item_id}"
            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch PR from GitHub")
                
            pr_data = response.json()
            
            diff_url = pr_data["diff_url"]
            diff_response = requests.get(diff_url)
            if diff_response.status_code != 200:
                raise HTTPException(status_code=diff_response.status_code, detail="Failed to fetch PR diff")
                
            doc_agent = DocumentationAgent()
            documentation = doc_agent.generate_pr_documentation(pr_data, diff_response.text)
        
        return {
            "content": documentation["html_content"],
            "generated_at": datetime.now().isoformat(),
            "metadata": {
                key: value for key, value in documentation.items() if key != "html_content"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analyze-codebase/{user_id}")
async def analyze_codebase(user_id: str, query: str):
    try:
        # Get organization and GitHub URL
        org = mongo_client.get_organization_by_user_id(user_id)
        if not org:
            raise HTTPException(status_code=404, detail="User is not affiliated with any organization")
            
        org_id = str(org["_id"])
        github_url = mongo_client.get_org_github_url(org_id)
        
        # Parse GitHub URL to get owner and repo
        parts = github_url.strip('/').split('/')
        if len(parts) < 2:
            raise HTTPException(status_code=400, detail="Invalid GitHub URL format")
        owner, repo = parts[-2], parts[-1]
        
        # Initialize analyzer and get results
        analyzer = CodebaseAnalyzer()
        results = analyzer.analyze_codebase(owner, repo, query)
        
        return {
            "query": query,
            "answer": results["answer"],
            "confidence": results["confidence"],
            "sources": results["sources"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
