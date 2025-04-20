from agno.agent import Agent, RunResponse
from agno.models.google.gemini import Gemini
from dotenv import load_dotenv
import os
from models.schema import ProductGoal
from pydantic import BaseModel
from typing import Optional
class ProgressReport(BaseModel):
    expected_progress: str
    confirmed_progress: str
    issues: list[str]
    suggestions: list[str]
    todos: list[str]
    risks: list[str]

class Commit(BaseModel):
    message: str


class PR(BaseModel):
    title: str
    description: str

load_dotenv()

class ProgressReportAgent:
    def __init__(self):
        self.agent = Agent(model=Gemini(id="gemini-2.0-flash", api_key=os.getenv("GOOGLE_API_KEY")),
                  response_model=ProgressReport, structured_outputs=True)

    def generate_progress_report(self, goal: ProductGoal, commits: list[Commit], prs: list[Optional[PR]]) -> ProgressReport:
        goal = ProductGoal(**goal)
        # Filter out None values and create PR objects only for valid PRs
        valid_prs = [PR(**pr) for pr in prs if pr is not None and pr.get('description') is not None]
        
        # Handle both string and Commit object cases for commits
        commit_messages = []
        for commit in commits:
            if isinstance(commit, str):
                commit_messages.append(commit)
            elif isinstance(commit, dict):
                commit_messages.append(commit.get('message', str(commit)))
            else:
                commit_messages.append(commit.message if hasattr(commit, 'message') else str(commit))
                
        print("Goal: ", goal)
        prompt = f"""
        You are a helpful assistant that generates a progress report for a given goal from commits and PRs.
        The goal is {goal.title}
        The description is {goal.description}
        The status is {goal.status}
        The priority is {goal.priority}
        The tags are {goal.tags}

        The commits are:
        {", ".join(commit_messages)}

        The PRs are:
        {", ".join([pr.title + " - " + pr.description for pr in valid_prs])}

        Your output should be in the following format:
        - Expected progress (Out of 100)
        - Confirmed progress (Out of 100)
        - Issues
        - Suggestions
        - To-dos (A list of specific, actionable tasks that need to be completed to achieve the goal)
        - Risks / Blockers (Highlight current or potential issues that may delay or hinder goal completion)

        Expected progress should be a optimistic estimate of the progress of the goal based on the commits.

        Confirmed progress should be a more realistic estimate of the progress of the goal based on the PRs.

        To-dos should be specific, actionable tasks that:
        1. Are directly related to the goal
        2. Can be completed independently
        3. Have clear success criteria
        4. Are prioritized based on importance
        5. Include both technical and non-technical tasks
        6. Consider dependencies between tasks

        Risks / Blockers should include:
        1. Unresolved dependencies that could delay progress
        2. Areas requiring external input or approval
        3. Technical challenges or limitations
        4. Resource constraints or availability issues
        5. Potential conflicts with other goals or systems
        6. External factors that could impact the timeline
        7. Areas of ambiguity or uncertainty
        """
        response: RunResponse = self.agent.run(prompt)
        return response.content.__dict__
