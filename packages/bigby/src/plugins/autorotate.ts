import { App, Transform } from "@bigby/core"
import { quat, vec3 } from "gl-matrix"

export class AutoRotate {
  constructor(public velocity = vec3.create()) {}
}

export function AutorotatePlugin(app: App) {
  const entities = app.world.query([Transform, AutoRotate])

  app.addSystem((dt: number) => {
    entities.iterate((_, [transform, autorotate]) => {
      quat.rotateX(
        transform.quaternion,
        transform.quaternion,
        autorotate.velocity[0] * dt
      )
      quat.rotateY(
        transform.quaternion,
        transform.quaternion,
        autorotate.velocity[1] * dt
      )
      quat.rotateZ(
        transform.quaternion,
        transform.quaternion,
        autorotate.velocity[2] * dt
      )
    })
  })

  return app
}
