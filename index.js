function App() {
  const [breakLength, setBreakLength] = React.useState(5 * 60)
  const [session, setSession] = React.useState(25 * 60)
  const [displayTime, setDisplayTime] = React.useState(25 * 60)
  const [timerOn, setTimerOn] = React.useState(false)
  const [onBreak, setOnbreak] = React.useState(false)
  const [breakAudio, setBreakAudio] = React.useState(new Audio("./bell.mp3"))

  const playBreak = () => {
    breakAudio.currentTime = 0
    breakAudio.play()
  }

  // Handle seconds to minute:seconds using basic division and modulo
  const format = (seconds) => {
    let minutes = Math.floor(seconds / 60)
    let second = seconds % 60
    return (
      // Also handle less than 10, ex: so that it's 08:00 instead of 8:00
      (minutes < 10 ? "0" + minutes : minutes) +
      ":" +
      (second < 10 ? "0" + second : second)
    )
  }

  const handlePlay = () => {
    let second = 1000 // 1000ms = 1 second
    let date = new Date().getTime() // get date in seconds
    let nextDate = new Date().getTime() + second // date + 1 sec
    let onBreakVariable = onBreak
    if (!timerOn) {
      let interval = setInterval(() => {
        date = new Date().getTime()
        // If current date surpassed one second
        if (date > nextDate) {
          setDisplayTime((prev) => {
            if (prev <= 0 && !onBreakVariable) {
              // If time is 0 and !break then do break
              playBreak()
              onBreakVariable = true
              setOnbreak(true)
              return breakLength
            } else if (prev <= 0 && onBreakVariable) {
              // If time is 0 and break then back to session time
              playBreak()
              onBreakVariable = false
              setOnbreak(false)
              return session
            }
            return prev - 1 // Update to displaytime-1
          })
          nextDate += second // Then nextdate + 1 second so it continues
        }
      }, 30)
      // Clear unused localStorage if any
      localStorage.clear()
      // Save the interval, that 30ms one.
      localStorage.setItem("interval-id", interval)
    }
    if (timerOn) {
      // If it's on and clicked, then clear the interval
      // Which make the timer paused. because there's no interval
      clearInterval(localStorage.getItem("interval-id"))
    }
    // Toggle between play and pause
    setTimerOn(!timerOn)
  }

  const handleReset = () => {
    breakAudio.pause()
    breakAudio.currentTime = 0
    setOnbreak(false)
    setSession(25 * 60)
    setBreakLength(5 * 60)
    setDisplayTime(25 * 60)
  }

  // Function to increase / decrease break length / session length
  const changeTime = (amount, type) => {
    // Handle time changes and validating so the value is never below 1:00
    if (type === "break" && (breakLength > 60 || amount > 0) && breakLength+amount < (60*60)+1)
      setBreakLength((prev) => prev + amount)
    else if (type === "session" && (session > 60 || amount > 0)) {
      setSession((prev) => prev + amount)
      if (!timerOn) {
        setDisplayTime(session + amount)
      }
    }
  }

  return (
    <main>
      <div class="title">
      <h1>Pomodoro.</h1>
      </div>
      <div class="change">
        {/* React functional component in action :) */}
        <Length
          title={"Break Length"}
          length={breakLength}
          changeTime={changeTime} // Need to pass the function inside this app into the child component.
          type={"break"}
          format={format} // If you don't pass the function, it will be undefined in the child component.
        />
        <Length
          title={"Session Length"}
          length={session}
          changeTime={changeTime}
          type={"session"}
          format={format}
        />
      </div>
      {/* The Pomodoro timer itself */}
      <div class="timer">
        <h1 class="countdown" id="time-left">{format(displayTime)}</h1>
        <p id="timer-label">{onBreak ? "Break" : timerOn ? "Session" : "Idle"}</p>
        <div class="control">
          <i
            class={timerOn ? "fas fa-pause" : "fas fa-play"}
            onClick={handlePlay} id="start_stop"
          ></i>
          <i class="fa fa-sync" id="reset" onClick={handleReset}></i>
        </div>
      </div>

      {/* Footer */}
      <a class="name" href="https://github.com/abdulrcs" target="_blank">
        <i class="fab fa-github"></i>abdulrcs
      </a>
    </main>
  )
}

// Functional component for break length and session length
function Length({ title, length, changeTime, type, format }) {
  return (
    <div class="break">
      <h2 id={type == "break" ? "break-label" : "session-label"}>{title}</h2>
      <h2 id={type == "break" ? "break-length" : "session-length"}>
        <i class="fa fa-arrow-up" id={type == "break" ? "break-increment" : "session-increment"} onClick={() => changeTime(60, type)}></i>
        {length/60}
        <i class="fa fa-arrow-down" id={type == "break" ? "break-decrement" : "session-decrement"} onClick={() => changeTime(-60, type)}></i>
      </h2>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
