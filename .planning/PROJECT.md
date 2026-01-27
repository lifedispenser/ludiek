# Ludiek - Generator Plugin

## What This Is

A plugin for the Ludiek incremental game engine that implements generators—mechanics that produce outputs over time, optionally consuming inputs. Generators can be toggled on/off and normalize production rates to 1/second regardless of tick rate.

## Core Value

Users can define generators that produce resources continuously at configurable rates, scaling to any tick interval.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] GeneratorPlugin extends LudiekPlugin with tick(delta) method
- [ ] GeneratorDefinition with id, output, input, conditions
- [ ] GeneratorPluginState tracks isActive state per generator
- [ ] tick(delta) produces output at 1/second rate (delta-scaled)
- [ ] Active generators without inputs pause silently (stay active, no output)
- [ ] Inactive generators do nothing
- [ ] toggle(id) method flips active state
- [ ] setActive(id, boolean) method sets active state
- [ ] Toggle events emitted when state changes
- [ ] IsGeneratorActiveCondition for checking generator state
- [ ] Output rates modifiable via bonus system
- [ ] Tests covering all functionality
- [ ] Documentation updated

### Out of Scope

- Generator-specific UI or display logic — this is a game engine plugin, not a UI framework
- Complex production scheduling (e.g., multi-stage production pipelines)
- Generator-upgrade integration (though upgrades can modify generator bonuses)
- Offline progress calculation (engine-level concern)

## Context

Ludiek is a TypeScript-based game engine for incremental/idle games. It has an existing plugin architecture (upgrade, achievement, skill, currency, etc.) with:

- LudiekPlugin base class extending LudiekElement
- Input/Output/Condition system via engine registry
- Event system using strongly-typed-events
- Bonus/Modifier system for modifying values
- Feature system for tick-based updates via LudiekFeature.update(delta)

The GeneratorPlugin should follow existing patterns from plugins like UpgradePlugin, CurrencyPlugin, AchievementPlugin.

Existing tests demonstrate the expected behavior: plugins are instantiated, loadContent() is called with definitions, and methods are exercised with mocked engine dependencies where needed.

## Constraints

- **Type**: TypeScript — Engine is TypeScript, must maintain type safety
- **Architecture**: Follow existing plugin patterns — Use LudiekPlugin, LudiekElement, standard conventions
- **Testing**: Vitest — Project uses Vitest for testing
- **Code Style**: Match existing patterns — Follow patterns from UpgradePlugin, CurrencyPlugin, AchievementPlugin
- **Rate Normalization**: 1/second — All amounts are per-second, must scale by delta

## Key Decisions

| Decision                                  | Rationale                                                         | Outcome   |
| ----------------------------------------- | ----------------------------------------------------------------- | --------- |
| Plugin with tick() rather than Feature    | Simpler integration, user manually calls tick(delta) in game loop | — Pending |
| Pause on missing inputs vs auto-disable   | User explicitly toggles, engine shouldn't auto-disable state      | — Pending |
| Toggle events only (no production events) | Keep event surface minimal, reduce noise                          | — Pending |

---

_Last updated: 2025-01-27 after initialization_
