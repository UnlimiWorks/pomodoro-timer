var sessionTime, breakTime, remainingTime, timerFunction, timerWorking

// Phase specific variables
var timerPhases = ['work', 'break']
var currentPhase

$('#display').click(function () {
  if (remainingTime === undefined || remainingTime === null) {
    timerFunction = timerStart($('#session > span').text() * 60, $('#break > span').text() * 60)
  } else if (!timerWorking) {
    timerFunction = timerResume()
  } else {
    timerPause(timerFunction)
  }
})

$('#options button').click(function () {
  // Store and verify the integrity of the new value
  var newValue = eval($(this).parent().children('span').text() + $(this).text() + 1) * 60
  newValue = newValue < 60 ? 60 : newValue

  // If a session's length changed, update session's time variable
  if ($(this).parent().attr('id') === $('#session').attr('id')) {
    // if it's the current phase, update main display
    if (currentPhase === timerPhases[0] || currentPhase === undefined) {
      // if paused, reset timer
      if (remainingTime !== undefined) {
        remainingTime = newValue
      }
      displayTimerUpdate(newValue)
    }
    sessionTime = newValue
  } else {
    if (currentPhase === timerPhases[1] && remainingTime !== undefined) {
      remainingTime = newValue
      displayTimerUpdate(newValue)
    }
    breakTime = newValue
  }

  // Update options' display value
  optionsUpdate(this, newValue)
})

/* Utility functions */
/* Timer specific */
function timerUpdate () {
  this.remainingTime -= 1
  if (this.remainingTime < 0) {
    if (this.currentPhase === this.timerPhases[0]) {
      this.remainingTime = breakTime
    } else {
      this.remainingTime = sessionTime
    }
    this.currentPhase = this.timerPhases[(this.timerPhases.indexOf(this.currentPhase) + 1) % 2]

    // Update display, pause timer and play sound
    displayMessageUpdate(this.currentPhase)
    this.timerPause(this.timerFunction)
    var alarm = new Audio('http://www.freesound.org/data/previews/254/254819_4597795-lq.mp3')
    alarm.play()
  }

  // Update view
  this.displayTimerUpdate(this.remainingTime)
}

function timerStart (sessionTime, breakTime) {
  this.remainingTime = sessionTime = sessionTime
  breakTime = breakTime
  this.timerWorking = true
  optionsDisable(this.timerWorking)
  this.currentPhase = this.timerPhases[0]

  displayMessageUpdate(this.currentPhase)
  return setInterval(timerUpdate, 1000)
}

function timerPause (timerFunction) {
  this.timerWorking = false
  optionsDisable(this.timerWorking)

  clearInterval(timerFunction)
}

function timerResume () {
  this.timerWorking = true
  optionsDisable(this.timerWorking)
  $('.paused').css('visibility', 'hidden')

  return setInterval(timerUpdate, 1000)
}

/* View specific */
function optionsUpdate (button, seconds) {
  $(button).parent().children('span').text(seconds / 60)
}

function optionsDisable (state) {
  $('#options button').attr('disabled', state)
}

function displayTimerUpdate (seconds) {
  $('#display p').text(Math.floor(seconds / 60) + ':' + (seconds % 60 > 9 ? seconds % 60 : '0' + seconds % 60))
}

function displayMessageUpdate (phase) {
  $('#display h1').text(phase.charAt(0).toUpperCase() + phase.slice(1).toLowerCase() + ' Time')
}
