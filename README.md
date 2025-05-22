# Garage Door Card

This repository contains a Home Assistant Lovelace card that renders a neon-themed garage door with slats.

## Configuration

Add the card in your Lovelace configuration:

```yaml
- type: custom:garagedoor-card
  entity: cover.garage_door
  light_entity: light.garage_light  # optional
  obstruction_entity: binary_sensor.garage_obstruction  # optional
```

If `light_entity` is provided, a light bulb icon appears on the roof. Clicking
the icon toggles the specified light and the icon glows when the light is on.

If `obstruction_entity` is provided and its state is `on`, a glowing
`mdi:alert-octagon` icon appears at the bottom of the door to indicate an
obstruction.

Double tapping on the door slats now opens Home Assistant's **More Info**
dialog for the configured garage door entity. Previously this action opened a
slider overlay for selecting a specific position.

### Adjustable values

Several values near the top of `garagedoor-card.js` can be modified to fine-tune the layout. Among them is the new `#closedOffset` field which controls the extra translation applied to the slats when the door is fully closed. Increasing it shifts all slats downward at 0% and tapers the offset as the door opens.
