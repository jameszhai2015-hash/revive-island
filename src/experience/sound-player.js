export default class SoundPlayer {
  constructor() {
    this.muted = false
    this.backgrounds = new Map()

    this.sources = {
      1989: 'sounds/1989.mp3',
      link: 'sounds/link.mp3',
      loop: 'sounds/loop.mp3',
      multiPop: 'sounds/multi-pop.mp3',
      sailing: 'sounds/sailing.mp3',
      seagulls: 'sounds/seagulls.mp3',
      success: 'sounds/success.mp3',
      swing: 'sounds/swing.mp3',
      waves: 'sounds/waves.mp3',
    }
  }

  setMuted(value) {
    this.muted = value
    return !this.muted
  }

  play(sound, times = 1) {
    const src = this.sources[sound]
    if (!src || this.muted) return

    let playCount = 0
    const playSound = () => {
      if (playCount >= times) return
      playCount++

      const audio = new Audio(src)
      audio.volume = 0.5
      audio.addEventListener('ended', playSound, { once: true })
      audio.play().catch(() => {})
    }

    playSound()
  }

  playBackground(sound, volume) {
    if (this.backgrounds.has(sound)) return

    const src = this.sources[sound]
    if (!src) return

    const audio = new Audio(src)
    audio.loop = true
    audio.volume = volume
    audio.play().catch(() => {})

    this.backgrounds.set(sound, { audio })
    return true
  }

  stopBackground(sound) {
    this.backgrounds.get(sound)?.audio.pause()
    this.backgrounds.delete(sound)
    return false
  }

  pauseBackground(sound) {
    this.backgrounds.get(sound)?.audio.pause()
  }

  resumeBackground(sound) {
    this.backgrounds.get(sound)?.audio.play().catch(() => {})
  }

  updateBackgoundVolume(sound, volume) {
    const background = this.backgrounds.get(sound)
    if (background) background.audio.volume = volume
  }
}
