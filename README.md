# Wigan Connect

A youth-first Team Wigan presentation concept connecting an accessible form to official MBacc, Beeline, GMACS and Wigan resources. This is our own idea, not an official MBacc or council service. It does not submit referrals, award MBacc credit or decide eligibility.

Young people choose goals (work experience, apprenticeships, a first job, careers events or community activity), share the kinds of work they are curious about, share their current school/college stage and receive official next-step links plus an editable experience profile. MBacc links open external resources; no profile is sent to MBacc or GMACS.

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
6. Open a result to show its official Wigan or GMACS link, or show a relevant MBacc suggestion on Beeline. Copy or edit the summary.
7. Optionally create a follow-up **preview** using fictional contact details and consent. Nothing is sent.

## Sources and attribution

Information checked on **16 October 2026**, paraphrased from:

- [Wigan work experience](https://www.wigan.gov.uk/Resident/Jobs-Careers/Work-experience/Work-experience-at-Wigan-Council.aspx)
- [Wigan apprenticeships](https://www.wigan.gov.uk/Resident/Jobs-Careers/Become-an-apprentice.aspx)
- [Wigan youth careers advice](https://www.wigan.gov.uk/Resident/Education/Learning-careers-skills-for-young-people.aspx)
- [GMACS careers events](https://gmacs.co.uk/events/)
- [Wigan LINC2 activities](https://www.wigan.gov.uk/LINC2/Things-to-do/Things-to-do.aspx)
- [Beeline and its seven MBacc gateways](https://gmacs.co.uk/beeline/)
- [Official MBacc overview](https://www.greatermanchester-ca.gov.uk/what-we-do/education-work-and-skills/technical-education-city-region/the-greater-manchester-baccalaureate-mbacc/)
- [Official MBacc Award framework](https://www.greatermanchester-ca.gov.uk/what-we-do/education-work-and-skills/technical-education-city-region/the-greater-manchester-baccalaureate-mbacc/mbacc-award/how-the-award-works/)

Wigan Connect retains its own green-and-white identity. MBacc is a contextual external recommendation, shown for apprenticeship or career exploration interests, rather than a programme banner or required form choice. No partnership or official status is claimed. Beeline describes its intended audience as ages 14–18. The app presents information routes rather than inventing vacancies, session dates or placement offers. Schools, colleges and providers confirm arrangements and age eligibility.

Photo: **Wigan Pier**, Gerald England, 28 September 2017, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Wigan_Pier_(geograph_5676853).jpg), [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/). Original raster unchanged; display cropped with CSS. Attribution is in the Sources dialog.

## Validation

```sh
npm run build
npm test
```

19 automated checks cover missing keys, language validation, header-only credentials, public-copy translation, cache/concurrent requests, provider failures, cross-origin/method restrictions, rate limiting, official content, dictation handling, denied/unsupported microphones, late speech results, Worker assets, HEAD requests, safe 404s, work-interest questions in each language, youth-goal ranking, stage/profile summaries and official MBacc links without answer transmission.

Browser checks cover English/Polish/Urdu, RTL layout, accessibility toggles, read-aloud start/stop, missing-voice fallback, microphone consent/cancel, form/guide switching, option exclusivity, review, official details, edited-summary preservation/copy, contact validation and referral preview. Actual microphone transcription across devices, translation quality, screen-reader compatibility and a real Google API call need further testing before a public pilot.

## Architecture and limits

`public/` holds the front end. `server/api.mjs` provides same-origin, GET-only fixed-catalogue translation with rate limits, timeouts and caches. `server/local.mjs` runs locally. `scripts/build.mjs` embeds assets and API in the self-contained `dist/server/index.js` Worker, preserving the Site identity.

The guide and ranking are deterministic demo features, not a live LLM or screening system. Six youth-focused official information routes replace the earlier adult-service suggestions. Answers stay in page memory and disappear on reload. No analytics, persistence, booking or referral delivery. Browser speech recognition may send audio to its vendor when the resident activates it. Fonts have system fallbacks.
