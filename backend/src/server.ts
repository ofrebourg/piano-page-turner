import http from 'http'
import { connectToMidiDevice, sendMsgOverHttp } from './utils'

console.log('starting...')

// Command	Meaning                # params  param 1       param 2
// 0x80     Note-off               2         key           velocity
// 0x90     Note-on                2         key           velocity
// 0xA0     Aftertouch             2         key           touch
// 0xB0     Continuous controller  2         controller #  controller value
// 0xC0     Patch change           2         instrument #
// 0xD0     Channel Pressure       1         pressure
// 0xE0     Pitch bend             2         lsb (7 bits)  msb (7 bits)
// 0xF0     (non-musical commands)

// http
//   .createServer((req, res) => {
//     // Set the response headers
//     res.writeHead(200, {
//       'Content-Type': 'text/event-stream',
//       'Cache-Control': 'no-cache',
//       Connection: 'keep-alive',
//       'Access-Control-Allow-Origin': '*',
//     })

//     // Send a message to the client every 5 seconds
//     const interval = setInterval(() => {
//       console.log('sending message')
//       res.write('data: ' + new Date().toLocaleTimeString() + '\n\n')
//     }, 5000)

//     connectToMidiDevice()

//     req.on('close', () => {
//       console.log('client closed connection')
//       clearInterval(interval) // Stop sending messages after user closes connection
//     })
//   })
//   .listen(3000)

const requestListener: http.RequestListener = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  })

  // Write a message to the client to initiate the SSE connection
  sendMsgOverHttp('Connection established', res)

  const input = connectToMidiDevice(res)

  // Handle client disconnection
  req.on('close', () => {
    console.log('Client disconnected')
    // Perform any cleanup actions here
    if (!!input) {
      input.closePort()
    }
  })

  // Send a message to the client every 5 seconds
  // const interval = setInterval(() => {
  //   console.log('sending message')
  //   res.write('data: ' + new Date().toLocaleTimeString() + '\n\n')
  // }, 5000)
}

// if (import.meta.env.PROD) {
const server = http.createServer(requestListener)
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
// }

export const viteNodeApp = requestListener
