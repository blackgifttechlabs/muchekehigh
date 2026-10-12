# Mucheke High School website

Plain HTML, CSS and JavaScript. No build step. Open `index.html` in a browser.

## Folder structure

```
mucheke-high-school/
├── index.html              Home page
├── pages/                  All other pages
│   ├── about.html          Welcome, values, leadership
│   ├── history.html        Timeline
│   ├── academics.html      Forms 1–2, O Level, A Level, subjects
│   ├── sport.html
│   ├── clubs.html
│   ├── admissions.html     How to apply, fees, uniform
│   ├── news.html           All news + single story (news.html?story=id)
│   └── contact.html        Contact form + map
└── assets/
    ├── css/
    │   ├── base.css        Colours, fonts, reset  ← change school colours here
    │   ├── layout.css      Top bar, header, menu, footer
    │   └── components.css  Buttons, hero, cards, news, gallery, forms
    ├── js/
    │   ├── data/
    │   │   ├── site.js     Phone, email, address, social links
    │   │   └── news.js     News stories  ← add news here
    │   ├── components.js   Builds header, menu and footer on every page
    │   └── main.js         Menu, slider, news, gallery, forms
    ├── images/             Logo + placeholder pictures (replace with real photos)
    │   └── gallery/
    ├── video/              Add hero.mp4 to play a video on the home page
    └── docs/               PDFs: application form, fees structure
```

## Common edits

- **Menu:** edit the `MENU` list in `assets/js/components.js`.
- **Contact details:** edit `assets/js/data/site.js`.
- **News:** add a block at the top of `assets/js/data/news.js`.
- **Photos:** replace the `.svg` files in `assets/images/` with real `.jpg` photos
  (keep the same name, or change the `src` in the HTML).
- **Colours:** change `--river` and `--gold` in `assets/css/base.css`.

## Still to confirm (search for TODO in the files)

- Founding year, current head's name, motto, values, real colours and crest
- Phone number and email
- Subjects, sports, clubs, fees and uniform
- Whether A Level is offered
- All news except "Mr Maweni retires" are samples
