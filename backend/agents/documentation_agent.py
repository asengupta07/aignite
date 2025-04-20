from agno.agent import Agent, RunResponse
from agno.models.google.gemini import Gemini
from dotenv import load_dotenv
import os
from typing import List, Dict, Any
from pydantic import BaseModel

class CommitDocumentation(BaseModel):
    summary: str
    purpose: str
    technical_details: str
    impact: str
    testing_recommendations: str
    html_content: str

class PRDocumentation(BaseModel):
    summary: str
    purpose: str
    technical_details: str
    impact: str
    testing_considerations: str
    review_checklist: list[str]
    risks: list[str]
    html_content: str

load_dotenv()

class DocumentationAgent:
    def __init__(self):
        self.agent = Agent(
            model=Gemini(id="gemini-2.0-flash", api_key=os.getenv("GOOGLE_API_KEY")),
            response_model=CommitDocumentation,
            structured_outputs=True
        )
        self.pr_agent = Agent(
            model=Gemini(id="gemini-2.0-flash", api_key=os.getenv("GOOGLE_API_KEY")),
            response_model=PRDocumentation,
            structured_outputs=True
        )

    def generate_commit_documentation(self, files: List[Dict[str, Any]], commit_message: str) -> Dict[str, Any]:
        changes_summary = []
        for file in files:
            changes_summary.append(
                f"File: {file['filename']}\n"
                f"Changes: +{file['additions']} -{file['deletions']}\n"
                f"Status: {file['status']}\n"
                f"Patch:\n{file.get('patch', 'No patch available')}\n"
            )

        prompt = f"""
        As a technical documentation expert, analyze this commit and generate comprehensive documentation.

        Commit Message:
        {commit_message}

        Changes Made:
        {"".join(changes_summary)}

        Generate documentation with the following sections:
        - Summary: A concise overview of what this commit does
        - Purpose: The goal and reasoning behind these changes
        - Technical Details: Specific implementation details and approach
        - Impact: How these changes affect the codebase
        - Testing Recommendations: Suggested testing approaches

        Also include an HTML formatted version of the complete documentation in the html_content field.
        The HTML should be well-structured and styled for direct display.
        """

        try:
            response: RunResponse = self.agent.run(prompt)
            return response.content.__dict__
        except Exception as e:
            return {
                "summary": "Error generating documentation",
                "purpose": "N/A",
                "technical_details": "N/A",
                "impact": "N/A",
                "testing_recommendations": "N/A",
                "html_content": f"""
                <h2>Error Generating Documentation</h2>
                <p>There was an error generating the documentation: {str(e)}</p>
                <h3>Raw Changes:</h3>
                <pre>{commit_message}</pre>
                """
            }

    def generate_pr_documentation(self, pr_data: Dict[str, Any], diff: str) -> Dict[str, Any]:
        prompt = f"""
        As a technical documentation expert, analyze this pull request and generate comprehensive documentation.

        Pull Request Title: {pr_data['title']}
        Description: {pr_data.get('body', 'No description provided')}

        Changes Overview:
        - Files Changed: {pr_data['changed_files']}
        - Additions: +{pr_data['additions']}
        - Deletions: -{pr_data['deletions']}

        Diff:
        {diff[:3000]}  # Limiting diff size to avoid token limits

        Generate documentation with the following sections:
        - Summary: A high-level overview of the changes
        - Purpose: The motivation and goals behind these changes
        - Technical Details: Implementation specifics and approach
        - Impact: System-wide effects and considerations
        - Testing Considerations: Testing strategy and requirements
        - Review Checklist: Specific items reviewers should check
        - Risks: Potential issues or areas needing attention

        Also include an HTML formatted version of the complete documentation in the html_content field.
        The HTML should be well-structured and styled for direct display.
        """

        try:
            response: RunResponse = self.pr_agent.run(prompt)
            return response.content.__dict__
        except Exception as e:
            return {
                "summary": "Error generating documentation",
                "purpose": "N/A",
                "technical_details": "N/A",
                "impact": "N/A",
                "testing_considerations": "N/A",
                "review_checklist": [],
                "risks": [],
                "html_content": f"""
                <h2>Error Generating Documentation</h2>
                <p>There was an error generating the documentation: {str(e)}</p>
                <h3>Pull Request Details:</h3>
                <pre>{pr_data['title']}</pre>
                """
            } 