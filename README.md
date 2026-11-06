# Battle Drones - AI Decision Model Arena

[![Made with pollinations.ai](https://raw.githubusercontent.com/pollinations/pollinations/main/packages/ui/src/brand/badge-made-with.svg)](https://pollinations.ai/?ref=badge)

**Battle Drones** is an AI combat arena inspired by Simon Willison's [Battle Drones](https://simonwillison.net/2026/Oct/20/battledrones/) and Opper's [decision model benchmarks](https://opper.ai/decision-benchmarks). Lightweight, specialized decision models (such as Jev and Decider) compete by selecting discrete tactical actions and producing calibrated probability distributions.

Built for the **Pollinations Quest #19176: [QUEST] A game that AI models play**.

## Features

- **Decision Model Integration**: Direct integration with Pollinations typed decisions (`POST /alpha/decisions`).
- **Telemetry Visualizer**: Real-time display of decision probabilities for each drone.
- **Combat Simulation**: Dynamic laser attacks, shield barriers, flanking thrusts, and EMP pulses.
- **Zero-Pollen Guarantee**: Includes local decision tree Monte Carlo simulation (0 Pollen spent) alongside `<polli-connect>` Bring Your Own Pollen (BYOP) integration for live Pollinations decision models.

## Live Demo

- **Live App**: https://brutus88ai.github.io/polli-decision-arena/
- **Repository**: https://github.com/Brutus88Ai/polli-decision-arena

## License

MIT
