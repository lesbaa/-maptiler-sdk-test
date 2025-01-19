import {
  ControlPosition,
  IControl,
} from "@maptiler/sdk";
import styles from "./ModelAttributionControl.module.css"

enum EAttributionModalVisibility {
  Hidden = 'hidden',
  Visible = 'visible',
}

export default class ModelAttributionControl implements IControl {
  private button?: HTMLElement;
  private attributionElement?: HTMLElement;
  private visibility: EAttributionModalVisibility = EAttributionModalVisibility.Hidden;
  private buttonContainer?: HTMLElement;

  onAdd(): HTMLElement {
    this.button = createButton();
    this.button.addEventListener('click', this.handleButtonClick);

    this.buttonContainer = document.createElement('div');
    this.buttonContainer.appendChild(this.button);
    this.buttonContainer.className = [
      // 'maplibregl-ctrl-top-left',
      'maplibregl-ctrl',
      'maplibregl-ctrl-attrib',
    ]
      .filter(Boolean)
      .join(' ');

    this.attributionElement = createAttributionElement();

    this.attributionElement.querySelector('#close-modal')
      ?.addEventListener('click', this.setModalHidden.bind(this));

    document.body.appendChild(this.attributionElement);

    return this.buttonContainer;
  }

  getDefaultPosition(): ControlPosition {
    return 'bottom-right';
  }

  onRemove(): void {
    this.button?.removeEventListener('click', this.handleButtonClick);
    this.buttonContainer?.parentNode?.removeChild(this.buttonContainer);
    this.attributionElement?.parentNode?.removeChild(this.attributionElement);
  }

  handleButtonClick = (): void => {
    if (this.visibility === 'hidden') {
      this.setModalVisible();
      return;
    }

    this.setModalHidden();
  }

  setModalVisible(): void {
    this.attributionElement?.classList.add(styles.visible);
    this.visibility = EAttributionModalVisibility.Visible;
  }

  setModalHidden(): void {
    this.attributionElement?.classList.remove(styles.visible);
    this.visibility = EAttributionModalVisibility.Hidden;
  }
}

function createAttributionElement(): HTMLElement {
  const attribution = document.createElement('div');

  attribution.className = styles.attributionContent

  // setting innerHTML is inefficient and can be a security risk
  // but we're only doing it once the source is trusted
  attribution.innerHTML = `
  <p>
    <div>This work is based on <a href="https://sketchfab.com/3d-models/rubber-duck-a84cecb600c04eeba60d02f99b8b154b" target="_blank">Rubber Duck</a> by <a target="_blank" href="https://sketchfab.com/emilsvfx">emilsvfx</a> licensed under <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank">CC-BY-4.0</a></div>
    <button id="close-modal" class="${styles.close}">Close</button>
  </p>
  `

  return attribution;
}

function createButton(): HTMLElement {
  const button = document.createElement('button');

  button.id = 'credit-toggle';

  button.className = [
    styles.ModelCreditControl,
  ]
    .filter(Boolean)
    .join(' ');

  button.innerHTML = 'Duck model by emilsvfx';

  return button;
} 