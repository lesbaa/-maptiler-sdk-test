import {
  ControlPosition,
  IControl,
  Map,
  ProjectionSpecification,
} from "@maptiler/sdk";
import styles from "./ProjectionToggleControl.module.css"

enum ProjectionTypeText {
  ToGlobe = 'Switch to Globe 🌐',
  ToMercator = 'Switch to Mercator 🗺️',
}

export default class ProjectionToggleControl implements IControl {
  private map?: Map;
  private button?: HTMLElement;

  onAdd(map: Map): HTMLElement {
    this.map = map;

    this.button = createButton({ projection: map.getProjection()?.type });
    this.button.addEventListener('click', this.handleButtonClick);

    return this.button;
  }

  getDefaultPosition(): ControlPosition {
    return 'top-left';
  }

  onRemove(): void {
    this.button?.removeEventListener('click', this.handleButtonClick);
    this.button?.parentNode?.removeChild(this.button);
    this.map = undefined;
  }

  handleButtonClick = (): void => {
    if (!this.map) return;

    const currentProjection = this.map.getProjection()?.type;

    if (currentProjection === 'globe') {
      this.switchToMercatorProjection();
      return
    }

    this.switchToGlobeProjection();
  }

  switchToGlobeProjection(): void {
    if (!this.map) return;
    this.map.enableGlobeProjection();

    if (!this.button) return;
    this.button.textContent = ProjectionTypeText.ToMercator;
  }

  switchToMercatorProjection(): void {
    if (!this.map) return;
    this.map.enableMercatorProjection();

    if (!this.button) return;
    this.button.textContent = ProjectionTypeText.ToGlobe;
  }
}

function createButton({ projection }: { projection: ProjectionSpecification['type'] }): HTMLElement {
  const button = document.createElement('button');

  button.textContent = projection === 'globe'
    ? ProjectionTypeText.ToMercator
    : ProjectionTypeText.ToGlobe;

  button.id = 'projection-toggle';

  button.className = [
    'maplibregl-ctrl-top-left',
    'maplibregl-ctrl',
    'maplibregl-ctrl-group',
    styles.ProjectionToggleControl,
  ]
    .filter(Boolean)
    .join(' ');

  return button;
} 