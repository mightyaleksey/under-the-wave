import * as React from 'react'
import { render } from 'react-dom'

function App () {
  const [counter, updateCounter] = React.useState(0)

  return (
    <div>
      <button onClick={() => updateCounter(counter + 1)}>Increment</button>
      <span>{counter}</span>
    </div>
  )
}

render(<App />, document.querySelector('#counter'))
