# Wigan Connect — presentation prototype

Accessible, buildless community-opportunity form. Run `python3 -m http.server 4173 --directory dist` from this folder, then open http://localhost:4173.

## 60–90 second demonstration

1. Click **Try example answers** to load a fictional resident and enter guided mode.
2. Change the language to Polish or Urdu to demonstrate the translated interface. Urdu uses right-to-left layout.
3. Try **Larger text** and **Listen**. Installed browser/device voices determine read-aloud language availability.
4. Continue to Experience. Show **Speak my answer** (microphone permission and browser speech-recognition support required), or **Help me describe this** for an adaptive scripted prompt.
5. Continue through availability and support to the editable review.
6. Click **Find my next steps**. Show three interest-based sample opportunities and an editable, copyable experience summary.
7. Open an opportunity or preview a consent-based follow-up request. Use fictional contact details; no referral is sent.

## What works

- English, Polish and Urdu interface dictionaries, including opportunities and guided prompts.
- Five-step optional form, shared form/guided state, example answers, editable review.
- Device text-to-speech with a matching installed voice, speech-to-text with supported browser APIs, larger text, keyboard controls, semantic form labels and mobile layout.
- Deterministic interest matching against five illustrative opportunities; top three shown with explanatory copy.
- Editable experience summary assembled from resident answers; copy, print, restart and referral preview.

## Demonstration boundaries

The guide uses scripted prompts and keyword rules, not a live language model. Summaries and matching are deterministic. All opportunities, schedules and locations are illustrative and must not be presented as current services. The map is outside this form prototype. No API key, database, real eligibility assessment, booking, application, referral delivery or analytics collection is implemented.

Answers remain in page memory, are never added to URLs or local storage, and disappear on reload. Browser speech recognition may use the browser vendor's speech service when the user activates the microphone. Google Fonts supplies optional typography; system fonts remain usable offline.

Custom-typed answers are preserved in their original language when the interface changes; example answers are translated automatically. Availability and access support are shown for discussion, not guaranteed by matching. Review translations with fluent speakers before a real pilot.
