import './_debug.less'
import debugInfoHtmlString from './_debug.html'
import { max, RAD_TO_DEG } from '../math/scalar'

function appendDebugInfoHtmlToBody() {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = debugInfoHtmlString
  for (const node of Array.from(tempDiv.childNodes)) {
    document.body.appendChild(node)
  }
}

appendDebugInfoHtmlToBody()

const debugInfoCanvas = document.getElementById('debug-info-graph') as HTMLCanvasElement

const context = debugInfoCanvas.getContext('2d')

const GRAPH_SPACING = 3
const TEXT_HEIGHT = 17
const GRAPH_PANELS_COUNT = 3

const GRAPH_X = GRAPH_SPACING

const GRAPH_Y = TEXT_HEIGHT + 1
const GRAPH_WIDTH = 100
const GRAPH_HEIGHT = 45

const GRAPHS_DRAW_BG_COLORS = ['#013', '#021', '#012']
const GRAPHS_TEXT_BG_COLORS = ['#024', '#031', '#013']
const GRAPHS_DRAW_FG_COLORS = ['#0bf', '#0d7', '#07d']

const SCREEN_RESOLUTION_TEXT_Y = 15

const DEBUG_INFO_TIME_Y = (GRAPH_Y + GRAPH_HEIGHT) * GRAPH_PANELS_COUNT + GRAPH_SPACING + TEXT_HEIGHT + 5
const DEBUG_INFO_CAMERA_POS_Y = DEBUG_INFO_TIME_Y + TEXT_HEIGHT * 2 + GRAPH_SPACING
const DEBUG_INFO_CAMERA_DIR_Y = DEBUG_INFO_CAMERA_POS_Y + TEXT_HEIGHT * 4 + GRAPH_SPACING
const DEBUG_INFO_CAMERA_EULER_Y = DEBUG_INFO_CAMERA_DIR_Y + TEXT_HEIGHT * 4 + GRAPH_SPACING

const DEBUG_INFO_CANVAS_WIDTH = GRAPH_X + GRAPH_WIDTH + GRAPH_SPACING
const DEBUG_INFO_CANVAS_HEIGHT = DEBUG_INFO_CAMERA_EULER_Y + TEXT_HEIGHT * 3 + GRAPH_SPACING

const BIG_FONT = `14px courier,arial,helvetica`
const SMALL_FONT = `12px arial,helvetica`

debugInfoCanvas.width = DEBUG_INFO_CANVAS_WIDTH
debugInfoCanvas.height = DEBUG_INFO_CANVAS_HEIGHT
debugInfoCanvas.style.width = `${DEBUG_INFO_CANVAS_WIDTH}px`
debugInfoCanvas.style.height = `${DEBUG_INFO_CANVAS_HEIGHT}px`

function getGraphTranslation(index: number) {
  return index * (GRAPH_Y + GRAPH_HEIGHT) + SCREEN_RESOLUTION_TEXT_Y + 5
}

let GRAPH_TEXT_VALUE_X = 0

