from typing import List, Dict, Optional
import requests
from agno.agent import Agent, RunResponse
from agno.models.google.gemini import Gemini
from dotenv import load_dotenv
import os
from pydantic import BaseModel
import json
class CodeAnalysis(BaseModel):
    relevance_score: float
    explanation: str
    code_snippets: List[str]

class CodebaseAnalysis(BaseModel):
    answer: str
    confidence: float
    sources: List[str]

load_dotenv()

class CodebaseAnalyzer:
    def __init__(self):
        self.agent = Agent(
            model=Gemini(id="gemini-2.0-flash", api_key=os.getenv("GOOGLE_API_KEY")),
            response_model=CodeAnalysis,
            structured_outputs=True
        )
        self.summary_agent = Agent(
            model=Gemini(id="gemini-2.0-flash", api_key=os.getenv("GOOGLE_API_KEY")),
            response_model=CodebaseAnalysis,
            structured_outputs=True
        )
        
    def get_repo_structure(self, owner: str, repo: str) -> Dict:
        """Fetch the full GitHub repo structure and return it as a nested tree"""
        headers = {
            "Accept": "application/vnd.github+json"
        }

        # Step 1: Get default branch
        repo_url = f"https://api.github.com/repos/{owner}/{repo}"
        repo_response = requests.get(repo_url, headers=headers)
        if repo_response.status_code != 200:
            raise Exception(f"Failed to fetch repo info: {repo_response.text}")
        
        default_branch = repo_response.json()["default_branch"]

        # Step 2: Get the full file tree recursively
        tree_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1"
        tree_response = requests.get(tree_url, headers=headers)
        if tree_response.status_code != 200:
            raise Exception(f"Failed to fetch repo tree: {tree_response.text}")

        flat_tree = tree_response.json()["tree"]

        # Step 3: Convert flat list to nested tree structure
        root = {}

        for item in flat_tree:
            parts = item["path"].split("/")
            node = root
            for i, part in enumerate(parts):
                if i == len(parts) - 1:
                    # Final part: either file or folder
                    node.setdefault(part, {} if item["type"] == "tree" else None)
                else:
                    node = node.setdefault(part, {})

        return root
    
    def get_file_content(self, owner: str, repo: str, path: str) -> str:
        """Get the content of a specific file"""
        headers = {
            "Accept": "application/vnd.github+json"
        }
        
        url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            raise Exception(f"Failed to fetch file content: {response.text}")
            
        content = response.json()["content"]
        # Decode base64 content
        import base64
        return base64.b64decode(content).decode('utf-8')
    
    def analyze_codebase(self, owner: str, repo: str, query: str) -> Dict:
        """Analyze the codebase to find information about a specific feature"""
        structure = self.get_repo_structure(owner, repo)
        
        prompt = f"""
        Given this repository structure and the query "{query}", identify the most relevant files that might contain information about this feature.
        Return the file paths in a list.

        Return a json object with the following fields:
        {{
            "relevance_score": 0-1 score of how relevant this file is,
            "explanation": brief explanation of why this file is relevant,
            "code_snippets": [
                "path/to/file.py",
                "path/to/file.py",
                ...
            ]
        }}
        
        Repository structure:
        {json.dumps(structure, indent=4)}
        """

        print("Prompt: ", prompt)
        
        response = self.agent.run(prompt)
        relevant_files = response.content.__dict__["code_snippets"]

        print("Relevant files: ", relevant_files)
        
        # Analyze each relevant file
        results = []
        for file_path in relevant_files:
            try:
                content = self.get_file_content(owner, repo, file_path)
                
                # Use LLM to analyze the file content
                analysis_prompt = f"""
                Analyze this code file and determine if it contains information about the feature described in the query: "{query}"

                Your response should be a json object with the following fields:
                {{
                    "relevance_score": 0-1 score of how relevant this file is,
                    "explanation": brief explanation of why this file is relevant
                }}

                File path: {file_path}
                Content:
                {content}
                """
                
                analysis_response = self.agent.run(analysis_prompt)
                analysis = analysis_response.content.__dict__

                print("Analysis: ", analysis)
                
                if analysis["relevance_score"] > 0.3:  # Only include files with significant relevance
                    results.append({
                        "file_path": file_path,
                        **analysis
                    })
                    
            except Exception as e:
                print(f"Error analyzing file {file_path}: {str(e)}")
                continue
        
        # Sort results by relevance score
        results.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        # Generate final summary
        summary_prompt = f"""
        Based on the analysis of these files, provide a comprehensive answer to the query: "{query}"
        
        Analysis results:
        {results}
        """
        
        summary_response = self.summary_agent.run(summary_prompt)
        return summary_response.content.__dict__ 