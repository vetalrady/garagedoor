/* garagedoor-card.js
 * A minimal custom card for Home Assistant that controls a garage door (any Cover entity)
 * Drop this file under your `www` folder and add it as a resource.
 */
import { LitElement, html, css } from "https://unpkg.com/lit@3.1.4/index.js?module";

class GaragedoorCard extends LitElement {
  static properties = {
    hass: {},
    _config: {},
  };

  static styles = css`
    :host {
      display: block;
    }
    ha-card {
      padding: 16px;
      border-radius: 12px;
    }
    h2 {
      margin: 0 0 12px 0;
      font-size: 20px;
    }
    button {
      margin-right: 8px;
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      cursor: pointer;
    }
  `;

  setConfig(config) {
    if (!config.entity) throw new Error("You must specify an entity.");
    this._config = config;
  }

  get hass() {
    return this._hass;
  }
  set hass(value) {
    this._hass = value;
    this.requestUpdate();
  }

  _stateObj() {
    return this.hass && this.hass.states[this._config.entity];
  }

  _call(service) {
    this.hass.callService("cover", service, { entity_id: this._config.entity });
  }

  render() {
    const stateObj = this._stateObj();
    if (!stateObj) return html`<ha-card>Entity not found</ha-card>`;

    const position = stateObj.attributes.current_position;
    return html`
      <ha-card>
        <h2>${stateObj.attributes.friendly_name || this._config.entity}</h2>
        ${position !== undefined
          ? html`<p>Position: ${position}%</p>`
          : html`<p>State: ${stateObj.state}</p>`}
        <div>
          <button @click=${() => this._call("open_cover")}>Open</button>
          <button @click=${() => this._call("close_cover")}>Close</button>
          <button @click=${() => this._call("stop_cover")}>Stop</button>
        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    return 3;
  }
}

customElements.define("garagedoor-card", GaragedoorCard);

