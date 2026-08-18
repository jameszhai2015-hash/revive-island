import debounce from '@utils/debounce'

export default class State {
  static #key = 'state'
  static instance = new State()

  clear() {
    localStorage.removeItem(State.#key)
  }

  #save(state) {
    localStorage.setItem(State.#key, btoa(JSON.stringify(state)))
  }

  save = debounce(this.#save.bind(this), 1000)
  saveNow = this.#save.bind(this)
  load = this.#loadLocal.bind(this)

  #loadLocal() {
    const state = localStorage.getItem(State.#key)
    if (!state) return

    try {
      return JSON.parse(atob(state))
    } catch {
      // Fallback for the previous plain-JSON save format; clear on both failures
      try {
        return JSON.parse(state)
      } catch {
        this.clear()
      }
    }
  }
}
