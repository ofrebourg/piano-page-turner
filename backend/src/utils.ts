import http from 'http'
import midi, { MidiMessage } from 'midi'

export function sendMsgOverHttp(
  msg: string,
  res: http.ServerResponse<http.IncomingMessage>
) {
  res.write(`data: ${msg}\n\n`)
}

function translateMsg(msgCodes: MidiMessage) {
  if (!msgCodes.length) {
    return []
  }

  if (msgCodes[0] === 0x80) {
    return ['NOTE_OFF', msgCodes[1], msgCodes[2]]
  }
  if (msgCodes[0] === 0x90) {
    return ['NOTE_ON', msgCodes[1], msgCodes[2]]
  }

  // detect when the left pedal is released only
  if (msgCodes[0] === 0xb0 && msgCodes[1] === 67 && msgCodes[2] === 0) {
    return ['LEFT_PEDAL']
  }

  return []
}

// let input: midi.Input

export function connectToMidiDevice(
  res: http.ServerResponse<http.IncomingMessage>
) {
  // if (!!input) {
  //   console.log('midi input already connected')
  //   return
  // }

  console.log('connecting to midi device...')

  // Set up a new input.
  const input = new midi.Input()

  // Count the available input ports.
  const count = input.getPortCount()

  console.log('count', count)

  if (count === 0) {
    console.error('no midi input')
    return
  }

  // Get the name of a specified input port.
  input.getPortName(0)

  // Configure a callback.
  input.on('message', (deltaTime, message) => {
    // The message is an array of numbers corresponding to the MIDI bytes:
    //   [status, data1, data2]
    // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful
    // information interpreting the messages.
    console.log(`m: ${message} d: ${deltaTime}`, message, translateMsg(message))
    // res.write(`${message}`)
    // res.write('data: ' + new Date().toLocaleTimeString() + '\n\n')
    const translatedMsg = translateMsg(message)
    if (translatedMsg[0] === 'LEFT_PEDAL') {
      sendMsgOverHttp('NEXT_PAGE', res)
    }
  })

  // Open the first available input port.
  input.openPort(0)

  // Sysex, timing, and active sensing messages are ignored
  // by default. To enable these message types, pass false for
  // the appropriate type in the function below.
  // Order: (Sysex, Timing, Active Sensing)
  // For example if you want to receive only MIDI Clock beats
  // you should use
  // input.ignoreTypes(true, false, true)
  input.ignoreTypes(false, false, false)

  // ... receive MIDI messages ...

  return input
}
