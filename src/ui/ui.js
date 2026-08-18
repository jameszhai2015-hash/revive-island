import Button from './button'
import Text from './text'
import Timer from './timer'
import Toggle from './toggle'

export default class UI {
  static startButton = null
  static continueButton = null
  static creditsButton = null
  static quitButton = null

  static backButton = null
  static nextButton = null

  static menuButton = null
  static soundsToggle = null
  static loopToggle = null
  static ambienceToggle = null

  static levelText = null
  static tutorialText = null
  static timer = null

  static init() {
    UI.startButton = new Button('#start')
    UI.continueButton = new Button('#continue')
    UI.creditsButton = new Button('#credits')
    UI.quitButton = new Button('#quit')

    UI.backButton = new Button('#back')
    UI.nextButton = new Button('#next')

    UI.menuButton = new Button('#menu')
    UI.soundsToggle = new Toggle('#sounds')
    UI.loopToggle = new Toggle('#loop')
    UI.ambienceToggle = new Toggle('#ambience')

    UI.levelText = new Text('#level')
    UI.tutorialText = new Text('#tutorial')
    UI.timer = new Timer('#timer')
  }
}
