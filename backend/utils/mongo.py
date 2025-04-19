from pymongo import MongoClient
from bson.objectid import ObjectId
import os
from dotenv import load_dotenv
from models.schema import Organization, OrganizationMember, User, ApplicationStatus

load_dotenv()


class MongoProvider:
    def __init__(self):
        self.client = MongoClient(os.getenv("MONGO_URI"))
        self.db = self.client["intersect"]

    def store_organization(self, organization: Organization):
        self.db["organizations"].insert_one(organization.model_dump())
        org_id = str(self.db["organizations"].find_one({"owner_id": organization.owner_id})["_id"])
        self.db["organization_members"].insert_one({"organization_id": org_id, "github_id": organization.owner_id, "role": "admin"})

    def store_user(self, user: User):
        self.db["users"].insert_one({**user.model_dump(), "_id": user.github_id})

    def get_applications_by_admin_id(self, admin_id: str):
        organization = self.db["organizations"].find_one({"owner_id": admin_id})
        if not organization:
            return []
        organization_id = str(organization["_id"])
        applications = list(self.db["application_statuses"].find({"organization_id": organization_id}))
        # Convert ObjectId to string for each document
        for app in applications:
            app["_id"] = str(app["_id"])
        return applications

    def get_organization_by_key(self, key: str):
        return self.db["organizations"].find_one({"key": key})

    def store_organization_member(self, organization_member: OrganizationMember):
        self.db["organization_members"].insert_one(organization_member.model_dump())
        self.db["organizations"].update_one(
            {"_id": ObjectId(organization_member.organization_id)},
            {"$push": {"members": organization_member.model_dump()}}
        )

    def store_application_status(self, application_status: ApplicationStatus):
        self.db["application_statuses"].insert_one(application_status.model_dump())

    def update_application_status(self, application_id: str, status: str, role: str = None):
        # First check if the application exists
        application = self.db["application_statuses"].find_one({"_id": ObjectId(application_id)})
        if not application:
            raise ValueError(f"Application with ID {application_id} not found")

        self.db["application_statuses"].update_one(
            {"_id": ObjectId(application_id)},
            {"$set": {"status": status}}
        )

        if status == "approved":
            if not role:
                raise ValueError("Role is required when approving an application")
            self.db["organization_members"].insert_one(
                {"organization_id": application["organization_id"], "github_id": application["github_id"], "role": role}
            )

    def get_application_status(self, query: dict):
        return self.db["application_statuses"].find_one(query)

    def get_organization(self, query: dict):
        return self.db["organizations"].find_one(query)
    
    def get_user(self, query: dict):
        return self.db["users"].find_one(query)
    
    def get_organization_members(self, query: dict):
        return self.db["organization_members"].find(query)
    
    def get_organization_member(self, query: dict):
        return self.db["organization_members"].find_one(query)
    
    def get_organization_members_count(self, query: dict):
        return self.db["organization_members"].count_documents(query)
    
    def get_organization_members_by_organization_id(self, organization_id: str):
        members = list(self.db["organization_members"].find({"organization_id": organization_id}))
        for member in members:
            member["_id"] = str(member["_id"])
        return members
    
    def get_key(self, org_id: str):
        organization = self.db["organizations"].find_one({"_id": ObjectId(org_id)})
        if not organization:
            raise ValueError(f"Organization with ID {org_id} not found")
        return organization.get("key")
    
    def get_organization_by_user_id(self, user_id: str):
        # First check if user is an admin (owner) of an organization
        organization = self.db["organizations"].find_one({"owner_id": user_id})
        if organization:
            organization["_id"] = str(organization["_id"])
            return organization
            
        # If not an admin, check if user is a member of any organization
        member = self.db["organization_members"].find_one({"github_id": user_id})
        if member:
            organization = self.db["organizations"].find_one({"_id": ObjectId(member["organization_id"])})
            if organization:
                organization["_id"] = str(organization["_id"])
                return organization
                
        return None
    
    def set_org_github(self, admin_id: str, github_url: str):
        organization = self.db["organizations"].find_one({"owner_id": admin_id})
        if not organization:
            raise ValueError(f"No organization found for admin with ID {admin_id}")
        org_id = str(organization["_id"])
        self.db["organization_githubs"].insert_one({"organization_id": org_id, "github_url": github_url})
    