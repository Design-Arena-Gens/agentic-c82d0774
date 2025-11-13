'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

const defaultText =
  "Welcome to the Web Text-to-Speech Studio. Tweak the settings, choose a voice, and press Speak to hear this text aloud.";

export default function HomePage() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [text, setText] = useState<string>(defaultText);
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const { speechSynthesis } = window;

    const updateVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      if (availableVoices.length === 0) {
        return;
      }

      const sorted = [...availableVoices].sort((a, b) => {
        if (a.lang === b.lang) {
          return a.name.localeCompare(b.name);
        }
        return a.lang.localeCompare(b.lang);
      });

      setVoices(sorted);
      setSelectedVoice((current) => {
        if (current) {
          return current;
        }
        const defaultVoice = sorted.find((voice) => voice.default) ?? sorted[0];
        return defaultVoice?.name ?? '';
      });
    };

    updateVoices();
    speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (speechSynthesis.onvoiceschanged === updateVoices) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const currentVoice = useMemo(
    () => voices.find((voice) => voice.name === selectedVoice),
    [voices, selectedVoice]
  );

  const handleSpeak = useCallback(() => {
    if (!isSupported || typeof window === 'undefined') {
      return;
    }

    const { speechSynthesis } = window;
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    if (currentVoice) {
      utterance.voice = currentVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    speechSynthesis.speak(utterance);
  }, [currentVoice, isSupported, pitch, rate, text]);

  const handleStop = useCallback(() => {
    if (!isSupported || typeof window === 'undefined') {
      return;
    }
    const { speechSynthesis } = window;
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [isSupported]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleSpeak();
    },
    [handleSpeak]
  );

  const rateLabel = `${rate.toFixed(1)}x`;
  const pitchLabel = pitch.toFixed(1);

  if (!isSupported) {
    return (
      <main className="page">
        <div className="panel">
          <h1>Web Text-to-Speech Studio</h1>
          <p>
            Your browser does not support the Web Speech API. Please try the latest version of Chrome, Edge, or Safari to
            enable text-to-speech.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="panel">
        <header className="header">
          <h1>Web Text-to-Speech Studio</h1>
          <p>Convert text to lifelike speech right in your browser.</p>
        </header>
        <form className="grid" onSubmit={handleSubmit}>
          <label className="field">
            <span className="label">Text</span>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={6}
              placeholder="Enter text to speak..."
            />
          </label>

          <label className="field">
            <span className="label">Voice</span>
            <select value={selectedVoice} onChange={(event) => setSelectedVoice(event.target.value)}>
              {voices.map((voice) => (
                <option key={`${voice.name}-${voice.lang}`} value={voice.name}>
                  {voice.name} ({voice.lang}){voice.default ? ' • Default' : ''}
                </option>
              ))}
            </select>
          </label>

          <div className="sliders">
            <label className="slider">
              <span className="label">Speed · {rateLabel}</span>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.1}
                value={rate}
                onChange={(event) => setRate(Number(event.target.value))}
              />
            </label>
            <label className="slider">
              <span className="label">Pitch · {pitchLabel}</span>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.1}
                value={pitch}
                onChange={(event) => setPitch(Number(event.target.value))}
              />
            </label>
          </div>

          <div className="actions">
            <button type="submit" className="primary" disabled={!text.trim() || isSpeaking}>
              {isSpeaking ? 'Speaking…' : 'Speak'}
            </button>
            <button type="button" className="secondary" onClick={handleStop} disabled={!isSpeaking}>
              Stop
            </button>
            <button
              type="button"
              className="ghost"
              onClick={() => setText(defaultText)}
              disabled={text === defaultText}
            >
              Reset Text
            </button>
          </div>
        </form>

        <section className="tips">
          <h2>Tips</h2>
          <ul>
            <li>Different browsers expose different voices. Experiment to find your favorite.</li>
            <li>Rate controls how fast the voice speaks. Pitch makes the voice deeper or higher.</li>
            <li>Use Speak again to interrupt any current playback with the latest settings.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
