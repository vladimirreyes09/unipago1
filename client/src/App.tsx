import { useState } from 'react'
import './App.css'
import { TradeableForm } from './components/TradeableForm'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="">
        <div className="hero">
          <h1>Registro de activos trasables</h1>
        </div>
        <div>
          <TradeableForm />
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks">

      </div>

      <section id="next-steps">
        <div id="docs">
        </div>
        <div id="social">
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
