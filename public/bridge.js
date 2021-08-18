'use strict'

const socket = new window.WebSocket(`ws://${window.location.host}/~/socket/`)

socket.addEventListener('message', handleServerMessage)
window.addEventListener('beforeunload', closeConnection)

function handleServerMessage (event) {
  if (event.data === 'reload') window.location.reload()
}

function closeConnection () {
  socket.close()
}