export function initGraphs() {
  context.fillStyle = '#000'
  context.fillRect(0, 0, DEBUG_INFO_CANVAS_WIDTH, DEBUG_INFO_CANVAS_HEIGHT)
  context.textBaseline = 'top'
  context.textAlign = 'left'
  context.font = BIG_FONT
  initGraph(0, 'FPS')
  initGraph(1, 'frame')
  initGraph(2, 'render')
  updateCanvasSize()

  context.fillStyle = '#202'
  context.fillRect(GRAPH_SPACING, DEBUG_INFO_TIME_Y, DEBUG_INFO_CANVAS_WIDTH - GRAPH_SPACING * 2, TEXT_HEIGHT * 2)
  context.fillStyle = '#aaf'
  context.textAlign = 'right'
  context.fillText('time', GRAPH_WIDTH, DEBUG_INFO_TIME_Y)

  context.fillStyle = '#012'
  context.fillRect(GRAPH_SPACING, DEBUG_INFO_CAMERA_POS_Y, DEBUG_INFO_CANVAS_WIDTH - GRAPH_SPACING * 2, TEXT_HEIGHT * 4)
  context.fillStyle = '#8ce'
  context.textAlign = 'right'
  context.fillText('camera pos', GRAPH_WIDTH, DEBUG_INFO_CAMERA_POS_Y)
  context.textAlign = 'left'
  context.fillText('x', GRAPH_SPACING, DEBUG_INFO_CAMERA_POS_Y + TEXT_HEIGHT)
  context.fillText('y', GRAPH_SPACING, DEBUG_INFO_CAMERA_POS_Y + TEXT_HEIGHT * 2)
  context.fillText('z', GRAPH_SPACING, DEBUG_INFO_CAMERA_POS_Y + TEXT_HEIGHT * 3)

  context.fillStyle = '#120'
  context.fillRect(
    GRAPH_SPACING,
    DEBUG_INFO_CAMERA_EULER_Y,
    DEBUG_INFO_CANVAS_WIDTH - GRAPH_SPACING * 2,
    TEXT_HEIGHT * 4
  )
  context.fillStyle = '#ec8'
  context.textAlign = 'right'
  context.fillText('camera rot', GRAPH_WIDTH, DEBUG_INFO_CAMERA_EULER_Y)
  context.textAlign = 'left'
  context.fillText('yaw', GRAPH_SPACING, DEBUG_INFO_CAMERA_EULER_Y + TEXT_HEIGHT)
  context.fillText('pitch', GRAPH_SPACING, DEBUG_INFO_CAMERA_EULER_Y + TEXT_HEIGHT * 2)

  context.fillStyle = '#021'
  context.fillRect(GRAPH_SPACING, DEBUG_INFO_CAMERA_DIR_Y, DEBUG_INFO_CANVAS_WIDTH - GRAPH_SPACING * 2, TEXT_HEIGHT * 4)
  context.fillStyle = '#8ec'
  context.textAlign = 'right'
  context.fillText('camera dir', GRAPH_WIDTH, DEBUG_INFO_CAMERA_DIR_Y)
  context.textAlign = 'left'
  context.fillText('x', GRAPH_SPACING, DEBUG_INFO_CAMERA_DIR_Y + TEXT_HEIGHT)
  context.fillText('y', GRAPH_SPACING, DEBUG_INFO_CAMERA_DIR_Y + TEXT_HEIGHT * 2)
  context.fillText('z', GRAPH_SPACING, DEBUG_INFO_CAMERA_DIR_Y + TEXT_HEIGHT * 3)
}

function initGraph(index: number, name: string) {
  const translation = getGraphTranslation(index)

  context.fillStyle = GRAPHS_DRAW_BG_COLORS[index]
  context.fillRect(GRAPH_X, GRAPH_SPACING + translation, GRAPH_WIDTH, GRAPH_Y - GRAPH_SPACING + GRAPH_HEIGHT)

  context.fillStyle = GRAPHS_TEXT_BG_COLORS[index]
  context.fillRect(GRAPH_X, GRAPH_SPACING + translation, GRAPH_WIDTH, GRAPH_Y - GRAPH_SPACING)

  context.globalAlpha = 0.7
  context.fillStyle = GRAPHS_DRAW_FG_COLORS[index]
  context.fillRect(GRAPH_X, GRAPH_Y - 2 + translation, GRAPH_WIDTH, 1)
  context.globalAlpha = 1
  context.font = SMALL_FONT
  context.fillText(name, GRAPH_X + 2, GRAPH_SPACING + translation + 1)
  GRAPH_TEXT_VALUE_X = max(GRAPH_TEXT_VALUE_X, 4 + context.measureText(name).width)
  context.font = BIG_FONT
}

export function updateGraph(index: number, maxValue: number, value: number, text: string) {
  const translation = getGraphTranslation(index)

  context.drawImage(
    debugInfoCanvas,
    GRAPH_X + 1,
    GRAPH_Y + translation,
    GRAPH_WIDTH - 1,
    GRAPH_HEIGHT,
    GRAPH_X,
    GRAPH_Y + translation,
    GRAPH_WIDTH - 1,
    GRAPH_HEIGHT
  )

  context.fillStyle = GRAPHS_DRAW_BG_COLORS[index]
  context.fillRect(GRAPH_X + GRAPH_WIDTH - 1, GRAPH_Y + translation, 1, GRAPH_HEIGHT)

  if (value > maxValue) {
    value = maxValue
  } else if (value < 0) {
    value = 0
  }
  const d = max(0, (1 - value / maxValue) * GRAPH_HEIGHT)

  context.fillStyle = GRAPHS_DRAW_FG_COLORS[index]
  context.fillRect(GRAPH_X + GRAPH_WIDTH - 1, GRAPH_Y + d + translation, 1, GRAPH_HEIGHT - d)

  context.fillStyle = GRAPHS_TEXT_BG_COLORS[index]
  context.fillRect(
    GRAPH_X + GRAPH_TEXT_VALUE_X,
    GRAPH_SPACING + translation,
    GRAPH_WIDTH - GRAPH_TEXT_VALUE_X,
    GRAPH_Y - GRAPH_SPACING - 2
  )
  context.fillStyle = GRAPHS_DRAW_FG_COLORS[index]
  context.textAlign = 'right'
  context.fillText(
    text,
    GRAPH_WIDTH + GRAPH_SPACING - 1,
    GRAPH_SPACING + translation,
    GRAPH_WIDTH - GRAPH_TEXT_VALUE_X - 2
  )
}

