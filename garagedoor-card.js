/* garagedoor-card.js – neon garage door with 5‑slat overlay (constant gaps) & position readout (v6)
 * Lovelace usage:
 *   type: custom:garagedoor-card
 *   entity: cover.garage_door
 */
import { LitElement, html, css } from "https://unpkg.com/lit@3.1.4/index.js?module";

class GaragedoorCard extends LitElement {
  static properties = { hass: {}, _config: {}, _sliderOpen: { state: true } };

  /* —— Configurable gap values (px, based on 256‑px canvas) —— */
  #sideGap = 8;   // dark gap to left & right of slats
  #topGap  = 3;   // dark strip above slats at every position
  #bottomGap = 0; // dark strip below slats (was tied to topGap)
  #closedOffset = 0; // slat offset when closed (tapered as door opens)
  #openLeft = 43; // opening left offset inside 256‑px canvas
  #openTop  = 117; // opening top offset
  #openWidth = 170;
  #openHeight = 96;

  /* —— Neon styling ——————————————— */
  static styles = css`
    :host { display: block; }

    ha-card {
      position: relative;
      padding: 12px;
      background: radial-gradient(circle at center, #0f0f0f 0%, #000 100%);
      border: 4px solid var(--garagedoor-glow, #00bfff);
      border-radius: 20px;
      box-shadow: 0 0 6px var(--garagedoor-glow, #00bfff), inset 0 0 6px var(--garagedoor-glow, #00bfff);
      display: flex;
      flex-direction: column;
      align-items: center;
      color: var(--garagedoor-glow, #00bfff);
      text-align: center;
    }

    /* Position readout */
    .readout {
      position: absolute;
      top: 8px;
      right: 12px;
      font: 600 14px/1 "Roboto", sans-serif;
      color: var(--garagedoor-glow, #00bfff);
      text-shadow: 0 0 4px var(--garagedoor-glow, #00bfff);
    }

    .icon-wrapper { position: relative; margin-bottom: 12px; width: 256px; height: 256px; }

    .lightbulb {
      position: absolute;
      top: 22px;
      right: 22px;
      --mdc-icon-size: 60px;
      color: var(--garagedoor-glow, #00bfff);
      cursor: pointer;
      transition: color 0.2s ease-in-out, filter 0.2s ease-in-out;
    }

    .lightbulb.on {
      color: #ffd700;
      filter: drop-shadow(0 0 6px #ffd700);
    }

    .obstruction {
      position: absolute;
      bottom: 22px;
      left: 50%;
      transform: translateX(-50%);
      --mdc-icon-size: 60px;
      color: #ff3333;
      filter: drop-shadow(0 0 6px #ff3333);
    }

    .door-svg { width: 256px; height: 256px; }
    .door-svg path { fill: var(--garagedoor-glow, #00bfff); stroke: none; }

    /* Slat container – side, top & bottom gaps preserved */
    .slats {
      position: absolute;
      overflow: hidden;
      pointer-events: auto;
    }

    .slat-wrapper {
      position: relative;
    }

    .slat {
      width: 100%;
      height: 16px;
      background: var(--garagedoor-glow, #00bfff);
      margin: 3px 0;
      border-radius: 1px;
      box-shadow: 0 0 4px var(--garagedoor-glow, #00bfff);
    }

    .slat:last-child {
      margin-bottom: 1px;
    }

    .actions { width: 100%; display: flex; gap: 24px; justify-content: center; }
    .action-btn { flex: 1 1 0; background: transparent; border: 2px solid var(--garagedoor-glow, #00bfff); border-radius: 12px; padding: 6px 0 4px 0; font: 600 18px/1.2 "Roboto", sans-serif; color: var(--garagedoor-glow, #00bfff); text-transform: uppercase; cursor: pointer; box-shadow: 0 0 5px var(--garagedoor-glow, #00bfff), inset 0 0 8px #000; display: flex; flex-direction: column; align-items: center; transition: background 0.2s ease-in-out, box-shadow 0.2s ease-in-out; }
    .action-btn ha-icon { --mdc-icon-size: 26px; margin-bottom: 4px; }
    .action-btn:hover { background: rgba(0,191,255,0.08); }
    .action-btn:active { background: rgba(0,191,255,0.15); }

    .slider-container {
      position: absolute;
      bottom: 64px;
      left: 12px;
      right: 12px;
      padding: 8px;
      background: rgba(0, 0, 0, 0.75);
      border-radius: 12px;
      box-shadow: 0 0 6px var(--garagedoor-glow, #00bfff);
    }

    .slider-container input {
      width: 100%;
    }
  `;

