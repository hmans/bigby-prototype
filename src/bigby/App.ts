import { World } from "@miniplex/core"
import { Entity } from "./Entity"
import physics from "./systems/physics"
import rendering from "./systems/rendering"
import transforms from "./systems/transforms"

export class App {
  world: World<Entity>

  systems = new Array<(dt: number) => void>()

  constructor() {
    this.world = new World<Entity>()

    this.systems.push(
      physics(this.world),
      transforms(this.world),
      rendering(this.world)
    )

    /* Tick */
    let lastTime = performance.now()

    const animate = () => {
      requestAnimationFrame(animate)

      /* Calculate delta time */
      const time = performance.now()
      const dt = (time - lastTime) / 1000
      lastTime = time

      /* Update systems */
      this.systems.forEach((system) => system(dt))
    }

    animate()
  }

  addPlugin(plugin: (app: App) => void) {
    plugin(this)
  }

  addSystem(system: (world: World<Entity>) => (dt: number) => void) {
    this.systems.push(system(this.world))
  }
}
