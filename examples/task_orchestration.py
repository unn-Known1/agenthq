#!/usr/bin/env python3
"""
AgentHQ Task Orchestration Example

This example demonstrates multi-agent coordination and task delegation
within the AgentHQ orchestration framework.

Usage:
    python examples/task_orchestration.py
"""

import json
from dataclasses import dataclass, field
from typing import Optional, Any
from datetime import datetime
from enum import Enum


class AgentRole(Enum):
    """Available agent roles."""

    CEO = "ceo"
    CTO = "cto"
    ENGINEER = "engineer"
    DESIGNER = "designer"
    MARKETING = "marketing"
    SUPPORT = "support"
    CUSTOM = "custom"


class TaskPriority(Enum):
    """Task priority levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TaskStatus(Enum):
    """Task completion status."""

    BACKLOG = "backlog"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    DONE = "done"


class Provider(Enum):
    """AI provider types."""

    CLAUDE = "claude"
    OPENAI = "openai"
    CUSTOM = "custom"


@dataclass
class Agent:
    """Simplified agent representation."""

    name: str
    role: AgentRole
    provider: Provider
    model: str
    monthly_budget: float
    parent_id: Optional[str] = None
    current_spend: float = 0.0
    id: str = ""
    subordinates: list = field(default_factory=list)

    def __post_init__(self):
        if not self.id:
            self.id = f"agent_{self.name.lower().replace(' ', '_')}"


@dataclass
class Task:
    """Represents a task in the orchestration system."""

    title: str
    description: str
    priority: TaskPriority
    created_by: str
    assignee_id: Optional[str] = None
    status: TaskStatus = TaskStatus.BACKLOG
    budget_allocated: float = 0.0
    budget_consumed: float = 0.0
    parent_task_id: Optional[str] = None
    id: str = ""
    created_at: str = ""

    def __post_init__(self):
        if not self.id:
            self.id = f"task_{len(self.title[:10])}_{datetime.utcnow().timestamp()}"
        if not self.created_at:
            self.created_at = datetime.utcnow().isoformat() + "Z"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "priority": self.priority.value,
            "status": self.status.value,
            "createdBy": self.created_by,
            "assigneeId": self.assignee_id,
            "parentTaskId": self.parent_task_id,
            "budgetAllocated": self.budget_allocated,
            "budgetConsumed": self.budget_consumed,
            "createdAt": self.created_at,
        }


@dataclass
class StatusReport:
    """Agent status report submitted to supervisor."""

    agent_id: str
    task_id: Optional[str]
    content: str
    progress: int
    submitted_to: str
    id: str = ""
    created_at: str = ""

    def __post_init__(self):
        if not self.id:
            self.id = f"report_{datetime.utcnow().timestamp()}"
        if not self.created_at:
            self.created_at = datetime.utcnow().isoformat() + "Z"


class TaskOrchestrator:
    """
    Orchestrates tasks between multiple agents with hierarchical structure.

    Features:
    - Task delegation based on agent hierarchy
    - Progress tracking and reporting
    - Budget management per task
    - Subtask creation and tracking
    """

    def __init__(self):
        self.agents: dict[str, Agent] = {}
        self.tasks: dict[str, Task] = {}
        self.reports: list[StatusReport] = []
        self.task_counter = 0

    def register_agent(self, agent: Agent) -> None:
        """Register an agent in the orchestrator."""
        self.agents[agent.id] = agent
        if agent.parent_id and agent.parent_id in self.agents:
            parent = self.agents[agent.parent_id]
            if agent.id not in parent.subordinates:
                parent.subordinates.append(agent.id)
        print(f"Registered agent: {agent.name} ({agent.role.value})")

    def create_task(
        self,
        title: str,
        description: str,
        priority: TaskPriority,
        created_by: str,
        budget: float = 0.0,
    ) -> Task:
        """Create a new task."""
        self.task_counter += 1
        task = Task(
            title=title,
            description=description,
            priority=priority,
            created_by=created_by,
            budget_allocated=budget,
        )
        self.tasks[task.id] = task
        print(f"Created task [{priority.value}]: {title}")
        return task

    def delegate_task(self, task_id: str, assignee_id: str) -> bool:
        """Assign a task to an agent."""
        if task_id not in self.tasks:
            print(f"Error: Task {task_id} not found")
            return False
        if assignee_id not in self.agents:
            print(f"Error: Agent {assignee_id} not found")
            return False

        task = self.tasks[task_id]
        assignee = self.agents[assignee_id]

        # Check hierarchy - senior agents can assign to subordinates
        if assignee.parent_id:
            task.assignee_id = assignee_id
            task.status = TaskStatus.IN_PROGRESS
            print(f"Delegated task '{task.title}' to {assignee.name}")
            return True

        print(f"Error: {assignee.name} cannot receive tasks (no supervisor)")
        return False

    def create_subtask(
        self,
        parent_task_id: str,
        title: str,
        description: str,
        priority: TaskPriority,
        assignee_id: Optional[str] = None,
    ) -> Optional[Task]:
        """Create a subtask under a parent task."""
        if parent_task_id not in self.tasks:
            print(f"Error: Parent task {parent_task_id} not found")
            return None

        parent = self.tasks[parent_task_id]
        subtask = Task(
            title=title,
            description=description,
            priority=priority,
            created_by=parent.created_by,
            parent_task_id=parent_task_id,
            budget_allocated=parent.budget_allocated * 0.3,
        )
        subtask.assignee_id = assignee_id
        if assignee_id:
            subtask.status = TaskStatus.IN_PROGRESS

        self.tasks[subtask.id] = subtask
        print(f"Created subtask of '{parent.title}': {title}")
        return subtask

    def submit_report(
        self, agent_id: str, task_id: Optional[str], content: str, progress: int
    ) -> StatusReport:
        """Submit a status report to supervisor."""
        if agent_id not in self.agents:
            raise ValueError(f"Agent {agent_id} not found")

        agent = self.agents[agent_id]
        if not agent.parent_id:
            raise ValueError(f"Agent {agent_id} has no supervisor to report to")

        report = StatusReport(
            agent_id=agent_id,
            task_id=task_id,
            content=content,
            progress=progress,
            submitted_to=agent.parent_id,
        )
        self.reports.append(report)
        print(f"Agent {agent.name} submitted progress report: {progress}%")
        return report

    def get_agent_tasks(self, agent_id: str) -> list[Task]:
        """Get all tasks assigned to an agent."""
        return [t for t in self.tasks.values() if t.assignee_id == agent_id]

    def get_subordinate_reports(self, supervisor_id: str) -> list[StatusReport]:
        """Get all reports submitted to a supervisor."""
        return [r for r in self.reports if r.submitted_to == supervisor_id]

    def get_org_hierarchy(self) -> dict:
        """Get the organizational hierarchy as a nested dict."""

        def build_tree(agent_id: str) -> dict:
            agent = self.agents.get(agent_id)
            if not agent:
                return {}
            return {
                "id": agent.id,
                "name": agent.name,
                "role": agent.role.value,
                "subordinates": [build_tree(sub_id) for sub_id in agent.subordinates],
            }

        # Find root agents (no parent)
        root_agents = [a for a in self.agents.values() if not a.parent_id]
        return {"roots": [build_tree(a.id) for a in root_agents]}

    def print_status(self) -> None:
        """Print current orchestrator status."""
        print("\n" + "=" * 60)
        print("Task Orchestrator Status")
        print("=" * 60)

        print(f"\nRegistered Agents: {len(self.agents)}")
        for agent in self.agents.values():
            tasks = self.get_agent_tasks(agent.id)
            print(f"  - {agent.name} ({agent.role.value}): {len(tasks)} tasks")

        print(f"\nTotal Tasks: {len(self.tasks)}")
        status_counts = {}
        for task in self.tasks.values():
            status_counts[task.status.value] = (
                status_counts.get(task.status.value, 0) + 1
            )
        for status, count in status_counts.items():
            print(f"  - {status}: {count}")

        print(f"\nStatus Reports: {len(self.reports)}")
        print("=" * 60)


def main():
    """Demonstrate multi-agent task orchestration."""
    print("=" * 60)
    print("AgentHQ Task Orchestration Example")
    print("=" * 60)

    # Initialize orchestrator
    orchestrator = TaskOrchestrator()

    # Create organizational hierarchy
    print("\n--- Setting Up Organization ---")

    ceo = Agent(
        name="CEO_Alice",
        role=AgentRole.CEO,
        provider=Provider.CLAUDE,
        model="claude-3-5-sonnet",
        monthly_budget=500.0,
    )
    orchestrator.register_agent(ceo)

    cto = Agent(
        name="CTO_Bob",
        role=AgentRole.CTO,
        provider=Provider.CLAUDE,
        model="claude-3-5-sonnet",
        monthly_budget=200.0,
        parent_id=ceo.id,
    )
    orchestrator.register_agent(cto)

    engineer = Agent(
        name="Engineer_Charlie",
        role=AgentRole.ENGINEER,
        provider=Provider.OPENAI,
        model="gpt-4o",
        monthly_budget=100.0,
        parent_id=cto.id,
    )
    orchestrator.register_agent(engineer)

    designer = Agent(
        name="Designer_Diana",
        role=AgentRole.DESIGNER,
        provider=Provider.OPENAI,
        model="gpt-4o-mini",
        monthly_budget=75.0,
        parent_id=cto.id,
    )
    orchestrator.register_agent(designer)

    # CEO creates high-level task
    print("\n--- Creating Tasks ---")

    main_task = orchestrator.create_task(
        title="Launch New Product",
        description="Coordinate the launch of our new AI product",
        priority=TaskPriority.CRITICAL,
        created_by=ceo.id,
        budget=50.0,
    )

    # CTO breaks down into subtasks
    design_task = orchestrator.create_subtask(
        parent_task_id=main_task.id,
        title="Design UI/UX",
        description="Create wireframes and mockups for the product",
        priority=TaskPriority.HIGH,
        assignee_id=designer.id,
    )

    dev_task = orchestrator.create_subtask(
        parent_task_id=main_task.id,
        title="Implement Features",
        description="Build the core functionality",
        priority=TaskPriority.HIGH,
        assignee_id=engineer.id,
    )

    # Subtasks for the engineer
    if design_task:
        subtask1 = orchestrator.create_subtask(
            parent_task_id=design_task.id,
            title="Create Wireframes",
            description="Design low-fidelity wireframes",
            priority=TaskPriority.MEDIUM,
        )

    if dev_task:
        subtask2 = orchestrator.create_subtask(
            parent_task_id=dev_task.id,
            title="Set Up Backend",
            description="Configure server and database",
            priority=TaskPriority.HIGH,
        )

    # Agents submit progress reports
    print("\n--- Agent Reports ---")

    orchestrator.submit_report(
        agent_id=engineer.id,
        task_id=dev_task.id if dev_task else None,
        content="Completed initial setup. Ready for feature development.",
        progress=25,
    )

    orchestrator.submit_report(
        agent_id=designer.id,
        task_id=design_task.id,
        content="Wireframes are 60% complete. Moving to high-fidelity mockups.",
        progress=60,
    )

    # Print organizational hierarchy
    print("\n--- Organizational Hierarchy ---")
    hierarchy = orchestrator.get_org_hierarchy()
    print(json.dumps(hierarchy, indent=2))

    # Print final status
    orchestrator.print_status()

    # Get reports for CEO
    print("\n--- CEO Dashboard ---")
    ceo_reports = orchestrator.get_subordinate_reports(ceo.id)
    print(f"Reports received by CEO: {len(ceo_reports)}")

    for report in ceo_reports:
        print(
            f"  - From {orchestrator.agents[report.agent_id].name}: {report.progress}% complete"
        )

    print("\n" + "=" * 60)
    print("Task orchestration example completed successfully!")
    print("=" * 60)


if __name__ == "__main__":
    main()
