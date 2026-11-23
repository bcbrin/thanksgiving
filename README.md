# Thanksgiving 2026

A phone-first cooking and shopping guide for Thursday, November 26, 2026. It's a plain HTML, CSS and JavaScript site with no build step, no frameworks and no outside requests. It installs to your home screen and works offline once it has loaded.

**Tabs:** Shop · Plan · Recipes · Cook · Notes

- **Shop:** shopping list grouped by store section, with dish tags, a progress bar, "Hide checked items", Print and Reset.
- **Plan:** enter your serving time and every clock time works backward from it. Covers the day before and Thanksgiving Day, plus the 425°F vs. 350°F oven conflict with four sequences to choose from. Nothing is chosen for you.
- **Recipes:** five recipe cards with checkable ingredients and steps, collapsible sections, battle notes and source credits.
- **Cook:** Cook Mode (one step at a time, large type, Next and Back), several timers at once, keep-screen-awake, and the temperature cheat sheet.
- **Notes:** open items, reminders and a notes box. All of it is saved on the phone.

---

## Folder contents

```
thanksgiving-2026/
├── index.html              the page
├── manifest.webmanifest    install details (name, icons, colors)
├── sw.js                   service worker (offline cache)
├── .nojekyll               tells GitHub Pages to publish files as-is
├── README.md               this file
├── css/
│   └── styles.css          all styling, light/dark mode, print stylesheet
├── js/
│   ├── data.js             ALL recipe, shopping and plan text (edit this one)
│   └── app.js              the app logic
└── images/
    ├── icons/              app icons (home screen, browser tab)
    └── (your photos go here; see "Add the food photos")
```

Every path is relative, so the site works at a project address such as `https://USERNAME.github.io/thanksgiving-2026/`.

---

## Deploy to GitHub Pages

You need a free GitHub account. On a free plan, GitHub Pages requires the repository to be **public**.

### 1. Create the repository

1. Go to <https://github.com/new>.
2. Repository name: `thanksgiving-2026` (this name becomes part of the web address).
3. Choose **Public**, then click **Create repository**.

### 2. Upload the files

**Option A: in the browser (no tools needed)**

1. On the new repository page, click **uploading an existing file** (or **Add file → Upload files**).
2. Open the `thanksgiving-2026` folder on your computer, select **everything inside it** (`index.html`, `sw.js`, `manifest.webmanifest`, `README.md`, and the `css`, `js` and `images` folders), and drag it into the upload area. Upload the folder's contents, not the folder itself, so `index.html` sits at the top level of the repository.
3. Click **Commit changes**.

> The hidden `.nojekyll` file may not upload by drag and drop. That's fine; the site works without it.

**Option B: with Git on the command line**

```bash
cd thanksgiving-2026
git init
git add .
git commit -m "Thanksgiving 2026 guide"
git branch -M main
git remote add origin https://github.com/USERNAME/thanksgiving-2026.git
git push -u origin main
```

### 3. Turn on GitHub Pages

1. In the repository, click **Settings** (top menu).
2. In the left sidebar, under **Code and automation**, click **Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Under **Branch**, pick **main** and the **/ (root)** folder, then click **Save**.
5. Wait one to two minutes. Refresh the Pages settings screen. When it's ready, it shows **"Your site is live at https://USERNAME.github.io/thanksgiving-2026/"**. You can also follow progress on the repository's **Actions** tab.

### 4. Put it on your phone

Open the site address on your phone **while online**, tap through each tab once, then:

- **iPhone (Safari):** tap the **Share** button, then **Add to Home Screen**, then **Add**.
- **Android (Chrome):** tap the **⋮** menu, then **Add to Home screen** or **Install app**.

