import { $, Attribute, compileShader, Input, Master, Vec3 } from "shader-composer"
import { createProgram, createShader } from "../helpers"

function MaterialRoot({ color = Vec3([1, 1, 1]) }: { color: Input<"vec3"> }) {
  return Master({
    vertex: {
      header: $`
        uniform mat4 modelMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;

        flat varying vec3 vNormal;

        attribute vec3 normal;
      `,
      body: $`
        vNormal = mat3(modelMatrix) * normal;

        gl_Position = projectionMatrix
          * viewMatrix
          * modelMatrix
          * ${Attribute("vec4", "position")};
      `,
    },
    fragment: {
      header: $`
        flat varying vec3 vNormal;

        out vec4 fragColor;
      `,
      body: $`
        float light = 0.0;

        /* Add ambient light */
        light += 0.1;

        /* Add directional light */
        light += max(dot(normalize(vNormal), normalize(vec3(1, 1, 1))), 0.0);
        
        fragColor = vec4(${color} * light, 1.0);
      `,
    },
  })
}

export class Material {
  program?: WebGLProgram
  shader: ReturnType<typeof compileShader>

  constructor(props: { color: Input<"vec3"> }) {
    this.shader = compileShader(MaterialRoot(props))
  }

  get isCompiled() {
    return this.program
  }

  compile(gl: WebGL2RenderingContext) {
    const vertexCheats = `#version 300 es
      precision mediump sampler2DArray;
			#define attribute in
			#define varying out
			#define texture2D texture
    `

    const fragmentCheats = `#version 300 es
      precision mediump sampler2DArray;
      #define varying in
      #define texture2D texture
      `

    /* Create our shaders */
    const vertex = createShader(
      gl,
      gl.VERTEX_SHADER,
      vertexCheats + this.shader[0].vertexShader
    )
    const fragment = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentCheats + this.shader[0].fragmentShader
    )

    /* Link them into a program */
    this.program = createProgram(gl, vertex, fragment)

    /* At this point, we no longer need the shaders */
    gl.deleteShader(vertex)
    gl.deleteShader(fragment)
  }

  updateUniforms(gl: WebGL2RenderingContext) {
    if (!this.program) return

    /* Update uniforms */
    this.shader[1].update(0.01, undefined!, undefined!, undefined!)

    for (const [name, uniform] of Object.entries(this.shader[0].uniforms!)) {
      const location = gl.getUniformLocation(this.program, name)
      if (location === null) throw new Error(`Uniform ${name} not found in program`)
      gl.uniform1f(location, (uniform as any).value)
    }
  }
}
