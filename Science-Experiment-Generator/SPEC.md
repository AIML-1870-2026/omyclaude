# Science Experiment Generator

## Purpose
A dynamic single-page web app that generates grade-appropriate science experiments based on available materials, powered by OpenAI GPT-4o.

## Features
- Grade level selector: K-2, 3-5, 6-8, 9-12
- Free-text supplies input
- Household supply preset buttons
- OpenAI API integration (browser-side fetch)
- .env file upload for API key loading
- Markdown-to-HTML rendering of experiment output
- Experiment history (last 5 experiments, collapsible)
- Printable observation worksheet
- Difficulty rating display

## Tech Stack
- Vanilla HTML/CSS/JS (single index.html)
- marked.js (CDN) for markdown rendering
- OpenAI `/v1/chat/completions` endpoint
- No backend — browser-only

## Deployment
- GitHub Pages: https://aiml-1870-2026.github.io/omyclaude/Science-Experiment-Generator/
