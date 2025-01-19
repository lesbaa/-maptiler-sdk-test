import {
  CustomLayerInterface,
  LngLat,
  Map,
} from "@maptiler/sdk"
import {
  AmbientLight,
  AxesHelper,
  Camera,
  DirectionalLight,
  Matrix4,
  Mesh,
  Object3D,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'
import { GLTFLoader } from "three/examples/jsm/Addons.js"
import { MODEL_ORIGIN_LNG_LAT } from "../consts"

interface IInit3DModelOptions {
  map: Map
}

export default function init3DModel({ map }: IInit3DModelOptions) {
  if (!map) {
    throw new Error('No map instance provided')
  }

  const duckModelConfig = createDuckModelConfig({ map })
  map.addLayer(duckModelConfig)
}

interface ICustomLayerInterfaceWithThreeJS extends CustomLayerInterface {
  // namespaced object to store Three.js objects
  three: {
    camera: Camera | null
    scene: Scene | null
    renderer: WebGLRenderer | null
    model: Mesh | Object3D | null
    temp: {
      // this is to avoid creating a new Vector3 instance every frame
      scale: Vector3
    }
  },
  modelAltitude: number,
  modelLngLat: LngLat,
  map: Map,
  setModelAltitude: () => void
}

/**
 * Creates a custom layer configuration object for a 3D model of a duck.
 *
 * @param {Map} map - The Mapbox GL map instance.
 * @param {boolean} [debug] - Whether to enable debug mode.
 *
 * @returns {ICustomLayerInterfaceWithThreeJS} A custom layer configuration object for a 3D model of a duck.
 * This is extended from the maplibre-gl CustomLayerInterface interface.
 * 
 * See https://maplibre.org/maplibre-gl-js/docs/API/interfaces/CustomLayerInterface/ for more information
 */
function createDuckModelConfig({ map, debug }: { map: Map, debug?: boolean }): ICustomLayerInterfaceWithThreeJS {
  return {
    id: 'duck',
    modelAltitude: 0,
    modelLngLat: MODEL_ORIGIN_LNG_LAT,
    three: {
      camera: null,
      scene: null,
      renderer: null,
      model: null,
      temp: {
        scale: new Vector3(130, 130, 130),
      }
    },
    map,
    type: 'custom',
    renderingMode: '3d',

    /**
     * Sets the altitude of the 3D model based on the terrain elevation at the model's longitude and latitude.
     */
    setModelAltitude() {
      const modelElevation = map.queryTerrainElevation(this.modelLngLat) ?? 0;
      this.modelAltitude = modelElevation
    },

    /**
     * Initializes and adds a 3D model to the map.
     *
     * @param {Map} map - The Mapbox GL map instance.
     * @param {WebGLRenderingContext} gl - The WebGL rendering context.
     *
     * This method sets up the Three.js scene, camera, lighting and renderer using the provided WebGL context and map canvas.
     * If debugging is enabled, an AxesHelper is added to the scene.
     * Finally, it loads a GLTF model from the specified path and adds it to the scene, rotating it by a quarter turn on the Y axis.
     *
     * @throws {Error} If the 3D model fails to load.
     */
    onAdd(map: Map, gl: WebGLRenderingContext) {
      this.map = map

      const camera = new Camera()
      const scene = new Scene()
      const renderer = new WebGLRenderer({
        context: gl,
        canvas: map.getCanvas(),
        antialias: true,
      })

      renderer.autoClear = false

      if (debug) {
        scene.add(new AxesHelper(60));
      }

      const ambientLight = new AmbientLight(0xffffff)
      scene.add(ambientLight)

      const directionalLight = new DirectionalLight(0xffffff, 0.75)
      directionalLight.position
        .set(4, 4, 4)
        .multiplyScalar(this.three.temp.scale.x)
      scene.add(directionalLight)

      this.three = {
        ...this.three,
        camera,
        scene,
        renderer,
      }

      new GLTFLoader()
        .setPath(`${import.meta.env.BASE_URL}/models/rubber_duck/`)
        .load(
          'scene.gltf',
          (object) => {
            object.scene.rotateY(Math.PI / 4)
            scene.add(object.scene)
          },
          () => { }, // we're not doing anything with the progress event
          (error) => {
            console.error('Failed to load 3D model', error)
          }
        )
    },

    /**
     * Disposes of the WebGL objects to free up memory when the 3D model is removed.
     */
    onRemove() {
      // dispose of the GL objects to free up memory
      if (this.three.scene) {
        this.three.scene.traverse(object => {
          if ("dispose" in object && typeof object.dispose === "function") {
            object.dispose()
            return
          }

          if (object instanceof Mesh) {
            object.geometry.dispose()
            object.material.dispose()
          }

          if (object instanceof AxesHelper) {
            object.geometry.dispose()
          }
        })
      }
    },

    /**
     * Renders the 3D model using Three.js., applying the matrix transformation from maplibre.
     *
     * @param _ - WebGl context, unused parameter.
     * @param defaultProjectionData - An object containing the default projection data.
     * @param defaultProjectionData.mainMatrix - The main projection matrix used for rendering.
     *
     * See here for more information:
     * https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/CustomRenderMethodInput/#projectionmatrix
     * 
     * This method checks if the Three.js scene, camera, and renderer are initialized.
     * If they are not, it logs an informational message and aborts the rendering process.
     * 
     * It retrieves the model matrix from the maplibre instance, multiplies it by the model scale
     * and sets the camera's projection matrix to the result. Transforming the model correctly in
     * map / world space (regardless of projection).
     * 
     * As this is render method is called every frame, it allows for additoinal logic to be added
     * eg, animations, user interactions, etc etc.
     */
    render(_, { defaultProjectionData }) {
      if (!this.three.scene || !this.three.camera || !this.three.renderer) {
        console.info('Three JS objects not initialized yet, aborting render')
        return
      }

      this.setModelAltitude()

      // this is where the magic happens...
      const modelMatrix = map.transform.getMatrixForModel(this.modelLngLat, this.modelAltitude);
      const m = new Matrix4().fromArray(defaultProjectionData.mainMatrix);
      const l = new Matrix4().fromArray(modelMatrix).scale(this.three.temp.scale);

      this.three.camera.projectionMatrix = m.multiply(l);
      this.three.renderer.resetState();
      this.three.renderer.render(this.three.scene, this.three.camera);
      this.map.triggerRepaint();
    }
  }
}