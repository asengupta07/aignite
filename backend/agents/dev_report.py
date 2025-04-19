from agno.agent import Agent, RunResponse
from agno.models.google.gemini import Gemini
from dotenv import load_dotenv
import os
from pydantic import BaseModel

class DevReport(BaseModel):
    summary: str
    changes: list[str]
    issues: list[str]
    suggestions: list[str]

load_dotenv()

class DevReportAgent:
    def __init__(self):
        self.agent = Agent(model=Gemini(id="gemini-2.0-flash", api_key=os.getenv("GOOGLE_API_KEY")),
                  response_model=DevReport, structured_outputs=True)

    def generate_dev_report(self, commit_messages: list[str]) -> str:
        prompt = f"""
        Generate a report of the following commit messages: {commit_messages}

        The report should have the following sections:
        - Summary: A summary of the changes
        - Changes: A list of the changes
        - Issues: A list of the issues
        - Suggestions: A list of the suggestions
        """
        response: RunResponse = self.agent.run(prompt)
        return response.content.__dict__


# if __name__ == "__main__":
#     commit_messages = [
#         "Add a new feature",
#         "Fix a bug",
#         "Refactor the code"
#     ]
#     dev_report_agent = DevReportAgent()
#     print(dev_report_agent.generate_dev_report(commit_messages))




