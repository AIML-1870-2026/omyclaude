# LLM Switchboard — Specification

## Overview
A single-page web application that lets users send prompts to LLMs from multiple providers and receive either free-form text or structured JSON responses — all from the browser with no backend.

---

## Supported Providers & Models

| Provider  | Models                                                              | Notes                              |
|-----------|---------------------------------------------------------------------|------------------------------------|
| OpenAI    | gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo                   | Full browser support via CORS      |
| Anthropic | claude-opus-4-6, claude-sonnet-4-6, claude-haiku-4-5              | CORS restricted (see note below)   |

### Anthropic CORS Limitation
Anthropic's API does not permit direct browser requests (no `Access-Control-Allow-Origin` header). When the user selects an Anthropic model, the app displays a clear explanation and suggests using a proxy or the Anthropic SDK in a server environment. Anthropic keys can still be stored and the UI remains functional for educational demonstration.

---

## API Key Handling

### Input Methods
1. **Manual text entry** — paste key directly into a password-type input field
2. **File upload** — upload a `.env` file (`OPENAI_API_KEY=sk-...`) or a `.csv` file with `provider,key` columns

### Storage Policy
- Keys are stored **in JavaScript memory only** (a module-scoped variable)
- Keys are **never** written to `localStorage`, `sessionStorage`, `cookies`, or sent anywhere other than the chosen provider's official API endpoint
- A privacy banner is displayed prominently: *"Keys stored in memory only — never persisted to disk or any server."*
- Keys are cleared on page reload

---

## Output Modes

### Unstructured (Text)
- Free-form system prompt: *"You are a helpful assistant. Respond in plain text."*
- Response rendered as formatted Markdown in a scrollable panel
- Suitable for conversational queries, summaries, explanations

### Structured (JSON)
- User provides a JSON Schema in a dedicated editor panel
- System prompt instructs the model to return **only** valid JSON matching the schema
- Response is parsed with `JSON.parse()`; on success it is pretty-printed with syntax highlighting
- On parse failure, raw response is shown with an error banner

---

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  Header: "LLM Switchboard" + mode toggle (Text / JSON)  │
├──────────────────┬──────────────────────────────────────┤
│  LEFT PANEL      │  RIGHT PANEL                         │
│  ─────────────   │  ─────────────────────────────────   │
│  Provider        │  Prompt Input (textarea)             │
│  Model           │  [Example Prompts dropdown]          │
│  API Key         │  ─────────────────────────────────   │
│  Privacy note    │  [JSON Schema Editor] ← JSON mode    │
│                  │  [Schema Templates dropdown]         │
│                  │  ─────────────────────────────────   │
│                  │  [Send] button                       │
│                  │  ─────────────────────────────────   │
│                  │  Response Panel                      │
│                  │  (Markdown or JSON w/ highlighting)  │
└──────────────────┴──────────────────────────────────────┘
```

---

## Example Prompts

| Category     | Prompt                                                      |
|--------------|-------------------------------------------------------------|
| Summarize    | "Summarize the history of machine learning in 3 paragraphs" |
| Explain      | "Explain transformer architecture to a high school student" |
| Creative     | "Write a haiku about neural networks"                       |
| Code         | "Write a Python function to compute Fibonacci numbers"      |
| Compare      | "Compare supervised vs unsupervised learning"               |

---

## JSON Schema Templates

### Person
```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "integer" },
    "occupation": { "type": "string" }
  },
  "required": ["name", "age", "occupation"]
}
```

### Product List
```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": { "type": "integer" },
      "name": { "type": "string" },
      "price": { "type": "number" }
    }
  }
}
```

### Sentiment Analysis
```json
{
  "type": "object",
  "properties": {
    "sentiment": { "type": "string", "enum": ["positive", "neutral", "negative"] },
    "confidence": { "type": "number" },
    "summary": { "type": "string" }
  }
}
```

---

## Error Handling

| Scenario            | Handling                                                          |
|---------------------|-------------------------------------------------------------------|
| No API key          | Inline error below key field before request fires                 |
| Invalid key (401)   | Red banner: "Invalid API key. Please check and re-enter."        |
| Rate limit (429)    | Orange banner: "Rate limit hit. Wait a moment and retry."        |
| Timeout / network   | Red banner: "Request timed out. Check your connection."          |
| JSON parse failure  | Yellow banner: "Model returned invalid JSON." + raw text shown   |
| CORS (Anthropic)    | Blue info banner explaining limitation; request not sent          |

---

## Stretch Extensions Implemented

- **Response metrics** — wall-clock time (ms) and character count displayed after each response
- **Prompt/schema library** — saved to `localStorage` under keys `switchboard_prompts` and `switchboard_schemas`
- **JSON schema validator** — validates response against the user-supplied schema using a lightweight runtime check
