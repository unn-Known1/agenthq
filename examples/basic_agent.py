#!/usr/bin/env python3
"""
AgentHQ Basic Agent Example

This example demonstrates how to create a simple AI agent using AgentHQ's
agent orchestration framework.

Usage:
    python examples/basic_agent.py
"""

import json
from dataclasses import dataclass, field
from typing import Optional
from enum import Enum


class AgentRole(Enum):
    """Available agent roles in AgentHQ."""

    CEO = "ceo"
    CTO = "cto"
    ENGINEER = "engineer"
    DESIGNER = "designer"
    MARKETING = "marketing"
    SUPPORT = "support"
    CUSTOM = "custom"


class Provider(Enum):
    """AI provider types."""

    CLAUDE = "claude"
    OPENAI = "openai"
    CUSTOM = "custom"


class AgentStatus(Enum):
    """Agent operational status."""

    ACTIVE = "active"
    PAUSED = "paused"
    TERMINATED = "terminated"


@dataclass
class Agent:
    """
    Represents an AI agent in the AgentHQ orchestration system.

    Attributes:
        name: Display name for the agent
        role: Business role (CEO, CTO, Engineer, etc.)
        provider: AI provider (Claude, OpenAI, Custom)
        model: Model identifier
        system_prompt: Instructions defining agent behavior
        monthly_budget: Maximum monthly spend limit
        parent_id: ID of supervising agent (None for top-level)
    """

    name: str
    role: AgentRole
    provider: Provider
    model: str
    system_prompt: str
    monthly_budget: float
    parent_id: Optional[str] = None
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    status: AgentStatus = AgentStatus.ACTIVE
    current_spend: float = 0.0
    can_create_agents: bool = False
    can_use_tools: bool = False
    id: str = ""
    subordinates: list = field(default_factory=list)

    def __post_init__(self):
        if not self.id:
            self.id = f"agent_{self.name.lower().replace(' ', '_')}"

    def to_dict(self) -> dict:
        """Convert agent to dictionary for API serialization."""
        return {
            "id": self.id,
            "name": self.name,
            "role": self.role.value,
            "provider": self.provider.value,
            "model": self.model,
            "systemPrompt": self.system_prompt,
            "monthlyBudget": self.monthly_budget,
            "currentSpend": self.current_spend,
            "status": self.status.value,
            "parentId": self.parent_id,
            "canCreateAgents": self.can_create_agents,
            "canUseTools": self.can_use_tools,
            "subordinates": self.subordinates,
            "apiKey": self.api_key,
            "baseUrl": self.base_url,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Agent":
        """Create Agent instance from dictionary."""
        return cls(
            id=data.get("id", ""),
            name=data["name"],
            role=AgentRole(data["role"]),
            provider=Provider(data["provider"]),
            model=data.get("model", ""),
            system_prompt=data.get("systemPrompt", ""),
            monthly_budget=data.get("monthlyBudget", 0),
            current_spend=data.get("currentSpend", 0),
            status=AgentStatus(data.get("status", "active")),
            parent_id=data.get("parentId"),
            can_create_agents=data.get("canCreateAgents", False),
            can_use_tools=data.get("canUseTools", False),
            subordinates=data.get("subordinates", []),
            api_key=data.get("apiKey"),
            base_url=data.get("baseUrl"),
        )


class BasicAgent:
    """
    Simple agent implementation demonstrating AgentHQ patterns.

    This class shows the basic structure for creating agents that can:
    - Send and receive messages
    - Track usage and budgets
    - Report to supervisor agents
    """

    def __init__(self, config: Agent):
        self.config = config
        self.messages: list[dict] = []

    def send_message(self, content: str, recipient_id: str) -> dict:
        """Send a message to another agent."""
        message = {
            "id": f"msg_{len(self.messages)}",
            "senderId": self.config.id,
            "receiverId": recipient_id,
            "content": content,
            "timestamp": self._get_timestamp(),
        }
        self.messages.append(message)
        return message

    def receive_message(self, message: dict) -> str:
        """Process incoming message and return response."""
        sender = message.get("senderId", "unknown")
        content = message.get("content", "")

        # Simple response logic - in production, this would call the AI API
        response = f"Agent {self.config.name} received: '{content}'"
        return response

    def get_status_report(self) -> dict:
        """Generate status report for supervisor."""
        return {
            "agentId": self.config.id,
            "agentName": self.config.name,
            "status": self.config.status.value,
            "currentSpend": self.config.current_spend,
            "budgetRemaining": self.config.monthly_budget - self.config.current_spend,
            "messageCount": len(self.messages),
            "timestamp": self._get_timestamp(),
        }

    def _get_timestamp(self) -> str:
        """Get current ISO timestamp."""
        from datetime import datetime

        return datetime.utcnow().isoformat() + "Z"

    def estimate_cost(self, input_tokens: int, output_tokens: int) -> float:
        """
        Estimate cost for a request based on token usage.

        Pricing (approximate, in USD per 1M tokens):
        - Claude 3.5 Sonnet: $3 input, $15 output
        - GPT-4o: $5 input, $15 output
        """
        if self.config.provider == Provider.CLAUDE:
            input_cost = input_tokens * 3 / 1_000_000
            output_cost = output_tokens * 15 / 1_000_000
        elif self.config.provider == Provider.OPENAI:
            input_cost = input_tokens * 5 / 1_000_000
            output_cost = output_tokens * 15 / 1_000_000
        else:
            # Custom provider - estimate
            input_cost = input_tokens * 4 / 1_000_000
            output_cost = output_tokens * 12 / 1_000_000

        return input_cost + output_cost

    def check_budget(self, estimated_cost: float) -> bool:
        """Check if request would exceed budget."""
        return (
            self.config.current_spend + estimated_cost
        ) <= self.config.monthly_budget


def create_hello_world_agent() -> BasicAgent:
    """Create a simple hello world agent."""
    config = Agent(
        name="HelloBot",
        role=AgentRole.CUSTOM,
        provider=Provider.OPENAI,
        model="gpt-4o-mini",
        system_prompt="You are a friendly assistant that responds to greetings.",
        monthly_budget=10.0,
    )
    return BasicAgent(config)


def create_support_agent(name: str, api_key: str) -> BasicAgent:
    """Create a customer support agent."""
    config = Agent(
        name=name,
        role=AgentRole.SUPPORT,
        provider=Provider.CLAUDE,
        model="claude-3-5-haiku",
        system_prompt=(
            "You are a helpful customer support agent. "
            "Be polite, professional, and efficient. "
            "Escalate complex issues to human support."
        ),
        monthly_budget=50.0,
        can_use_tools=True,
    )
    config.api_key = api_key
    return BasicAgent(config)


def main():
    """Demonstrate basic agent functionality."""
    print("=" * 60)
    print("AgentHQ Basic Agent Example")
    print("=" * 60)

    # Create a simple agent
    agent = create_hello_world_agent()
    print(f"\nCreated Agent: {agent.config.name}")
    print(f"  Role: {agent.config.role.value}")
    print(f"  Provider: {agent.config.provider.value}")
    print(f"  Model: {agent.config.model}")
    print(f"  Budget: ${agent.config.monthly_budget:.2f}/month")

    # Send a message
    print("\n--- Sending Message ---")
    response = agent.receive_message(
        {
            "senderId": "user",
            "content": "Hello, how are you?",
            "timestamp": agent._get_timestamp(),
        }
    )
    print(f"Response: {response}")

    # Get status report
    print("\n--- Status Report ---")
    report = agent.get_status_report()
    print(json.dumps(report, indent=2))

    # Estimate costs
    print("\n--- Cost Estimation ---")
    estimated = agent.estimate_cost(100, 50)
    print(f"Estimated cost for 100 input + 50 output tokens: ${estimated:.4f}")
    print(f"Within budget: {agent.check_budget(estimated)}")

    # Create a support agent
    print("\n--- Support Agent ---")
    support = create_support_agent("SupportBot", "sk-xxxxx")
    print(f"Created Support Agent: {support.config.name}")
    print(f"  Role: {support.config.role.value}")
    print(f"  Can use tools: {support.config.can_use_tools}")

    print("\n" + "=" * 60)
    print("Example completed successfully!")
    print("=" * 60)


if __name__ == "__main__":
    main()
