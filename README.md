# Wigan Connect

Independent Team Wigan presentation prototype. This is not an official council service and does not submit referrals or decide eligibility.

## Run locally

Requires Node 24. No dependencies or installation required.

```sh
npm start
```

Open http://localhost:4173. Edit files in `public/`; reload the browser to see changes. The local server handles static files and the same translation endpoints used by the hosted Worker.

## Enable Google Cloud Translation

1. Enable Cloud Translation API (Basic/v2) in your Google Cloud project and configure billing and quotas there.
2. Put `GOOGLE_TRANSLATE_API_KEY` in your local untracked `.env`, following `.env.example`. Restart `npm start`.
3. For the hosted version, configure the same value as a **secret runtime environment variable** in Sites, then deploy a saved version to apply it. Never put the key in browser code, the source manifest or chat.

The language picker fetches Google's supported language list. It does not promise every language in the world. English, Polish and Urdu are bundled as fallbacks. Additional languages are translated on demand and cached in server memory. Only the fixed public interface catalogue is sent to Google; free-text answers and contact details are not accepted by the endpoint. Switching languages preserves custom answers and edited summaries in their original language.

Google API references:

- https://docs.cloud.google.com/translate/docs/reference/rest/v2/translate
- https://docs.cloud.google.com/translate/docs/reference/rest/v2/languages
- https://docs.cloud.google.com/docs/authentication/api-keys-use

Live Google translation cannot be verified until a real key is configured. Provider tests use mocks and incur no API charges.

## Demonstrate in 60–90 seconds

1. Show **Accessibility & language**. Try language selection, larger text and high contrast.
2. Click **Try example answers**. The same answers work in Form and Guided Conversation modes.
3. Use **Read this question aloud** and its speed selector. Installed voices depend on device and language; unavailable voices are explained.
4. Continue to Experience. **Help me describe this** offers a scripted follow-up. **Speak my answer** explains browser speech handling before requesting microphone permission. Typing always works.
5. Review answers and show three official service suggestions with reasons. Availability and area go into the summary, not a guaranteed match.
6. Open a result to show the official Wigan Council link. Copy or edit the summary.
7. Optionally create a follow-up **preview** using fictional contact details and consent. Nothing is sent.

## Sources and attribution

Information checked on **16 October 2026**, paraphrased from:

- [TechMates](https://www.wigan.gov.uk/Council/Digital-Wigan/TechMates.aspx)
- [Work experience and volunteering](https://www.wigan.gov.uk/Resident/Jobs-Careers/Work-experience/Index.aspx)
- [Jobs, careers and skills](https://www.wigan.gov.uk/Resident/Jobs-Careers/index.aspx)
- [ESOL application route](https://forms.wigan.gov.uk/xfp/form/779)
- [About Adult Learning](https://www.wigan.gov.uk/Resident/Jobs-Careers/Adult-Learning/About-Adult-Learning.aspx)

Background: [Employment and Skills Strategy 2020–2030](https://www.wigan.gov.uk/Docs/PDF/Resident/Jobs-Careers/Employability-and-skills-strategy.pdf). No current population figures, event schedules, vacancies, prices or eligibility approvals are fabricated. Confirm actual details with the linked service.

Photo: **Wigan Pier**, Gerald England, 28 September 2017, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Wigan_Pier_(geograph_5676853).jpg), [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/). Original raster unchanged; display cropped with CSS. Attribution is in the Sources dialog.

## Validation

```sh
npm run build
npm test
```

14 automated checks cover missing keys, language validation, header-only credentials, public-copy translation, cache/concurrent requests, provider failures, cross-origin/method restrictions, rate limiting, official content, dictation handling, denied/unsupported microphones, late speech results, Worker assets, HEAD requests and safe 404s.

Browser checks cover English/Polish/Urdu, RTL layout, accessibility toggles, read-aloud start/stop, missing-voice fallback, microphone consent/cancel, form/guide switching, option exclusivity, review, official details, edited-summary preservation/copy, contact validation and referral preview. Actual microphone transcription across devices, translation quality, screen-reader compatibility and a real Google API call need further testing before a public pilot.

## Architecture and limits

`public/` holds the front end. `server/api.mjs` provides same-origin, GET-only fixed-catalogue translation with rate limits, timeouts and caches. `server/local.mjs` runs locally. `scripts/build.mjs` embeds assets and API in the self-contained `dist/server/index.js` Worker, preserving the Site identity.

The guide and ranking are deterministic demo features, not a live LLM or screening system. Five official service directories replace fictional listings. Answers stay in page memory and disappear on reload. No analytics, persistence, booking or referral delivery. Browser speech recognition may send audio to its vendor when the resident activates it. Fonts have system fallbacks.
