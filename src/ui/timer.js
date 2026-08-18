import Element from './element'

export default class Timer extends Element {
  constructor(selector, duration = 60) {
    super(selector)

    this.duration = duration
    this.remaining = duration
    this.running = false
    this.stopped = false
    this.onTimeout = null

    this.fill = this.element.querySelector('#timer-fill')
    this.seconds = this.element.querySelector('#timer-seconds')

    this.render()
  }

  start(seconds = this.duration) {
    this.remaining = seconds
    this.stopped = false
    this.running = true
    this.render()
    this.show()
  }

  stop() {
    this.stopped = true
    this.running = false
    this.hide()
  }

  pause() {
    this.running = false
  }

  resume() {
    if (this.remaining <= 0 || this.stopped) return

    this.running = true
    this.render()
  }

  update(delta) {
    if (!this.running) return

    this.remaining = Math.max(0, this.remaining - delta)
    this.render()

    if (this.remaining <= 0) {
      this.running = false
      this.onTimeout?.()
    }
  }

  render() {
    const percent = Math.max(0, Math.min(100, (this.remaining / this.duration) * 100))

    this.fill.style.width = `${percent}%`
    this.seconds.textContent = String(Math.ceil(this.remaining))
    this.element.classList.toggle('danger', this.remaining <= 10)
  }
}
