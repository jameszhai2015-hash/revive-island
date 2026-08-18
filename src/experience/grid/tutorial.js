import UI from '@ui/ui'
import Touch from '@utils/touch'

export default class Tutorial {
  constructor(grid) {
    this.grid = grid
    this.first()
  }

  first() {
    UI.tutorialText.set('点击河道方块开始').show()
    this.grid.riverBlocks.forEach(b => (b.material.uniforms.uTutorial.value = true))
  }

  second() {
    UI.tutorialText.set('旋转方块，让河流重新流过干涸的岛屿').show()
    this.grid.riverBlocks.forEach(b => (b.material.uniforms.uTutorial.value = false))
  }

  third() {
    UI.tutorialText.set('太棒了！驶向下一座岛屿！').show()
    this.grid.riverBlocks.forEach(b => (b.material.uniforms.uTutorial.value = false))
  }

  dispose() {
    UI.tutorialText.hide()
  }
}
