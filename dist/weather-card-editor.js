const fireEvent = (node, type, detail, options) => {
  options = options || {};
  detail = detail === null || detail === undefined ? {} : detail;
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};

if (
  !customElements.get("ha-switch") &&
  customElements.get("paper-toggle-button")
) {
  customElements.define("ha-switch", customElements.get("paper-toggle-button"));
}

const LitElement = Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

export class WeatherCardEditor extends LitElement {
  setConfig(config) {
    this._config = { ...config };
  }

  static get properties() {
    return { hass: {}, _config: {} };
  }

  get _entity() {
    return this._config.entity || "";
  }

  get _name() {
    return this._config.name || "";
  }

  get _icons() {
    return this._config.icons || "";
  }

  get _hide_humidity() {
    return this._config.hide_humidity || false;
  }

  get _hide_wind() {
    return this._config.hide_wind || false;
  }

  get _hide_pressure() {
    return this._config.hide_pressure || false;
  }

  get _hide_visibility() {
    return this._config.hide_visibility || false;
  }

  get _hide_sunset() {
    return this._config.hide_sunset || false;
  }

  get _hide_forecast() {
    return this._config.hide_forecast || false;
  }

  get _current() {
    return this._config.current !== false;
  }

  get _details() {
    return this._config.details !== false;
  }

  get _forecast() {
    return this._config.forecast !== false;
  }

  render() {
    if (!this.hass) {
      return html``;
    }

    const entities = Object.keys(this.hass.states).filter(
      eid => eid.substr(0, eid.indexOf(".")) === "weather"
    );

    return html`
      <div class="card-config">
        <div>
          <paper-input
            label="Name"
            .value="${this._name}"
            .configValue="${"name"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>
          <paper-input
            label="Icons location"
            .value="${this._icons}"
            .configValue="${"icons"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>
          ${
            customElements.get("ha-entity-picker")
              ? html`
                  <ha-entity-picker
                    .hass="${this.hass}"
                    .value="${this._entity}"
                    .configValue=${"entity"}
                    domain-filter="weather"
                    @change="${this._valueChanged}"
                    allow-custom-entity
                  ></ha-entity-picker>
                `
              : html`
                  <paper-input
                    label="Entity"
                    .value="${this._entity}"
                    .configValue="${"entity"}"
                    @value-changed="${this._valueChanged}"
                  ></paper-input>
                `
          }
          <h3>Hide attributes</h3>
          <div role="listbox">
            <paper-item>
              <paper-checkbox
                label="Humidity"
                .value="${this._hide_humidity}"
                .configValue="${"hide_humidity"}"
                @iron-change="${this._valueChanged}"
              >Humidity</paper-checkbox>
            </paper-item>
            <paper-item>
              <paper-checkbox
                label="Pressure"
                .value="${this._hide_pressure}"
                .configValue="${"hide_pressure"}"
                @iron-change="${this._valueChanged}"
              >Pressure</paper-checkbox>
            </paper-item>
            <paper-item>
              <paper-checkbox
                label="Sunset / sunrise"
                .value="${this._hide_sunset}"
                .configValue="${"hide_sunset"}"
                @iron-change="${this._valueChanged}"
              >Sunset / sunrise</paper-checkbox>
            </paper-item>
            <paper-item>
              <paper-checkbox
                label="Wind"
                .value="${this._hide_wind}"
                .configValue="${"hide_wind"}"
                @iron-change="${this._valueChanged}"
              >Wind</paper-checkbox>
              </paper-item>
            <paper-item>
            <paper-checkbox
                label="Visibility"
                .value="${this._hide_visibility}"
                .configValue="${"hide_visibility"}"
                @iron-change="${this._valueChanged}"
              >Visibility</paper-checkbox>
              </paper-item>
            <paper-item>
            <paper-checkbox
                label="Forecast"
                .value="${this._hide_forecast}"
                .configValue="${"hide_forecast"}"
                @iron-change="${this._valueChanged}"
              >Forecast</paper-checkbox>
            </paper-item>
          </div>
          ${customElements.get("ha-entity-picker")
            ? html`
                <ha-entity-picker
                  .hass="${this.hass}"
                  .value="${this._entity}"
                  .configValue=${"entity"}
                  domain-filter="weather"
                  @change="${this._valueChanged}"
                  allow-custom-entity
                ></ha-entity-picker>
              `
            : html`
                <paper-dropdown-menu
                  label="Entity"
                  @value-changed="${this._valueChanged}"
                  .configValue="${"entity"}"
                >
                  <paper-listbox
                    slot="dropdown-content"
                    .selected="${entities.indexOf(this._entity)}"
                  >
                    ${entities.map(entity => {
                      return html`
                        <paper-item>${entity}</paper-item>
                      `;
                    })}
                  </paper-listbox>
                </paper-dropdown-menu>
              `}
          <ha-switch
            .checked=${this._current}
            .configValue="${"current"}"
            @change="${this._valueChanged}"
            >Show current</ha-switch
          >
          <ha-switch
            .checked=${this._details}
            .configValue="${"details"}"
            @change="${this._valueChanged}"
            >Show details</ha-switch
          >
          <ha-switch
            .checked=${this._forecast}
            .configValue="${"forecast"}"
            @change="${this._valueChanged}"
            >Show forecast</ha-switch
          >
        </div>
      </div>
    `;
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) {
      return;
    }

    const target = ev.target;
    const newValue = target.checked || target.value;

    if (this[`_${target.configValue}`] === newValue) {
      return;
    }
    if (target.configValue) {
      if (newValue === "" || newValue == false) {
        delete this._config[target.configValue];
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: newValue
        };
      }
    }
    fireEvent(this, "config-changed", { config: this._config });
  }

  static get styles() {
    return css`
      ha-switch {
        padding-top: 16px;
      }
      .side-by-side {
        display: flex;
      }
      .side-by-side > * {
        flex: 1;
        padding-right: 4px;
      }
    `;
  }
}

customElements.define("weather-card-editor", WeatherCardEditor);
