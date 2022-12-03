import { App } from "@bigby/core"
import { clamp } from "@bigby/math"

export const TickerPlugin = (app: App) => {
  return app.onStart((app) => {
    let lastTime = performance.now()

    let running = true

    const animate = () => {
      if (running) requestAnimationFrame(animate)

      /* Calculate delta time */
      const time = performance.now()
      const dt = clamp((time - lastTime) / 1000, 0, 0.2)
      lastTime = time

      /* Update systems */
      app.systems.forEach((system) => system(dt))
    }

    animate()

    return () => {
      running = false
    }
  })
}
