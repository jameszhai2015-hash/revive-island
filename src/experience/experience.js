import BlocksConfig from '@config/blocks'
import { default as GridConfig } from '@config/grid'
import LandscapeConfig from '@config/landscape'
import OceanConfig from '@config/ocean'
import State from '../state'
import Grid from '@grid/grid'
import Menu from '@ui/menu'
import Modal from '@ui/modal'
import UI from '@ui/ui'
import { AxesHelper, GridHelper, Scene } from 'three'
import Camera from './camera'
import Clouds from './clouds'
import Environment from './environment'
import Pointer from './pointer'
import Renderer from './renderer'
import Resources from './resources'
import Sizes from './sizes'
import SoundControls from './sound-controls'
import SoundPlayer from './sound-player'
import Time from './time'

export default class Experience {
  /** @type {Experience} */
  static instance

  static async init(canvasSelector, loading, debug) {
    return new Experience(document.querySelector(canvasSelector), loading, await debug)
  }

  constructor(canvas, loading, debug) {
    if (Experience.instance) return Experience.instance
    Experience.instance = this

    // Options
    this.canvas = canvas
    this.canvas.addEventListener('mousedown', () => this.canvas.classList.add('grabbing'))
    this.canvas.addEventListener('mouseup', () => this.canvas.classList.remove('grabbing'))

    this.loading = loading
    this.debug = debug
    this.settings = { isGraphicsQuality: true }

    BlocksConfig.init()
    GridConfig.init()
    LandscapeConfig.init()
    OceanConfig.init()

    // Setup
    this.time = new Time()
    this.sizes = new Sizes()
    this.resources = new Resources(loading)
    this.scene = new Scene()
    this.camera = new Camera()
    this.renderer = new Renderer()
    this.clouds = new Clouds()

    this.pointer = new Pointer()

    // Events
    this.sizes.addEventListener('resize', this.resize)
    this.time.addEventListener('tick', this.update)
    this.resources.addEventListener('ready', this.ready)

    document.addEventListener('keypress', e => {
      if (Modal.instance.content) return
      if (!this.grid || e.code !== 'Space') return
      this.grid.riverBlocks.find(b => b.material.uniforms.uHovered.value)?.onClick()
    })

    document.addEventListener('keydown', e => {
      if (Modal.instance.content) return
      if (!this.grid || e.code !== 'Escape' || UI.menuButton?.disabled) return
      if (this.paused) this.resumeGame()
      else this.pauseGame()
    })

    this.setDebug()
  }

  resize = () => {
    this.camera.resize()
    this.renderer.resize()
  }

  ready = () => {
    UI.init()

    this.level = 0
    this.loading.stop()

    this.soundPlayer = new SoundPlayer()
    this.environment = new Environment()
    this.menu = new Menu()
    this.soundControls = new SoundControls()

    UI.startButton.onClick(this.start.bind(this))
    UI.continueButton.onClick(this.resumeOrContinue.bind(this))
    UI.quitButton.onClick(this.quitGame.bind(this))
    UI.creditsButton.onClick(() => Modal.instance.open('#credits-modal.modal'))
    UI.menuButton.onClick(this.pauseGame.bind(this))
    UI.nextButton.onClick(this.nextLevel.bind(this))
    UI.backButton.onClick(this.setExplorationMode.bind(this))
    UI.timer.onTimeout = this.restartLevel.bind(this)

    if (State.instance.load()) UI.continueButton.enable()
    else UI.continueButton.disable(true)

    window.addEventListener('pagehide', () => {
      if (this.grid && this.level) this.save(true)
    })
  }

  async start() {
    this.setGridDebug()

    this.paused = false
    State.instance.clear()
    this.level = 0
    this.menu.close()
    await this.nextLevel()

    this.soundControls.show()
    if (this.soundControls.loop) this.soundPlayer.resumeBackground('loop')
    UI.menuButton.show()
    UI.levelText.show()
  }

  async continueGame() {
    this.setGridDebug()

    this.paused = false
    this.loaded = false
    this.level = 0
    this.menu.close()
    await this.nextLevel()

    this.soundControls.show()
    UI.menuButton.show()
    UI.levelText.show()
  }

  async resumeOrContinue() {
    if (this.grid) this.resumeGame()
    else await this.continueGame()
  }

  pauseGame() {
    if (!this.grid) return

    this.paused = true
    this.save(true)
    UI.timer.pause()
    UI.timer.hide()
    this.soundPlayer.pauseBackground('loop')
    UI.menuButton.hide()
    UI.levelText.hide()
    UI.continueButton.enable()
    this.menu.open({ quit: true })
  }

  resumeGame() {
    if (!this.paused) return

    this.paused = false
    this.menu.close()
    UI.menuButton.show()
    UI.levelText.show()
    if (!UI.timer.stopped) {
      UI.timer.show()
      UI.timer.resume()
    }
    this.soundPlayer.resumeBackground('loop')
  }

  quitGame() {
    this.paused = false
    this.openMenu()
  }

  async nextLevel() {
    const state = await this.load()
    const level = state ? state.level : this.level + 1
    const blocks = state?.blocks

    this.restoredTimeLeft = state ? (state.timeLeft ?? null) : null
    this.level = level
    UI.levelText.set(`第 ${this.level} 关`)

    this.levelParams = GridConfig.instance.generateLevel(this.level - 1)
    debug.log(`level ${this.level}: `, this.levelParams)
    this.grid?.dispose()
    this.grid = new Grid({ level, blocks, ...this.levelParams })
  }

  levelStart() {
    UI.nextButton.hide()
    this.setExplorationMode()
    UI.timer.start(this.restoredTimeLeft ?? UI.timer.duration)
    this.restoredTimeLeft = null
  }

