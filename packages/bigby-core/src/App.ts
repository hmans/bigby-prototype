import { World } from "@bigby/ecs"
import { Plugin, StartupSystem, System, SystemStopCallback } from "./types"

export type BaseEntity = {}

type Initializer = () => Promise<void>

export class App extends World {
  systems = new Array<System>()
  initializers = new Array<Initializer>()
  startupSystems = new Array<StartupSystem>()
  stopCallbacks = new Array<SystemStopCallback>()

  constructor() {
    console.log("🐝 Bigby Initializing")
    super()
  }

  use(plugin: Plugin): App {
    return plugin(this as any)
  }

  addSystem(system: System) {
    this.systems.push(system)
    return this
  }

  onStart(system: StartupSystem) {
    this.startupSystems.push(system)
    return this
  }

  addInitializer(system: Initializer) {
    this.initializers.push(system)
    return this
  }

  start() {
    console.log("✅ Starting App")

    /* Execute and wait for initializers to complete */
    Promise.all(this.initializers.map((system) => system())).then(() => {
      /* Execute startup systems */
      this.stopCallbacks = []
      this.startupSystems.forEach((system) => {
        const callback = system(this)
        if (callback) this.stopCallbacks.push(callback)
      })
    })

    return this
  }

  stop() {
    console.log("⛔ Stopping App")
    this.stopCallbacks.forEach((callback) => callback())
  }
}
