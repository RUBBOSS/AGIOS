# Reproducible Profile Specifications

These JSON files capture the approved, non-secret profile state. They intentionally omit authentication material and private environment values.

- Compare these specifications against live profiles after Hermes upgrades.
- Apply changes with `hermes -p <profile> config set ...` and `hermes -p <profile> tools enable|disable ...`.
- Store API keys only through `hermes auth`; never add them here.
- `default` and `manager` alone retain `cronjob` and `delegation`.
- Browser automation, computer control, smart-home, media generation/analysis, TTS, Spotify, and X search are disabled for every listed profile on CLI and Telegram.
