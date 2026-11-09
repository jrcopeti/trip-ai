# The lethal trifecta and the Rule of Two, in plain words

**The idea.** A language model follows instructions it finds in the text it reads. So an
agent that (1) can read your private data, (2) reads text someone else wrote, and (3) can
send data out can be steered by that text into sending your data to the author. No filter
catches every phrasing, so the dependable fix is to make sure one session never has all
three.

**Rule of Two.** Meta's version of the same idea: give an agent at most two of the three in
one session. If a job needs all three, don't let it run unattended; put a human approval or
another reliable check in front of the dangerous step.

## Sources (quoted verbatim)

**Simon Willison, "The lethal trifecta for AI agents", 16 June 2025** —
https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/

> "The lethal trifecta of capabilities is: Access to your private data —one of the most common purposes of tools in the first place! Exposure to untrusted content —any mechanism by which text (or images) controlled by a malicious attacker could become available to your LLM The ability to externally communicate in a way that could be used to steal your data"

> "If your agent combines these three features, an attacker can easily trick it into accessing your private data and sending it to that attacker."

> "in web application security 95% is very much a failing grade."

**Meta, "Agents Rule of Two: A Practical Approach to AI Agent Security", 31 Oct 2025** —
https://ai.meta.com/blog/practical-ai-agent-security/

> "agents must satisfy no more than two of the following three properties within a session to avoid the highest impact consequences of prompt injection. [A] An agent can process untrustworthy inputs [B] An agent can have access to sensitive systems or private data [C] An agent can change state or communicate externally"

> "If an agent requires all three without starting a new session (i.e., with a fresh context window), then the agent should not be permitted to operate autonomously and at a minimum requires supervision --- via human-in-the-loop approval or another reliable means of validation."

**OWASP Top 10 for LLM Applications 2025, LLM01 Prompt Injection** —
https://genai.owasp.org/llmrisk/llm01-prompt-injection/

> "Given the stochastic influence at the heart of the way models work, it is unclear if there are fool-proof methods of prevention for prompt injection."

> "Enforce privilege control and least privilege access Provide the application with its own API tokens for extensible functionality, and handle these functions in code rather than providing them to the model."

**EchoLeak, CVE-2025-32711 (Microsoft 365 Copilot)** — Reddy & Gujral, arXiv 2509.10540,
https://arxiv.org/abs/2509.10540

> "a zero-click prompt injection vulnerability in Microsoft 365 Copilot that enabled remote, unauthenticated data exfiltration via a single crafted email."

Willison on the same incident (https://simonwillison.net/2025/Jun/11/echoleak/):

> "the CSP allow-list is pretty wide, and included *.teams.microsoft.com . It turns out that domain hosted an open redirect URL"

**Anthropic, "Mitigating the risk of prompt injections in browser use", 24 Nov 2025** —
https://www.anthropic.com/research/prompt-injection-defenses

> "A 1% attack success rate—while a significant improvement—still represents meaningful risk."

**Claude Code docs, Routines** — https://code.claude.com/docs/en/routines

> "Claude can use every tool from an included connector, including writes, without asking for permission during a run."

> "MCP connector traffic is routed through Anthropic's servers rather than that path, so the connectors you add to the routine work without adding their hosts to **Allowed domains**."

**Claude Code docs, Cloud environments** — https://code.claude.com/docs/en/cloud-environments

> "Each session copies the environment's values once, at startup, into ordinary environment variables that any command Claude runs can read."

> "Your repo's `.claude/settings.json` hooks and permission rules | Yes, in a session with one repository"
