# piano-page-turner
Node backend app connecting to a midi device, Vue frontend for displaying a PDF. Server-sent events notifying when to turn the page.

# Connect your midi device to your computer
I personally connected my piano over bluetooth.

On Mac:
1. Launch `Audio Mini Setup`
2. Go to Window and show MIDI Studio
3. in MIDI Studio, click on the Bluetooth icon to `Configure Bluetooth`. It will scan for MIDI Bluetooth Devices and you'll be able to connect to your device.

# Run the backend
The backend starts on http://localhost:3000 and once the frontend connects to it (once you open the actual webpage), it will look for a midi device, and will start listening to MIDI events.
Whenever the left pedal is pressed, it will send a `NEXT_PAGE` message to the frontend.
```sh
cd backend
pnpm install
pnpm dev
```

# Run the frontend
The frontend connects to the backend on port 3000 and displays a PDF music piece. It then waits for the backend's instructions to turn pages.
```sh
cd backend
pnpm install
pnpm dev
```
