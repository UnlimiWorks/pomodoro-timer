'use strict'

var pomodoroTimer = (function IIFE () {
  var $variables = {}
  var timer = {work : {}, rest : {}}

  function updatePhaseDuration (JQueryTarget, minutes) {
    JQueryTarget.text(minutes)
  }

  function togglePhaseControls () {
    $variables.workControls.attr('disabled', !$variables.workControls.attr('disabled'))
    $variables.restControls.attr('disabled', !$variables.restControls.attr('disabled'))
  }

  function updateDisplayedTime (minutes) {
    var display = minutes * 60 || timer.remainingTime

    $variables.timeDisplay.text(Math.floor(display / 60) + ':' +
      (display % 60 > 9 ? display % 60 : '0' + display % 60))
  }

  function updateDisplayedPhase () {
    $variables.phaseDisplay.text(timer.currentPhase.charAt(0).toUpperCase() + timer.currentPhase.slice(1).toLowerCase() + ' Session')
  }

  function haltTimer () {
    timer.working = false
    clearInterval(timer.loopingFunction)

    togglePhaseControls()
  }

  function resumeTimer () {
    timer.working = true

    togglePhaseControls()
    return setInterval(updateTimer, 1000)
  }

  function updateTimer () {
    timer.remainingTime -= 1
    if (timer.remainingTime < 0) {
      if (timer.currentPhase === 'work') {
        timer.remainingTime = timer.rest.duration * 60
        timer.currentPhase = 'rest'
      } else {
        timer.remainingTime = timer.work.duration * 60
        timer.currentPhase = 'work'
      }

      updateDisplayedPhase()
      haltTimer()
      var alarm = new Audio(timer.alarmUrl)
      alarm.play()
    }
    updateDisplayedTime()
  }

  function startTimer () {
    timer.remainingTime = timer.work.duration * 60
    timer.currentPhase = 'work'
    timer.working = true

    togglePhaseControls()
    updateDisplayedPhase()
    return setInterval(updateTimer, 1000)
  }

  function handleTimerButton (event) {
    if (timer.remainingTime === undefined) {
      timer.loopingFunction = startTimer()
    } else if (!timer.working) {
      timer.loopingFunction = resumeTimer()
    } else {
      haltTimer()
    }
  }

  function handleControls (event, JQueryElement, session, isCurrentPhase) {
    if (event.target.innerText === '+') {
      session.duration = Math.min(parseInt(JQueryElement.text(), 10) + 1, 60)
    } else if (event.target.innerText === '-') {
      session.duration = Math.max(parseInt(JQueryElement.text(), 10) - 1, 1)
    }

    if (isCurrentPhase) {
      if (timer.remainingTime !== undefined) {
        timer.remainingTime = session.duration * 60
      }
      updateDisplayedTime(session.duration)
    }

    // Update options' display value
    updatePhaseDuration(JQueryElement, session.duration)
  }

  function init (options) {
    $variables.timerButton = $(options.timerButton)
    $variables.phaseDisplay = $(options.phaseDisplay)
    $variables.timeDisplay = $(options.timeDisplay)
    $variables.workTime = $(options.workTime)
    $variables.restTime = $(options.restTime)
    $variables.workControls = $(options.workControls)
    $variables.restControls = $(options.restControls)

    timer.alarmUrl = options.alarmUrl
    timer.work.duration = parseInt($variables.workTime.text(), 10)
    timer.rest.duration = parseInt($variables.restTime.text(), 10)

    $variables.timerButton.bind('click', handleTimerButton)

    $variables.workControls.bind('click', function (event) {
      handleControls(event, $variables.workTime, timer.work, timer.currentPhase === 'work' || timer.currentPhase === undefined)
    })

    $variables.restControls.bind('click', function (event) {
      handleControls(event, $variables.restTime, timer.rest, timer.currentPhase === 'rest')
    })
  }

  return {
    init: init
  }
}())

$(document).ready(function () {
  pomodoroTimer.init({
    timerButton: '#display',
    phaseDisplay: '#phase',
    timeDisplay: '#time',
    workTime: '#work-duration',
    restTime: '#rest-duration',
    workControls: '.work-controls',
    restControls: '.rest-controls',
    alarmUrl: 'http://www.freesound.org/data/previews/254/254819_4597795-lq.mp3'
  })
})