  levelComplete() {
    this.soundPlayer.play('success')
    if (this.level) UI.nextButton.show({ wiggle: true })
    this.setExplorationMode()
    UI.timer.stop()
  }

  openMenu() {
    this.disposeGridDebug()

    this.save(true)
    UI.timer.stop()
    this.grid?.dispose()
    delete this.grid

    this.level--
    this.loaded = false

    this.soundControls.hide()
    UI.menuButton.hide()
    UI.levelText.hide()
    UI.tutorialText.hide()
    UI.backButton.hide()
    UI.nextButton.hide()

    this.camera.autoRotate = false
    this.paused = false
    if (State.instance.load()) UI.continueButton.enable()
    else UI.continueButton.disable(true)
    this.menu.open()
  }

  async restartLevel() {
    if (!this.level) return

    this.restoredTimeLeft = null
    this.grid?.dispose()
    this.levelParams = GridConfig.instance.generateLevel(this.level - 1)
    this.grid = new Grid({ level: this.level, blocks: undefined, ...this.levelParams })
  }

  setGameMode(block) {
    UI.backButton.show({ wiggle: true })

    this.camera.setGameControls(block)
    this.grid?.setShadows(false)
  }

  setExplorationMode() {
    UI.backButton.hide()
    this.camera.setExplorationControls(this.levelParams.radius)
    this.grid?.setShadows(true)
  }

  update = () => {
    if (this.paused) return

    this.camera.update()
    this.pointer.update()
    this.renderer.update()
    this.clouds?.update()

    this.grid?.update()
    UI.timer?.update(this.time.delta)
  }

  dispose() {
    this.pointer.dispose()
    this.grid?.dispose()
  }

  save(immediate = false) {
    if (!this.level) return

    const timestamp = Date.now()
    const blocks = this.grid?.serialize()
    const level = this.level
    const state = { timestamp, level, blocks, timeLeft: UI.timer.remaining }

    if (immediate) State.instance.saveNow(state)
    else State.instance.save(state)
  }

  async load() {
    if (this.loaded) return
    this.loaded = true

    return await State.instance.load()
  }

  setDebug() {
    if (!this.debug) return

    window.experience = Experience.instance

    const helpersSize = GridConfig.instance.maxRadius * 2 + 4
    const axesHelper = new AxesHelper(helpersSize)
    axesHelper.visible = false
    axesHelper.position.x = -helpersSize * 0.5
    axesHelper.position.y = 1.01
    axesHelper.position.z = -helpersSize * 0.5

    const gridHelper = new GridHelper(helpersSize, helpersSize * 2, 'gray', 'gray')
    gridHelper.visible = false
    gridHelper.position.y = 1

    this.scene.add(axesHelper, gridHelper)

    this.debug.root
      .addBinding(axesHelper, 'visible', { label: 'helpers', index: 4 })
      .on('change', event => {
        axesHelper.visible = event.value
        gridHelper.visible = event.value

        this.scene.backgroundIntensity = event.value ? 0 : 1
        this.environment.lightHelper.visible = event.value
        this.environment.shadowHelper.visible = event.value
        this.camera.controls.maxDistance = event.value ? 50 : 25
      })

    LandscapeConfig.instance.setDebug()
    OceanConfig.instance.setDebug()
  }

  setGridDebug() {
    if (!this.debug) return

    const folder = this.debug.root.addFolder({
      title: '⬢ grid',
      index: 5,
      expanded: false,
    })

    const generateParams = {
      radius: 1,
      coverage: 0.5,
      extraLinks: 0,
      minDeadEnds: 2,
      linksOnly: false,
    }

    folder
      .addBlade({
        view: 'list',
        label: 'strategy',
        options: [
          { text: 'DFS', value: 1 },
          { text: 'BFS', value: 2 },
          { text: "Prim's", value: 3 },
        ],
        value: 1,
      })
      .on('change', e => (GridConfig.instance.selectionStrategy = e.value))
    folder.addBinding(generateParams, 'radius', { min: 1, max: 10, step: 1 })
    folder.addBinding(generateParams, 'coverage', { min: 0.1, max: 1, step: 0.1 })
    folder.addBinding(generateParams, 'extraLinks', { min: 0, max: 1, step: 0.05 })
    folder.addBinding(generateParams, 'minDeadEnds', { min: 2, max: 10, step: 1 })
    folder.addBinding(generateParams, 'linksOnly')

    const onGenerateClick = () => {
      disableGridPanes()

      delete this.level
      this.levelParams = generateParams
      UI.levelText.set(`DEBUG`).show()

      this.grid?.dispose()
      this.grid = new Grid(generateParams)
    }

    const onSelectLevelChange = e => {
      if (isNaN(e.value)) return

      disableGridPanes()

      this.level = e.value - 1
      this.nextLevel()
    }

    const updateSelectLevelPane = level => {
      selectLevelPane.off('change', onSelectLevelChange)
      selectLevelPane.controller.value.setRawValue(level || 'debug')
      selectLevelPane.on('change', onSelectLevelChange)
    }

    const disableGridPanes = () => {
      selectLevelPane.disabled = true
      generatePane.disabled = true
      setTimeout(() => {
        selectLevelPane.disabled = false
        generatePane.disabled = false
      }, 2000)
    }

    const generatePane = folder.addButton({ title: 'generate' }).on('click', onGenerateClick)
    const selectLevelPane = folder
      .addBlade({
        view: 'text',
        label: 'select level',
        parse: v => +v,
        value: 0,
      })
      .on('change', onSelectLevelChange)

    this.generateParams = generateParams
    this.updateSelectLevelPane = updateSelectLevelPane
  }

  disposeGridDebug() {
    if (!this.debug) return
    this.debug.root.children.at(5).dispose()
  }
}
