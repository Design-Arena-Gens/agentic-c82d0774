# Web Text-to-Speech Studio

Next.js single-page app that turns any text into spoken audio using the browser's Speech Synthesis API. Quickly experiment with different voices, speed, and pitch without leaving the browser.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+ (bundled with Node)

### Installation

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in a modern browser that supports the Web Speech API (Chrome, Edge, or Safari).

### Production build

```bash
npm run build
npm start
```

## Features

- Voice picker populated from the current browser
- Real-time speed and pitch controls
- Interrupt/stop active speech and restart with new settings
- Responsive, glassmorphism-inspired UI built with plain CSS

## Project Structure

```
app/
  layout.tsx        # Root layout, metadata, and global styles import
  page.tsx          # Text-to-speech interface
  globals.css       # Global styles
next.config.js      # Next.js configuration
package.json        # Scripts and dependencies
```

## Deploying

The app is ready for Vercel deployment:

```bash
npm run build
vercel deploy --prod
```