After the first visit, everything (pages, styles, data, icons and any photos you've added) is stored on the phone, so it opens with no signal in the store or kitchen. A small "Offline · saved copy" label appears at the top when there's no connection.

---

## Add the food photos

The recipe cards look for these exact file names in the `images/` folder:

| File | Recipe |
|---|---|
| `images/turkey.jpg` | 18 lb Enhanced Spatchcock Turkey |
| `images/potatoes.jpg` | Butter-Braised Mashed Potatoes |
| `images/mac-and-cheese.jpg` | Four-Cheese Baked Elbow Mac & Cheese |
| `images/carrots.jpg` | Orange-Thyme Butter-Roasted Carrots |
| `images/gravy.jpg` | Deep Turkey Gravy |

- Until a photo exists, its card shows a warm color gradient instead, with no broken image.
- For fast loading on store Wi-Fi, use landscape photos about **1600 × 1000 px**, saved as JPEG at about 75–80% quality (roughly 150–300 KB each). The card crops to a 16:10 frame.
- Upload them to `images/` (on GitHub: open the `images` folder, then **Add file → Upload files**), then **bump the version** (below).
- The **Notes** tab shows which photos are still missing.

---

## Change quantities or wording

All content lives in **`js/data.js`**: shopping items, recipes, the cook-day reference, plan wording, open items, reminders and credits. You never need to touch `index.html`.

- Edit the text between the quotes. Keep the commas, quotes and brackets intact.
- Wrap words in `**double asterisks**` to make them bold.
- Step timers look like `timer: { min: 25, max: 30, label: "Potatoes: covered simmer" }`. A range shows two tap-to-start buttons.
- Shopping item tags come from `uses: ["turkey", "gravy"]` (keys: `turkey`, `gravy`, `potatoes`, `mac`, `carrots`). Add `tbc: true` for a "To be confirmed" tag or `optional: true` for an "Optional" tag.
- **Mac & cheese roux:** when you decide the butter and flour amounts, edit the ingredient line marked `tbc: true` in the mac recipe and the two shopping items (Unsalted butter, All-purpose flour).
- Plan defaults (serving time, durations, recommended oven option) are in `plan.defaults`. On the phone you can also change them on the **Plan** tab under **Adjust timings**.
- Checkmarks are matched to each item's wording. Rewording an item clears only that item's checkmark.
- If `data.js` has a typo, the site shows a red message instead of the tabs. Open the browser console to see the line number.

### Publish an update (important)

After you change any file and push it to GitHub, open **`sw.js`** and bump the version on the first line:

```js
var VERSION = 'tg2026-v1';   // change to 'tg2026-v2', then 'tg2026-v3', ...
```

Commit that too. The next time the phone opens the site online, it downloads the new files and shows "A newer version of the guide is ready" with a **Reload** button. Even without a bump, changes arrive in the background and show on the following launch.

---

## What's saved on the phone

All of this is saved in the browser's local storage on each device. Nothing is uploaded, and every list has its own **Reset** button:

| Saved | Reset button |
|---|---|
| Shopping checkmarks, "Hide checked items" | Shop tab: **Reset** |
| Recipe ingredient and step checkmarks | Each recipe: **Reset this recipe**; bottom of Recipes: **Reset all recipe checkmarks** |
| Serving time, potatoes-ahead switch, oven choice, adjusted timings | Plan tab: **Reset plan settings** |
| Open-item checkmarks | Notes tab: **Reset open items** |
| Notes text | Notes tab: **Clear notes** |
| Running timers, Cook Mode position, keep-awake setting | Notes tab: **Reset everything on this phone** |

Each phone keeps its own copy. Checking an item on one phone doesn't check it on another.

---

## Cook Mode, timers and keeping the screen on

- **Cook Mode** shows one step at a time in large type. Use **Next** and **Back**, swipe left or right, or use the arrow keys on a computer. **Mark this step done** ticks the same checkbox as the recipe card.
- **Timers:** tap any time button on a step, in the plan or on the cheat sheet. Several can run at once, and each has Pause, +1 min, +5 min and Cancel. When one finishes, a red banner appears on every screen, the phone beeps (and vibrates on Android) and the browser tab title changes. Timers store their end time, so they survive reloads and screen locks.
- **Keep screen awake** (Cook tab, or **Awake** in Cook Mode) uses the Screen Wake Lock API while Cook Mode is open or a timer is running. Phones pause web pages when the screen locks, so keeping it awake is what makes alarms ring on time. If your browser doesn't support it, the app says so. In that case, set **Auto-Lock** to **Never** while cooking (iPhone: Settings, Display & Brightness, Auto-Lock).
- On iPhone, the timer sound follows the ring/silent switch.
- **Notify me in the background** (Cook tab, where supported) shows a system notification if a timer ends while you're in another app. This works on Android, and on iPhone only when the site is installed to the Home Screen.

---

## Test it on your computer

A service worker only runs over `https://` or on `localhost`, so open the site through a small local web server rather than by double-clicking `index.html`.

```bash
cd thanksgiving-2026
python3 -m http.server 8000
```

Then open <http://localhost:8000/>. In Chrome DevTools, the device toolbar (Ctrl+Shift+M, or Cmd+Shift+M on a Mac) lets you try phone sizes such as 375 × 667 and 390 × 844. The **Application** tab shows the manifest, service worker and saved data. Tick **Offline** on the Network tab to check offline use.

> Opening the site from your phone at your computer's network address (for example `http://192.168.1.20:8000`) shows the pages, but offline mode and installing need the real `https://` GitHub Pages address.

---

## Printing the shopping list

Tap **Print list** on the Shop tab, or print from any tab. The print layout shows only the shopping list: two columns, black on white, with checkboxes, quantities and dish tags. Items you've already checked print with a tick and strikethrough.

---

## Troubleshooting

- **The phone still shows old content.** Make sure you bumped `VERSION` in `sw.js`. Then close the app and reopen it while online, and tap **Reload** when prompted.
- **Start completely fresh on a phone.** Notes tab, then **Reset everything on this phone**. To also clear the offline copy, remove the home-screen app (or clear the site's data in browser settings) and visit again.
- **A photo doesn't appear.** Check that the file name matches exactly; names are case-sensitive on GitHub Pages (`Turkey.JPG` is not `turkey.jpg`).

---

## Credits

Inspired by and adapted from:

- Milk Street (mashed potatoes): <https://www.177milkstreet.com/recipes/butter-braised-mashed-potatoes>
- Milk Street (carrots): <https://www.177milkstreet.com/stories/11-2024-make-carrots-the-most-exciting-side-on-your-thanksgiving-table>
- Milk Street (gravy): <https://www.177milkstreet.com/stories/best-turkey-gravy-recipe>
- America's Test Kitchen (carrot cutting): <https://www.americastestkitchen.com/how_tos/5794-cutting-carrots-for-roasting>
- Alton Brown (gravy): <https://altonbrown.com/recipes/best-thanksgiving-gravy-ever/>

A personal, non-commercial family cooking guide. Recipes are adapted, not reproduced. The design is inspired by clean editorial food sites and uses no third-party logos, fonts or images.
