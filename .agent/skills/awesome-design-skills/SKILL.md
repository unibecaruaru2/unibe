---
name: awesome-design-skills
description: Curated registry of 67+ design system skills from bergside/awesome-design-skills and TypeUI. Use when applying design themes (Bento, Brutalism, Claymorphism, Agentic, Claude, Bold, Neo-Brutalism, etc.), pulling design tokens with typeui.sh, or integrating TypeUI MCP.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Awesome Design Skills & TypeUI Integration

> **Repository:** [bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills)  
> **Tooling:** [TypeUI CLI & MCP](https://typeui.sh) (`https://mcp.typeui.sh/mcp`)

This skill integrates a curated registry of 67+ production-ready design systems into agentic workflows. Each design style provides a dual-file architecture:
- `SKILL.md`: AI instructions (tokens, constraints, component rules, accessibility requirements)
- `DESIGN.md`: Human-readable design intent, typography specs, color palettes, and rationale

---

## 🚀 Quick Commands (TypeUI CLI)

You can pull, inspect, and apply any design skill using `npx typeui.sh`:

```bash
# List all available design skills from the registry
npx typeui.sh list

# Pull a specific design skill into your project
npx typeui.sh pull <slug>

# Interactively generate a custom SKILL.md / DESIGN.md
npx typeui.sh generate

# Generate a randomized local design system
npx typeui.sh randomize

# Update an existing skill in-place
npx typeui.sh update <slug>
```

---

## 🎨 Popular Design Skills Registry (Partial List)

| Slug | Style Description | Best For | Pull Command |
|---|---|---|---|
| `agentic` | Futuristic, subtle glows, dark mode, high contrast | AI dashboards, agents, devtools | `npx typeui.sh pull agentic` |
| `bento` | Grid-based modular cards, smooth radius, clean lines | Modern SaaS, marketing, portfolios | `npx typeui.sh pull bento` |
| `brutalism` | High-contrast borders, raw typography, bold monospaced accents | Tech-forward, crypto, edgy landing pages | `npx typeui.sh pull brutalism` |
| `claymorphism` | Soft 3D inflated pill shapes, dual drop/inner shadows | Playful apps, mobile UI, fintech for Gen-Z | `npx typeui.sh pull claymorphism` |
| `claude` | Editorial serif, warm beige/sand palettes, calm reading experience | Knowledge bases, AI readers, long-form content | `npx typeui.sh pull claude` |
| `bold` | Heavy weights, high-impact titles, saturated accent pops | Consumer apps, fitness, gaming | `npx typeui.sh pull bold` |
| `cafe` | Warm earth tones, cozy coffee aesthetic, organic textures | E-commerce, lifestyle, artisanal brands | `npx typeui.sh pull cafe` |
| `ant` | Enterprise precision, compact tables, dense workflows | Internal tools, CRM, ERP, data dashboards | `npx typeui.sh pull ant` |
| `roku` | TV/entertainment-grade focus states, ultra-clear hierarchy | Media streaming, console dashboards | `npx typeui.sh pull roku` |
| `artistic` | Asymmetric layouts, expressive typography, creative canvas | Creative agencies, photography, art | `npx typeui.sh pull artistic` |

---

## 🔌 TypeUI MCP Integration

The TypeUI MCP endpoint is configured at:
```
https://mcp.typeui.sh/mcp
```

When active, it exposes tools to query design skills, fetch component tokens, and inspect system guidelines directly inside conversation turns without manual downloading.

---

## 📋 Workflow to Apply a Design Skill

1. **Identify the Project Personality**:
   - Understand the audience, product category, and emotional resonance.
2. **Select or Pull the Style**:
   - Run `npx typeui.sh pull <slug>` or inspect the relevant tokens.
3. **Map Design Tokens to Tailwind / CSS**:
   - Ensure color variables (primary, surface, border, muted) adhere strictly to the pulled `DESIGN.md`.
4. **Implement with Anti-Hallucination Guardrails**:
   - Do NOT invent arbitrary padding or off-brand colors.
   - Respect layout density and radius conventions specified by the skill.
