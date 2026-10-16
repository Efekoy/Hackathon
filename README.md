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

## Publish on Netlify

Import `Efekoy/Hackathon` from GitHub and select branch `main`. Leave the base directory empty. The tracked `netlify.toml` sets the build command to `npm run build`, publish directory to `public` and functions directory to `netlify/functions`. Publish through the Git integration so Netlify builds the translation function; a static folder drag-and-drop alone does not deploy that function.

The form, English/Polish/Urdu, interest suggestions and results work without an API key. To enable additional Google translations, add `GOOGLE_TRANSLATE_API_KEY` in Netlify environment variables with **Functions** scope, then redeploy. Do not put the key in `netlify.toml` or any public file. The Netlify adapter reuses the tested API and only sends fixed interface text to Google.

After deploying, check `/api/languages`: without a key it returns `{"configured":false,"languages":[]}`. With a working key it returns the supported language list. Verify an additional language from the accessibility menu. The full eight-question demo and results tabs should also work on the deployed URL.

Configuration follows [Netlify's Functions documentation](https://docs.netlify.com/build/functions/configuration/) and [Functions API](https://docs.netlify.com/build/functions/api/).

## Demonstrate in 60–90 seconds

1. Show **Accessibility & language**. Try the language dropdown, larger text, high contrast and read-aloud controls.
2. Click **Try example answers** to start the eight-question journey with editable sample answers, or **Let’s go** for a blank journey.
3. Show the emoji choice cards, segmented progress bar, live interest bars, XP and badge notifications. Interests are compared with the strongest signal, not scored for eligibility.
4. On the experience question, type an example. **Speak my answer** explains browser speech handling before requesting microphone permission. Typing always works.
5. Complete the journey and show **You**, **Jobs**, **Next steps** and **Help**. Jobs contains official information routes, not live vacancies.
6. Show the contextual MBacc link for apprenticeship/career-exploration interests, edit/copy the experience profile, or print/save the current results view.
7. **Start again** asks before clearing the in-memory answers.

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

Wigan Connect uses a teal, lime and yellow interface inspired by the supplied design references. MBacc is a contextual external recommendation, shown for apprenticeship or career exploration interests, rather than a programme banner or required form choice. No partnership or official status is claimed. Beeline describes its intended audience as ages 14–18. The app presents information routes rather than inventing vacancies, session dates or placement offers. Schools, colleges and providers confirm arrangements and age eligibility.

Photo: **Wigan Pier**, Gerald England, 28 September 2017, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Wigan_Pier_(geograph_5676853).jpg), [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/). Retained asset from the earlier prototype; the redesigned interface does not display it.

## Validation

```sh
npm run build
npm test
```

25 automated checks cover translation keys and errors, fixed-public-copy translation, caching, rate limits, request restrictions, eight-question content in each bundled language, choice limits and exclusive options, interest mapping, XP/levels, contextual MBacc links, official-resource ranking, safe profile rendering, speech append/stop behavior and Worker assets.

Browser checks cover the complete eight-question journey, all four result views, English/Polish/Urdu, RTL layout, accessibility toggles, microphone consent/cancel, translation setup messaging and edited-profile retention across tabs and languages. Actual microphone transcription across devices, translation quality, screen-reader compatibility and a real Google API call need further testing before a public pilot.

## Architecture and limits

`public/` holds the front end. `server/api.mjs` provides same-origin, GET-only fixed-catalogue translation with rate limits, timeouts and caches. `server/local.mjs` runs locally. `scripts/build.mjs` embeds assets and API in the self-contained `dist/server/index.js` Worker, preserving the Site identity.

The guide and ranking are deterministic demo features, not a live LLM or screening system. Six youth-focused official information routes replace the earlier adult-service suggestions. Answers stay in page memory and disappear on reload. No analytics, persistence, booking or referral delivery. Browser speech recognition may send audio to its vendor when the resident activates it. Fonts have system fallbacks.
