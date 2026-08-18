import Experience from '@experience'
import Loading from '@ui/loading'
import Debug from '@utils/debug'
import DoubleTapPreventer from '@utils/double-tap-preventer'
import Versioning from '@utils/versioning'

DoubleTapPreventer.init()
Versioning.init('1.3', () => {
  localStorage.removeItem('debug')
  localStorage.removeItem('settings')

  const currentState = localStorage.getItem('state')
  if (currentState) localStorage.setItem('state', btoa(currentState))
})

const loading = Loading.init()
const debug = Debug.init()
Experience.init('canvas.webgl', loading, debug)
