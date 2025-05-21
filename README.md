# Garage Door Card

This repository contains a Home Assistant Lovelace card that renders a neon-themed garage door with slats.

## Configuration

Add the card in your Lovelace configuration:

```yaml
- type: custom:garagedoor-card
  entity: cover.garage_door
```

### Adjustable values

Several values near the top of `garagedoor-card.js` can be modified to fine-tune the layout. Among them is the new `#closedOffset` field which controls the extra translation applied to the slats when the door is fully closed. Increasing it shifts all slats downward at 0% and tapers the offset as the door opens.
