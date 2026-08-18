import Experience from '@experience'
import { CanvasTexture, Group, SRGBColorSpace, Sprite, SpriteMaterial } from 'three'

export default class Clouds {
  constructor() {
    this.experience = Experience.instance
    this.scene = this.experience.scene
    this.time = this.experience.time

    this.textures = [0, 1, 2].map(variant => this.createTexture(variant))
    this.group = new Group()
    this.clouds = []

    this.createClouds()
    this.scene.add(this.group)
  }

  createTexture(variant) {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')

    context.clearRect(0, 0, size, size)

    const blob = (x, y, r) => {
      const gradient = context.createRadialGradient(x, y, 0, x, y, r)
      gradient.addColorStop(0, 'rgba(255,255,255,0.9)')
      gradient.addColorStop(0.6, 'rgba(255,255,255,0.55)')
      gradient.addColorStop(1, 'rgba(255,255,255,0)')
      context.fillStyle = gradient
      context.beginPath()
      context.arc(x, y, r, 0, Math.PI * 2)
      context.fill()
    }

    if (variant === 0) {
      blob(128, 150, 72)
      blob(96, 130, 52)
      blob(168, 128, 60)
      blob(128, 96, 44)
    } else if (variant === 1) {
      blob(120, 150, 60)
      blob(150, 130, 48)
      blob(104, 118, 44)
      blob(132, 96, 38)
    } else {
      blob(110, 150, 55)
      blob(156, 140, 52)
      blob(78, 138, 42)
      blob(132, 112, 44)
      blob(96, 104, 36)
      blob(160, 96, 32)
    }

    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    return texture
  }

  createClouds() {
    const count = 14

    for (let i = 0; i < count; i++) {
      const material = new SpriteMaterial({
        map: this.textures[i % this.textures.length],
        transparent: true,
        opacity: 0.45 + Math.random() * 0.4,
        depthWrite: false,
      })

      const sprite = new Sprite(material)
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6
      const radius = 5.5 + Math.random() * 4
      const width = 3.5 + Math.random() * 4

      sprite.position.set(
        Math.cos(angle) * radius,
        1.5 + Math.random() * 3,
        Math.sin(angle) * radius,
      )
      sprite.scale.set(width, width * 0.55, 1)

      this.group.add(sprite)
      this.clouds.push({
        sprite,
        baseY: sprite.position.y,
        phase: Math.random() * Math.PI * 2,
      })
    }
  }

  update() {
    this.group.rotation.y += this.time.delta * 0.025

    for (const cloud of this.clouds) {
      cloud.phase += this.time.delta * 0.4
      cloud.sprite.position.y = cloud.baseY + Math.sin(cloud.phase) * 0.4
    }
  }
}