export function updateCanvasSize() {
  const canvas = document.getElementById('C') as HTMLCanvasElement
  context.fillStyle = '#005'
  context.fillRect(GRAPH_SPACING, GRAPH_SPACING, DEBUG_INFO_CANVAS_WIDTH - 2 * GRAPH_SPACING, TEXT_HEIGHT)
  context.fillStyle = '#aae'
  context.textAlign = 'center'
  context.fillText(`${canvas.width}⨯${canvas.height} px`, DEBUG_INFO_CANVAS_WIDTH / 2, 5, GRAPH_WIDTH)
}

export function updateGraphInfo(timeInSeconds?: number) {
  if (typeof timeInSeconds === 'number') {
    context.fillStyle = '#202'
    context.fillRect(GRAPH_SPACING, DEBUG_INFO_TIME_Y + TEXT_HEIGHT, GRAPH_WIDTH - GRAPH_SPACING, TEXT_HEIGHT)

    context.fillStyle = '#aaf'
    context.textAlign = 'right'

    context.fillText(timeInSeconds.toFixed(3), GRAPH_WIDTH, DEBUG_INFO_TIME_Y + TEXT_HEIGHT)
  }
}

export function updateCameraPosition(position: Readonly<Vec3>) {
  context.fillStyle = '#012'
  context.fillRect(
    GRAPH_SPACING + 8,
    DEBUG_INFO_CAMERA_POS_Y + TEXT_HEIGHT,
    GRAPH_WIDTH - GRAPH_SPACING - 8,
    TEXT_HEIGHT * 3
  )
  context.fillStyle = '#9ef'
  context.textAlign = 'right'
  context.fillText(position.x.toFixed(3), GRAPH_WIDTH, DEBUG_INFO_CAMERA_POS_Y + TEXT_HEIGHT)
  context.fillText(position.y.toFixed(3), GRAPH_WIDTH, DEBUG_INFO_CAMERA_POS_Y + TEXT_HEIGHT * 2)
  context.fillText(position.z.toFixed(3), GRAPH_WIDTH, DEBUG_INFO_CAMERA_POS_Y + TEXT_HEIGHT * 3)
}

export function updateCameraDirection(direction: Readonly<Vec3>) {
  context.fillStyle = '#021'
  context.fillRect(
    GRAPH_SPACING + 8,
    DEBUG_INFO_CAMERA_DIR_Y + TEXT_HEIGHT,
    GRAPH_WIDTH - GRAPH_SPACING - 8,
    TEXT_HEIGHT * 3
  )
  context.fillStyle = '#9fe'
  context.textAlign = 'right'
  context.fillText(direction.x.toFixed(4), GRAPH_WIDTH, DEBUG_INFO_CAMERA_DIR_Y + TEXT_HEIGHT)
  context.fillText(direction.y.toFixed(4), GRAPH_WIDTH, DEBUG_INFO_CAMERA_DIR_Y + TEXT_HEIGHT * 2)
  context.fillText(direction.z.toFixed(4), GRAPH_WIDTH, DEBUG_INFO_CAMERA_DIR_Y + TEXT_HEIGHT * 3)
}

export function updateCameraEulerAngles(eulerAngles: Readonly<Vec2>) {
  context.fillStyle = '#120'
  context.fillRect(
    GRAPH_SPACING + 7 * 6,
    DEBUG_INFO_CAMERA_EULER_Y + TEXT_HEIGHT,
    GRAPH_WIDTH - GRAPH_SPACING - 8,
    TEXT_HEIGHT * 2
  )
  context.fillStyle = '#ef9'
  context.textAlign = 'right'
  context.fillText((eulerAngles.x * RAD_TO_DEG).toFixed(1), GRAPH_WIDTH, DEBUG_INFO_CAMERA_EULER_Y + TEXT_HEIGHT)
  context.fillText((eulerAngles.y * RAD_TO_DEG).toFixed(1), GRAPH_WIDTH, DEBUG_INFO_CAMERA_EULER_Y + TEXT_HEIGHT * 2)
}

initGraphs()

window.addEventListener('resize', updateCanvasSize)