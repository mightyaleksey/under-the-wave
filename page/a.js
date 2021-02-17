import { createElement as e } from 'react'
import { render } from 'react-dom'

function App () {
  return e('span', null, 'hello')
}

render(e(App), document.querySelector('#container'))
