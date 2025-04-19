from agno.agent import Agent, RunResponse
from agno.models.google.gemini import Gemini
from dotenv import load_dotenv
import os
from models.schema import ProductGoal
from pydantic import BaseModel

class ProgressReport(BaseModel):
    goal_id: str
    expected_progress: str
    confirmed_progress: str
    issues: list[str]
    suggestions: list[str]

class Commit(BaseModel):
    message: str


class PR(BaseModel):
    title: str
    description: str
    commits: list[Commit]

load_dotenv()

class ProgressReportAgent:
    def __init__(self):
        self.agent = Agent(model=Gemini(id="gemini-2.0-flash", api_key=os.getenv("GOOGLE_API_KEY")),
                  response_model=ProgressReport, structured_outputs=True)

    def generate_progress_report(self, goal: ProductGoal, commits: list[Commit], prs: list[PR]) -> ProgressReport:
        prompt = f"""
        You are a helpful assistant that generates a progress report for a given goal from commits and PRs.
        The goal is {goal.title}
        The description is {goal.description}
        """
        return self.agent.run(prompt)
