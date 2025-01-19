import { initMap } from './map'
import './global.css'
import { init3DModel } from './3DModel'

async function main() {
  try {
    const map = await initMap()
    init3DModel({ map })
  } catch (error) {
    // Ordinarily we would handle this better for the user.
    // However, for the sake of this example, we'll just log the error
    console.error(error)
  }
}

main()