  /* —— Setup —— */
  setConfig(cfg) { if (!cfg.entity) throw new Error("You must specify an entity."); this._config = cfg; }
  get hass() { return this._hass; }
  set hass(v) { this._hass = v; this.requestUpdate(); }
  constructor() {
    super();
    this._sliderOpen = false;
  }
  _stateObj() { return this.hass?.states?.[this._config.entity]; }
  _call(svc) { this.hass.callService("cover", svc, { entity_id: this._config.entity }); }

  _lightObj() { return this._config.light_entity ? this.hass?.states?.[this._config.light_entity] : null; }
  _obstructionObj() { return this._config.obstruction_entity ? this.hass?.states?.[this._config.obstruction_entity] : null; }
  _toggleLight() {
    const ls = this._lightObj();
    if (!ls) return;
    this.hass.callService("light", ls.state === "on" ? "turn_off" : "turn_on", {
      entity_id: this._config.light_entity,
    });
  }

  _toggleSlider() {
    this._sliderOpen = !this._sliderOpen;
  }

  _showMoreInfo() {
    this.dispatchEvent(
      new CustomEvent('hass-more-info', {
        bubbles: true,
        composed: true,
        detail: { entityId: this._config.entity },
      })
    );
  }

  _setPosition(ev) {
    const pos = Number(ev.target.value);
    if (!Number.isNaN(pos)) {
      this.hass.callService("cover", "set_cover_position", {
        entity_id: this._config.entity,
        position: pos,
      });
    }
    this._sliderOpen = false;
  }

  /* —— Render —— */
  render() {
    const st = this._stateObj();
    if (!st) return html`<ha-card>Entity not found</ha-card>`;
    const pos = st.attributes.current_position ?? (st.state === "open" ? 100 : 0);
    const light = this._lightObj();
    const obstruction = this._obstructionObj();
    return html`
      <ha-card>
        <span class="readout">${pos}%</span>
        <div class="icon-wrapper">
          ${this._houseSvg()}
          ${this._slats(pos)}
          ${this._sliderOpen
            ? html`<div class="slider-container"><input type="range" min="0" max="100" .value=${pos} @change=${(e) => this._setPosition(e)}></div>`
            : ''}
          ${light ? html`<ha-icon
              class="lightbulb ${light.state === 'on' ? 'on' : ''}"
              icon="${light.state === 'on' ? 'mdi:lightbulb' : 'mdi:lightbulb-outline'}"
              @click=${() => this._toggleLight()}
            ></ha-icon>` : ''}
          ${obstruction?.state === 'on'
            ? html`<ha-icon class="obstruction" icon="mdi:alert-octagon"></ha-icon>`
            : ''}
        </div>
        <div class="actions">
          <button class="action-btn" @click=${() => this._call("close_cover")}
            ><ha-icon icon="mdi:arrow-down-bold"></ha-icon><span>Close</span></button>
          <button class="action-btn" @click=${() => this._call("open_cover")}
            ><ha-icon icon="mdi:arrow-up-bold"></ha-icon><span>Open</span></button>
        </div>
      </ha-card>`;
  }

  /* —— Templates —— */
  _houseSvg() {
    return html`<svg viewBox="0 0 24 24" class="door-svg" aria-hidden="true"><path d="M22 9V20H20V11H4V20H2V9L12 5L22 9"/></svg>`;
  }

  _slats(pos) {

    const containerWidth  = this.#openWidth  - 2 * this.#sideGap;   // 170 - side gaps
    const containerHeight = this.#openHeight - this.#topGap - this.#bottomGap;   // 96 - top & bottom gaps

    const offset = this.#closedOffset * (1 - pos / 100); // taper offset as it opens
    const translate = offset - (pos / 100) * containerHeight; // move slats together

    return html`<div
        class="slats"
        @dblclick=${() => this._showMoreInfo()}
        style="left:${this.#openLeft + this.#sideGap}px; top:${this.#openTop + this.#topGap}px; width:${containerWidth}px; height:${containerHeight}px;">
      <div class="slat-wrapper" style="transform: translateY(${translate}px);">
        ${Array.from({ length: 5 }).map(() => html`<div class="slat"></div>`)}
      </div>
    </div>`;
  }

  getCardSize() { return 4; }
}

customElements.define("garagedoor-card", GaragedoorCard);
