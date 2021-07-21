'use strict'

const socket = new window.WebSocket(`ws://${window.location.host}/~/socket/`)
socket.addEventListener('message', handleServerMessage)

function handleServerMessage (event) {
  if (event.data === 'reload') window.location.reload()
}
