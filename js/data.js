/*
  Thanksgiving 2026: editable content
  ===================================
  Everything the site shows (shopping list, recipes, game plan wording,
  cook-day reference, open items, credits) lives in this one file.
  Change the text between the quotes, save, reload.

  Tips
  - Keep the quotes, commas and brackets intact. A missing comma is the most
    common typo; the site shows a warning banner if this file can't be read.
  - Wrap words in **double asterisks** to make them bold.
  - Timers are in minutes: { min: 25 } or a range { min: 25, max: 30 }.
  - Checkmarks are matched to an item's wording, so rewording one item clears
    only that item's checkmark.
  - Dish keys used in "uses" and "dish": turkey, gravy, potatoes, mac, carrots.
  - After you push a change to GitHub, also bump VERSION at the top of sw.js
    so installed phones pick it up on the next launch.
*/
window.TG_DATA = {
  site: {
    title: "Thanksgiving 2026",
    thanksgiving: "2026-11-26", // Thursday
    dayBefore: "2026-11-25",    // Wednesday
    disclaimer: "A personal, non-commercial family cooking guide. Recipes are adapted, not reproduced."
  },

  // Section 7: Menu
  menu: ["Turkey", "Gravy", "Mashed Potatoes", "Baked Mac & Cheese", "Roasted Carrots"],

  dishes: {
    turkey:   { label: "Turkey",       color: "#8A4A22" },
    gravy:    { label: "Gravy",        color: "#5E3A22" },
    potatoes: { label: "Potatoes",     color: "#B8912B" },
    mac:      { label: "Mac & Cheese", color: "#D08A00" },
    carrots:  { label: "Carrots",      color: "#D9601C" }
  },

  // ---------------------------------------------------------------------------
  // SHOPPING LIST: still to buy (grouped by store section)
  // name + detail are shown; "uses" become the small dish tags.
  // optional: true adds an "Optional" tag; tbc: true adds "To be confirmed".
  // ---------------------------------------------------------------------------
  shopping: [
    {
      id: "produce",
      title: "Produce",
      items: [
        { name: "Celery", detail: "1 bunch; about 4 to 5 stalks needed across turkey pan and stock", uses: ["turkey", "gravy"] },
        { name: "Fresh thyme", detail: "turkey pan, gravy stock, carrots", uses: ["turkey", "gravy", "carrots"] },
        { name: "Fresh sage", detail: "turkey pan, gravy stock", uses: ["turkey", "gravy"] },
        { name: "Fresh rosemary", detail: "optional for turkey pan, small sprig for gravy stock", uses: ["turkey", "gravy"], optional: true },
        { name: "1 orange", detail: "carrots", uses: ["carrots"] },
        { name: "2 shallots", detail: "mac and cheese", uses: ["mac"] },
        { name: "Fresh flat-leaf parsley", detail: "optional, carrots", uses: ["carrots"], optional: true },
        { name: "Fresh chives", detail: "optional, mashed potatoes", uses: ["potatoes"], optional: true }
      ]
    },
    {
      id: "dairy",
      title: "Dairy and Eggs",
      items: [
        { name: "Salted butter", detail: "18 tablespoons (2 1/4 sticks) for mashed potatoes", uses: ["potatoes"] },
        { name: "Unsalted butter", detail: "at least 11 tablespoons for known uses (4 mac topping, 4 gravy roux, 3 carrots) PLUS the mac roux amount (quantity still to be confirmed). Suggest buying at least 1 lb.", uses: ["mac", "gravy", "carrots"], tbc: true },
        { name: "Whole milk", detail: "3 cups", uses: ["mac"] },
        { name: "Half-and-half", detail: "3 cups", uses: ["mac"] },
        { name: "Eggs", detail: "2", uses: ["mac"] }
      ]
    },
    {
      id: "cheese",
      title: "Cheese and Deli",
      items: [
        { name: "Sharp cheddar", detail: "8 oz (block, grate fresh)", uses: ["mac"] },
        { name: "Gruyere", detail: "6 oz (block, grate fresh)", uses: ["mac"] },
        { name: "Low-moisture whole-milk mozzarella", detail: "6 oz (NOT fresh mozzarella)", uses: ["mac"] },
        { name: "Deli American cheese", detail: "4 oz (sliced at the deli counter)", uses: ["mac"] },
        { name: "Parmesan", detail: "1/2 cup finely grated (about 2 oz)", uses: ["mac"] }
      ]
    },
    {
      id: "pantry",
      title: "Pantry and Baking",
      items: [
        { name: "Neutral high-heat oil (canola or avocado)", detail: "for turkey skin and stock browning", uses: ["turkey", "gravy"] },
        { name: "Extra-virgin olive oil or neutral oil", detail: "for carrots (2 1/2 to 3 tablespoons)", uses: ["carrots"] },
        { name: "All-purpose flour", detail: "1/4 cup for gravy PLUS the mac roux amount (to be confirmed)", uses: ["gravy", "mac"], tbc: true },
        { name: "Panko", detail: "1 cup", uses: ["mac"] },
        { name: "Plain regular breadcrumbs", detail: "1 cup", uses: ["mac"] },
        { name: "Unsalted or very low-sodium chicken broth", detail: "backup for turkey pan and gravy", uses: ["turkey", "gravy"] }
      ]
    },
    {
      id: "spices",
      title: "Spices",
      items: [
        { name: "Dry mustard", detail: "2 tablespoons", uses: ["mac"] },
        { name: "Bay leaves", detail: "3 (2 for mac, 1 for gravy stock)", uses: ["mac", "gravy"] },
        { name: "Whole black peppercorns", detail: "", uses: ["gravy"] },
        { name: "Sweet paprika", detail: "", uses: ["mac"] },
        { name: "Ground black pepper", detail: "and white pepper optional", uses: ["turkey", "potatoes", "mac", "carrots", "gravy"] },
        { name: "Kosher salt", detail: "", uses: ["potatoes", "mac", "carrots", "gravy"] }
      ]
    },
    {
      id: "have",
      title: "Already Have (confirm at home)",
      atHome: true,
      items: [
        { name: "18 lb turkey", detail: "label: \"contains up to 4% of a solution of water, salt, and spices for tenderness and juiciness\"; treat as enhanced/pre-brined", uses: ["turkey", "gravy"] },
        { name: "3 lb russet potatoes", detail: "confirm they are russets", uses: ["potatoes"] },
        { name: "Carrots", detail: "need about 2 1/2 to 3 lb for roasting, plus about 4 to 5 more for the turkey pan and stock", uses: ["carrots", "turkey", "gravy"] },
        { name: "Onions", detail: "about 3 (1 to 2 large for turkey pan, 1 small for stock)", uses: ["turkey", "gravy"] },
        { name: "Garlic", detail: "1 head", uses: ["turkey"] },
        { name: "18 oz elbow macaroni", detail: "", uses: ["mac"] },
        { name: "Chicken broth", detail: "confirm it is unsalted or very low-sodium. Regular broth is too salty for this plan.", uses: ["turkey", "gravy"] }
      ]
    }
  ],

  // ---------------------------------------------------------------------------
  // RECIPES
  // ---------------------------------------------------------------------------
  recipes: [
    {
      id: "turkey",
      title: "18 lb Enhanced Spatchcock Turkey",
      shortTitle: "Turkey",
      image: "images/turkey.jpg",
      imageAlt: "Golden-brown spatchcocked turkey lying flat in a roasting pan over carrots, celery, onion and fresh herbs",
      palette: ["#6B3416", "#C9853F"],
      intro: [],
      callouts: [
        { label: "Status", tone: "alert", text: "Label says up to 4% salt solution. **No dry brine, no added salt, no injection.** Use pepper and neutral oil on the skin only." }
      ],
      stats: [
        ["Oven", "425°F"],
        ["First temp check", "About 90 min"],
        ["Pull at", "Breast 155–160°F, thigh 175°F+"],
        ["Rest", "30 to 45 min"]
      ],
      ingredients: [
        {
          title: "",
          items: [
            "1 whole 18 lb enhanced turkey",
            "Neutral high-heat oil",
            "Freshly ground black pepper",
            "3 to 4 carrots, large pieces",
            "3 to 4 celery stalks, large pieces",
            "1 to 2 large yellow onions, roughly cut",
            "1 head garlic, halved crosswise",
            "Fresh thyme, fresh sage, optional fresh rosemary",
            "1 to 2 cups water or unsalted/very low-sodium chicken broth, plus more as needed",
            "Turkey neck, backbone and wing tips reserved for stock and gravy"
          ]
        }
      ],
      method: [
        {
          title: "Day before",
          steps: [
            "Spatchcock with sturdy poultry shears: remove the backbone, flatten the bird, and press firmly on the breastbone. Reserve the backbone, neck and wing tips for gravy stock.",
            "Do NOT dry-brine or add salt. The turkey already contains a salt solution.",
            "Skip the injector.",
            "Pat very dry and refrigerate uncovered on a rack overnight to dry the skin."
          ]
        },
        {
          title: "Roast day",
          steps: [
            { text: "Remove the turkey from the fridge about 1 hour before roasting.", timer: { min: 60, label: "Turkey: on the counter" } },
            "Heat the oven to 425°F with a rack in the lowest practical position.",
            "Spread the carrots, celery, onion, garlic and herb sprigs in the roasting pan. Add about 1 cup water or unsalted/very low-sodium broth.",
            "Set the turkey skin-side up over the aromatics. Coat the skin lightly with neutral oil and season with black pepper only.",
            { text: "Roast at 425°F. Start checking temperature at about 90 minutes, but cook by internal temperature, not time.", timer: { min: 90, label: "Turkey: first temp check" } },
            "Rotate the pan if browning is uneven. If the breast gets too dark, shield loosely with foil.",
            "If the pan dries out or the drippings get very dark, add water or broth 1/2 cup at a time.",
            "Pull the turkey when the deepest breast meat reaches 155 to 160°F and the thigh is at least 175°F and tender.",
            { text: "Rest 30 to 45 minutes before carving.", timer: { min: 30, max: 45, label: "Turkey: rest" } }
          ]
        }
      ],
      notes: [
        {
          title: "Gravy protection rules",
          items: [
            "No exterior butter or sugary glaze.",
            "No extra salt until the finished pan liquid and gravy have been tasted.",
            "Keep minced garlic and chopped herbs off the skin so they do not burn.",
            "Use unsalted or very low-sodium liquid in the pan and stock.",
            "Keep enough liquid in the pan to prevent blackened drippings. Dark brown is flavor; black is ruined gravy.",
            "Reserve the backbone, neck and wing tips for stock."
          ]
        }
      ],
      credits: [
        { label: "Our own plan for an enhanced (pre-brined) turkey; no single outside source" }
      ]
    },

    {
      id: "potatoes",
      title: "Milk Street Butter-Braised Mashed Potatoes",
      shortTitle: "Mashed Potatoes",
      image: "images/potatoes.jpg",
      imageAlt: "Fluffy butter-braised mashed potatoes in a warm serving bowl, topped with chopped chives",
      palette: ["#B08A3E", "#F1DFB0"],
      intro: [
        "Russets cook in a little water with butter and the liquid cooks down instead of being drained, so the potatoes taste like potato, not cream."
      ],
      callouts: [],
      stats: [
        ["Yield", "6 to 8 servings"],
        ["Time", "About 40 minutes"],
        ["Pot", "Wide 7- to 8-quart Dutch oven"],
        ["Make-ahead", "Up to 2 days"]
      ],
      ingredients: [
        {
          title: "",
          items: [
            "3 lb russet potatoes, peeled and cut into 1-inch chunks",
            "18 tablespoons salted butter, cut into chunks",
            "1 1/2 cups water",
            "1 1/2 teaspoons kosher salt, plus more to taste",
            "Ground black pepper",
            "Up to 1/2 cup boiling water for final consistency",
            "Chopped chives (optional)"
          ]
        }
      ],
      method: [
        {
          title: "Method",
          steps: [
            "Rinse the cut potatoes briefly under cool water while tossing, then drain well to remove excess surface starch.",
            "Spread the potatoes in a wide 7- to 8-quart Dutch oven. Add 1 1/2 cups water and 1 1/2 teaspoons salt, and scatter the butter on top. They will not be fully submerged.",
            { text: "Bring to a boil over medium-high heat. Cover, reduce to medium-low, and simmer, stirring occasionally, until the potatoes fall apart when pierced, about 25 to 30 minutes.", timer: { min: 25, max: 30, label: "Potatoes: covered simmer" } },
            { text: "Uncover and cook over medium heat, stirring only once or twice, until just a little starchy liquid remains, about 3 to 5 minutes.", timer: { min: 3, max: 5, label: "Potatoes: cook down" } },
            "Remove from heat and mash directly in the pot until smooth. Do not stir aggressively, or the potatoes get gluey.",
            "If serving immediately, mash in up to 1/2 cup boiling water until fluffy and spoonable. Season with salt and pepper. Transfer to a warmed serving bowl and top with chives."
          ]
        },
        {
          title: "Make-ahead",
          steps: [
            "Cool completely, cover, and refrigerate up to 2 days.",
            { text: "To reheat, put in a large saucepan with 3/4 cup water, cover, and heat over medium-low about 20 minutes, mashing occasionally rather than stirring.", timer: { min: 20, label: "Potatoes: reheat" } },
            "Add more water a few tablespoons at a time if needed."
          ]
        }
      ],
      notes: [
        {
          title: "",
          items: [
            "Use russets for this method.",
            "Use a wide Dutch oven, because evaporation is part of the recipe.",
            "Warm the serving bowl.",
            "Keep the flavor classic so the gravy stays the star."
          ]
        }
      ],
      credits: [
        { label: "Milk Street: Butter-Braised Mashed Potatoes", url: "https://www.177milkstreet.com/recipes/butter-braised-mashed-potatoes" }
      ]
    },

    {
      id: "mac",
      title: "Four-Cheese Baked Elbow Mac & Cheese",
      shortTitle: "Mac & Cheese",
      image: "images/mac-and-cheese.jpg",
      imageAlt: "Baked four-cheese elbow macaroni with a deeply golden breadcrumb and Parmesan crust in a large baking dish",
      palette: ["#B9650F", "#F2C04F"],
      intro: [
        "A Thanksgiving-scale variation on Alton Brown's baked mac technique, using elbow macaroni. Cheddar gives identity, Gruyere gives depth, mozzarella gives melt and stretch, and deli American keeps the sauce smooth and stable."
      ],
      callouts: [],
      stats: [
        ["Oven", "350°F"],
        ["Bake", "25 to 35 min"],
        ["Rest", "10 to 15 min"],
        ["Pasta", "18 oz elbows"]
      ],
      ingredients: [
        {
          title: "Pasta and sauce",
          items: [
            "18 oz elbow macaroni",
            "8 oz sharp cheddar, freshly grated",
            "6 oz Gruyere, freshly grated",
            "6 oz low-moisture whole-milk mozzarella, freshly grated",
            "4 oz deli American cheese, torn or chopped",
            "3 cups whole milk",
            "3 cups half-and-half",
            "2 shallots, finely minced",
            "2 tablespoons dry mustard",
            "2 bay leaves",
            { text: "Unsalted butter and all-purpose flour for the roux: amount to be confirmed", tbc: true },
            "2 eggs",
            "Sweet paprika and white or black pepper, to taste",
            "Kosher salt only after tasting the finished sauce"
          ]
        },
        {
          title: "Topping",
          items: [
            "1 cup panko",
            "1 cup plain regular breadcrumbs",
            "1/2 cup finely grated Parmesan",
            "4 tablespoons unsalted butter, melted",
            "Black pepper, and an optional small pinch of paprika"
          ]
        }
      ],
      method: [
        {
          title: "Method",
          steps: [
            "Heat the oven to 350°F and butter a large baking dish.",
            "Boil the macaroni in salted water until barely al dente. Drain well. It will keep cooking in the oven.",
            "Make a roux with butter and flour. Cook briefly to remove the raw-flour taste without browning deeply.",
            "Gradually whisk in the milk and half-and-half. Add the shallots, dry mustard, bay leaves, paprika and pepper. Simmer gently until the sauce coats a spoon.",
            "Remove the bay leaves and let the sauce cool slightly so cheese does not go into a boiling base.",
            "Temper the eggs with some warm sauce, then whisk them back in. Keep below a boil.",
            "Melt in the American cheese first. Add the Gruyere and cheddar gradually, then the mozzarella last. Stir gently over low or no heat until smooth. Do not boil once the cheese is in.",
            "Taste before adding salt. The cheeses already contribute plenty.",
            "Fold in the drained macaroni and transfer to the baking dish.",
            "Combine panko, regular breadcrumbs, Parmesan, melted butter, pepper and optional paprika. Scatter over the top.",
            { text: "Bake at 350°F until the edges bubble and the topping is deeply golden, about 25 to 35 minutes. If the center is hot but the top needs color, broil briefly while watching continuously.", timer: { min: 25, max: 35, label: "Mac & cheese: bake" } },
            { text: "Rest 10 to 15 minutes before serving.", timer: { min: 10, max: 15, label: "Mac & cheese: rest" } }
          ]
        }
      ],
      notes: [
        {
          title: "",
          items: [
            "Use low-moisture mozzarella, never fresh.",
            "Grate cheeses from blocks.",
            "American is there for a smooth emulsion.",
            "Parmesan belongs in the crust, not the sauce.",
            "Panko gives crunch and regular crumbs fill the gaps."
          ]
        }
      ],
      credits: [
        { label: "Alton Brown's baked mac technique (Thanksgiving-scale variation)" }
      ]
    },

    {
      id: "carrots",
      title: "Orange-Thyme Butter-Roasted Carrots",
      shortTitle: "Roasted Carrots",
      image: "images/carrots.jpg",
      imageAlt: "Deeply browned orange-thyme roasted carrots on a warm platter, finished with fresh thyme leaves",
      palette: ["#B4461A", "#F3A04F"],
      intro: [
        "Staged roasting adapted from Milk Street: oil first, then butter, thyme and zest late so they do not scorch."
      ],
      callouts: [],
      stats: [
        ["Yield", "About 8 to 10 servings"],
        ["Oven", "425°F"],
        ["Roast", "20–25 min, then 10–15 min"],
        ["Pan", "Large rimmed sheet, or two"]
      ],
      ingredients: [
        {
          title: "",
          items: [
            "2 1/2 to 3 lb carrots",
            "2 1/2 to 3 tablespoons extra-virgin olive oil or neutral oil",
            "Kosher salt (start with about 1 teaspoon) and black pepper",
            "3 tablespoons unsalted butter, melted",
            "1 orange (about 1 teaspoon zest plus 1 to 2 tablespoons juice)",
            "1 to 2 teaspoons fresh thyme leaves, plus a few sprigs",
            "Chopped flat-leaf parsley (optional)"
          ]
        }
      ],
      method: [
        {
          title: "How to cut the carrots",
          guide: "carrots",
          intro: "The goal is uniform thickness, not identical length.",
          steps: [
            "Peel and trim the stem ends.",
            "Slender carrots under about 1/2 inch thick: leave whole lengthwise. Cut very long ones once crosswise on a sharp diagonal.",
            "Medium carrots, 1/2 to 1 inch thick: halve crosswise on a diagonal. If the wide top section is noticeably thicker than the tapered end, halve that top section lengthwise.",
            "Large carrots over 1 inch thick: halve crosswise, then quarter the thick upper section lengthwise. Halve or quarter the narrower end as needed.",
            "Check: lay a few pieces side by side. Most should be about 1/2 to 3/4 inch thick at the widest point. If one is twice as thick as its neighbors, split it lengthwise."
          ]
        },
        {
          title: "Method",
          steps: [
            "Heat the oven to 425°F. Use a large rimmed sheet pan, or two pans rather than crowding.",
            "Toss the carrots with the oil, about 1 teaspoon salt, and pepper. Spread in a single layer with flat cut sides down.",
            { text: "Roast until browning has started and the carrots are approaching tender, about 20 to 25 minutes, turning once.", timer: { min: 20, max: 25, label: "Carrots: first roast" } },
            "Meanwhile melt the butter, zest the orange (about 1 teaspoon), and strip the thyme leaves.",
            { text: "Toss the carrots with the butter, thyme and zest. Return to the oven 10 to 15 minutes, until deeply browned and a knife enters the thickest pieces easily.", timer: { min: 10, max: 15, label: "Carrots: butter, thyme, zest" } },
            "Squeeze 1 to 2 tablespoons orange juice over the hot carrots, toss, taste, and adjust salt and pepper.",
            "Transfer to a warm platter. Finish with parsley or a few thyme leaves."
          ]
        }
      ],
      notes: [
        {
          title: "",
          items: [
            "No honey, maple or brown sugar, since proper roasting concentrates enough sweetness for this rich menu.",
            "Oil first, butter later.",
            "Orange is there for balance against the butter, cheese and gravy."
          ]
        }
      ],
      credits: [
        { label: "Milk Street: carrots for the Thanksgiving table", url: "https://www.177milkstreet.com/stories/11-2024-make-carrots-the-most-exciting-side-on-your-thanksgiving-table" },
        { label: "America's Test Kitchen: cutting carrots for roasting", url: "https://www.americastestkitchen.com/how_tos/5794-cutting-carrots-for-roasting" }
      ]
    },

    {
      id: "gravy",
      title: "Deep Turkey Gravy",
      subtitle: "backbone stock + pan drippings + roux",
      shortTitle: "Gravy",
      image: "images/gravy.jpg",
      imageAlt: "Glossy, deep brown turkey gravy in a gravy boat next to sliced roast turkey",
      palette: ["#3F2414", "#9C6337"],
      intro: [],
      callouts: [
        { label: "Enhanced-turkey salt rule", tone: "alert", text: "Do not salt the stock, use unsalted butter, and if the reduced drippings taste aggressively salty, dilute with unsalted stock or water BEFORE adding the roux." }
      ],
      stats: [
        ["Yield", "About 4 cups"],
        ["Stock", "Simmer 1 1/2 to 2 hours"],
        ["Thickener", "Butter and flour roux"],
        ["When", "During the turkey's rest"]
      ],
      ingredients: [
        {
          title: "Stock",
          items: [
            "Turkey backbone, chopped into several pieces",
            "Turkey neck, cut into 2 to 3 pieces",
            "Wing tips, if removed",
            "1 small onion, 1 carrot, 1 celery stalk, all roughly chopped",
            "2 sprigs thyme, 1 small sprig rosemary, 2 to 3 sage leaves",
            "1 bay leaf",
            "6 to 8 whole black peppercorns",
            "Water to cover by about 1 inch",
            "A little neutral oil for browning"
          ]
        },
        {
          title: "Finished gravy",
          items: [
            "All strained turkey pan drippings and juices",
            "Prepared turkey stock",
            "4 tablespoons unsalted butter",
            "1/4 cup all-purpose flour",
            "Freshly ground black pepper",
            "Kosher salt only after tasting"
          ]
        }
      ],
      method: [
        {
          title: "While the turkey roasts, make the stock",
          steps: [
            "Chop the backbone and cut the neck into pieces.",
            "In a Dutch oven or stockpot over medium-high heat, lightly coat the bottom with neutral oil and deeply brown the backbone, neck and wing tips on multiple sides.",
            "Add the onion, carrot and celery and cook until well browned.",
            "Add the thyme, rosemary, sage, bay leaf and peppercorns.",
            "Add water to cover by about 1 inch. Bring to a boil, then drop to a gentle simmer.",
            { text: "Simmer 1 1/2 to 2 hours, skimming foam as needed.", timer: { min: 90, max: 120, label: "Stock: simmer" } },
            "Strain through a fine-mesh strainer. Do NOT salt the stock."
          ]
        },
        {
          title: "When the turkey comes out",
          steps: [
            "Move the turkey to rest.",
            "Scrape the pan juices and vegetables into a fine-mesh strainer over a bowl or large measuring cup.",
            "Press firmly on the vegetables with the back of a ladle to extract the liquid.",
            "Let it settle and skim excess fat, keeping a little for flavor."
          ]
        },
        {
          title: "Build the gravy (during the turkey's 30 to 45 minute rest)",
          steps: [
            "Combine the strained pan liquid with enough stock for about 4 1/2 to 5 cups total.",
            "Simmer and reduce to about 4 cups, tasting as it reduces.",
            { text: "In a separate saucepan melt 4 tablespoons unsalted butter, whisk in 1/4 cup flour, and cook 3 to 5 minutes until smooth and lightly toasted.", timer: { min: 3, max: 5, label: "Gravy: roux" } },
            "Whisk about 1 cup hot turkey liquid into the roux until smooth, then gradually whisk in the rest.",
            { text: "Simmer gently 5 to 10 minutes, whisking, until it coats a spoon but still pours easily. It will thicken as it cools, so keep it slightly thin.", timer: { min: 5, max: 10, label: "Gravy: simmer" } },
            "Add pepper. Taste before adding any salt.",
            "If too thick, whisk in hot unsalted stock or water a few tablespoons at a time. If too thin, simmer longer."
          ]
        }
      ],
      notes: [
        {
          title: "",
          items: [
            "This is a roux gravy, not cornstarch.",
            "Keep a small pot of hot unsalted stock ready for final adjustments.",
            "The turkey's rest period is gravy time."
          ]
        }
      ],
      credits: [
        { label: "Milk Street: best turkey gravy", url: "https://www.177milkstreet.com/stories/best-turkey-gravy-recipe" },
        { label: "Alton Brown: best Thanksgiving gravy ever", url: "https://altonbrown.com/recipes/best-thanksgiving-gravy-ever/" }
      ]
    }
  ],

  // ---------------------------------------------------------------------------
  // COOK TAB: Section 8 cook-day quick reference
  // ---------------------------------------------------------------------------
  cookReference: {
    tiles: [
      { value: "425°F", label: "Oven: turkey and carrots" },
      { value: "350°F", label: "Oven: mac & cheese" },
      { value: "155–160°F", label: "Pull: deepest breast" },
      { value: "175°F+", label: "Pull: thigh, and tender" }
    ],
    lines: [
      { label: "Oven", text: "425°F for turkey and carrots, 350°F for mac & cheese" },
      { label: "Turkey", text: "Start temping at about 90 minutes. Pull at breast 155 to 160°F and thigh at least 175°F. Rest 30 to 45 minutes.",
        timers: [{ min: 90, label: "Turkey: first temp check" }, { min: 30, label: "Turkey: rest" }] },
      { label: "Mac & cheese", text: "Bake 25 to 35 minutes, rest 10 to 15 minutes",
        timers: [{ min: 25, label: "Mac & cheese: bake" }, { min: 10, label: "Mac & cheese: rest" }] },
      { label: "Carrots", text: "20 to 25 minutes, then 10 to 15 minutes more after adding butter, thyme and zest",
        timers: [{ min: 20, label: "Carrots: first roast" }, { min: 10, label: "Carrots: butter, thyme, zest" }] },
      { label: "Potatoes", text: "25 to 30 minutes covered, then 3 to 5 minutes uncovered",
        timers: [{ min: 25, label: "Potatoes: covered simmer" }, { min: 3, label: "Potatoes: cook down" }] },
      { label: "Stock", text: "Simmer 1 1/2 to 2 hours",
        timers: [{ min: 90, label: "Stock: simmer" }] },
      { label: "Salt rule", text: "The turkey is enhanced, so nothing gets extra salt until tasted", strong: true }
    ]
  },

  // ---------------------------------------------------------------------------
  // GAME PLAN (Plan tab). Clock times are computed backward from the serving
  // time you enter. Durations below are minutes; the "Adjust timings" panel in
  // the app overrides the adjustable ones on your phone.
  // Text may use {placeholders} that are filled in from the timings.
  // ---------------------------------------------------------------------------
  plan: {
    defaults: {
      servingTime: "16:00",   // 24-hour clock, 4:00 PM
      ovenPlan: "two-rack",   // recommended option (shown as a preview until you choose)
      potatoesAhead: false,   // true = make the mashed potatoes on Wednesday
      roast: 120,     // planned turkey roast time (estimate; cook to temperature)
      rest: 40,       // turkey rest before carving (recipe: 30 to 45)
      carve: 15,      // carving and platter time
      carrots1: 22,   // carrots, first roast (recipe: 20 to 25)
      carrots2: 12,   // carrots, after butter, thyme, zest (recipe: 10 to 15)
      macBake: 30,    // mac & cheese bake (recipe: 25 to 35)
      macRest: 12,    // mac & cheese rest (recipe: 10 to 15)
      ovenDown: 8,    // 425°F to 350°F with the door cracked
      ovenUp: 10      // 350°F back up to 425°F
    },
    fixed: {
      prepAhead: 60, fridgeOut: 60, preheat: 30, panSetup: 15, firstCheck: 90,
      stockBrown: 20, stockSimmer: 90, stockStrain: 10,
      panStrain: 10, gravyReduce: 15, roux: 5, gravySimmer: 10,
      potatoPeel: 75, potatoStart: 48, potatoUncover: 12, potatoMash: 7, potatoReheat: 25,
      macPrep: 60, carrotPrep: 20, rewarm: 7, carrotFinish: 3, secondOvenHeat: 20
    },

    ovenConflict: "Carrots roast at 425°F while mac & cheese bakes at 350°F, and both want the oven after the turkey comes out.",

    ovenOptions: [
      {
        id: "two-rack",
        letter: "A",
        name: "Two racks, then 350°F",
        recommended: true,
        sequence: "Carrots roast on an upper rack during the turkey's last stretch at 425°F. When the turkey comes out, crack the oven door, drop to 350°F and bake the mac during the rest. The carrots get a short re-warm before serving.",
        why: "Keeps the turkey rest at 30 to 45 minutes with only one temperature change, and the mac's rest overlaps carving.",
        watch: "Both pans must fit at once, so test-fit them on Wednesday. If the turkey is done early, pull it and let the carrots finish alone at 425°F."
      },
      {
        id: "carrots-first",
        letter: "B",
        name: "Carrots first, then 350°F for the mac",
        sequence: "Turkey out, carrots in at 425°F while it rests, then drop to 350°F and bake the mac.",
        why: "One rack and one temperature change.",
        watch: "Carrots and mac run back to back, so the turkey has to come out earlier and rests well past 45 minutes, and the carrots need a re-warm."
      },
      {
        id: "mac-first",
        letter: "C",
        name: "Mac first, then back up to 425°F",
        sequence: "Turkey out, drop to 350°F for the mac, then back up to 425°F so the carrots come out last and hot.",
        why: "Carrots go straight from the oven to the table, and mac holds heat well.",
        watch: "Two temperature changes, a long turkey rest, and the mac waits about 45 minutes."
      },
      {
        id: "second-oven",
        letter: "D",
        name: "Second oven for the mac",
        sequence: "The main oven stays at 425°F for the carrots during the turkey's rest; the mac bakes at 350°F in a second oven or a countertop oven that fits the dish.",
        why: "No conflict: everything comes out hot and the turkey rest stays at 30 to 45 minutes.",
        watch: "Only works if you have a second oven that fits a large baking dish."
      }
    ],

    // Wednesday list. "when" is a suggestion; these don't depend on serving time.
    dayBefore: [
      { when: "Afternoon", dish: "turkey", title: "Spatchcock the turkey", detail: "Remove the backbone, flatten the bird and press firmly on the breastbone. Reserve the backbone, neck and wing tips for gravy stock." },
      { when: "Afternoon", dish: "turkey", title: "No dry brine, no added salt, no injection", detail: "The turkey already contains a salt solution." },
      { when: "By evening", dish: "turkey", title: "Pat very dry and refrigerate uncovered on a rack overnight", detail: "This dries the skin." },
      { when: "Any time", dish: "potatoes", onlyIf: "potatoesAhead", title: "Make the mashed potatoes ahead", detail: "Cook through step 5, then cool completely, cover and refrigerate (up to 2 days)." },
      { when: "Optional", dish: "potatoes", onlyIfNot: "potatoesAhead", title: "Optional: make the mashed potatoes ahead", detail: "Up to 2 days ahead. Turn on \"Make the potatoes ahead\" above to plan for it." },
      { when: "Any time", onlyIfOven: "two-rack", title: "Test-fit the pans", detail: "Roasting pan on the lowest rack and a rimmed sheet pan on an upper rack, both in the oven at once." },
      { when: "Any time", onlyIfOven: "second-oven", title: "Check the mac & cheese dish fits the second oven", detail: "" }
    ],

    // Thanksgiving Day wording. Times are computed in the app.
    events: {
      prepAhead:   { dish: "", title: "Get ahead on prep", detail: "Grate the cheeses from the blocks, mince the shallots, peel and cut the carrots (see How to cut), and chop the backbone and neck for stock." },
      fridgeOut:   { dish: "turkey", title: "Turkey out of the fridge", detail: "About 1 hour before roasting." },
      preheat:     { dish: "turkey", title: "Heat the oven to 425°F", detail: "Rack in the lowest practical position.", twoRackDetail: "Rack in the lowest practical position, plus a second rack in the upper-middle position for the carrots." },
      panSetup:    { dish: "turkey", title: "Build the roasting pan", detail: "Carrots, celery, onion, garlic and herb sprigs with about 1 cup water or unsalted/very low-sodium broth. Turkey skin-side up on top; light coat of neutral oil, black pepper only." },
      turkeyIn:    { dish: "turkey", title: "Turkey into the 425°F oven", detail: "Cook by internal temperature, not time." },
      stockStart:  { dish: "gravy", title: "Start the gravy stock", detail: "Brown the backbone, neck and wing tips in a little oil, then the onion, carrot and celery. Add the herbs, bay leaf, peppercorns and water to cover by about 1 inch." },
      stockSimmer: { dish: "gravy", title: "Stock at a gentle simmer", detail: "Simmer 1 1/2 to 2 hours, skimming foam as needed." },
      firstCheck:  { dish: "turkey", title: "First temperature check", detail: "Pull at 155 to 160°F in the deepest breast and at least 175°F in the thigh. If the pan is drying out, add water or broth 1/2 cup at a time." },
      stockStrain: { dish: "gravy", title: "Strain the stock", detail: "Do NOT salt it. Keep a small pot of it hot for final gravy adjustments." },
      turkeyOut:   { dish: "turkey", title: "Turkey out to rest", detail: "Breast 155 to 160°F, thigh 175°F+ and tender. Rest until carving at {carveTime}." },
      panStrain:   { dish: "gravy", title: "Strain the pan juices", detail: "Scrape juices and vegetables into a fine-mesh strainer, press with a ladle, let settle and skim excess fat (keep a little)." },
      gravyReduce: { dish: "gravy", title: "Gravy: combine and reduce", detail: "Pan liquid plus stock to about 4 1/2 to 5 cups; reduce to about 4 cups, tasting as it goes. Too salty? Dilute with unsalted stock or water BEFORE the roux." },
      roux:        { dish: "gravy", title: "Gravy: make the roux", detail: "4 tablespoons unsalted butter and 1/4 cup flour, 3 to 5 minutes until smooth and lightly toasted." },
      gravySimmer: { dish: "gravy", title: "Gravy: whisk in the liquid and simmer", detail: "About 1 cup first, then the rest. Simmer 5 to 10 minutes and keep it slightly thin." },
      gravyDone:   { dish: "gravy", title: "Gravy: pepper, taste, hold hot", detail: "Taste before adding any salt. Thin with hot unsalted stock a few tablespoons at a time if needed." },
      carve:       { dish: "turkey", title: "Carve the turkey", detail: "" },
      serve:       { dish: "", title: "Serve", detail: "Happy Thanksgiving." },

      potatoPeel:    { dish: "potatoes", title: "Peel and cut the potatoes", detail: "3 lb russets, 1-inch chunks." },
      potatoStart:   { dish: "potatoes", title: "Potatoes on", detail: "Rinse and drain, then into the wide Dutch oven with 1 1/2 cups water, 1 1/2 teaspoons salt and the butter on top. Boil, cover and simmer on medium-low 25 to 30 minutes." },
      potatoUncover: { dish: "potatoes", title: "Potatoes: uncover and cook down", detail: "3 to 5 minutes, until just a little starchy liquid remains." },
      potatoMash:    { dish: "potatoes", title: "Mash the potatoes", detail: "Mash in the pot, loosen with up to 1/2 cup boiling water, season, then into a warmed bowl with chives." },
      potatoReheat:  { dish: "potatoes", title: "Reheat the potatoes", detail: "Large saucepan with 3/4 cup water, covered, medium-low about 20 minutes, mashing occasionally rather than stirring." },

      macPrep:     { dish: "mac", title: "Make the mac & cheese", detail: "Butter the dish, boil the macaroni barely al dente, make the sauce, temper in the eggs, melt in the cheeses (American first, mozzarella last), fold in the pasta and add the topping. It waits for the oven." },
      macIn:       { dish: "mac", title: "Mac & cheese into the 350°F oven", detail: "Bake until the edges bubble and the topping is deeply golden (25 to 35 minutes)." },
      macOut:      { dish: "mac", title: "Mac & cheese out to rest", detail: "Rest 10 to 15 minutes before serving." },
      macOutHold:  { dish: "mac", title: "Mac & cheese out; hold it warm", detail: "Tent loosely with foil. It holds heat well." },

      carrotPrep:  { dish: "carrots", title: "Carrots ready to roast", detail: "Toss with the oil, about 1 teaspoon salt and pepper; single layer, flat sides down. Melt the butter, zest the orange, strip the thyme." },
      carrotsIn:   { dish: "carrots", title: "Carrots into the 425°F oven", detail: "Roast {carrots1} minutes, turning once.", twoRackDetail: "Upper rack while the turkey finishes. Roast {carrots1} minutes, turning once." },
      carrotsToss: { dish: "carrots", title: "Carrots: butter, thyme and zest", detail: "Toss and return for {carrots2} minutes, until deeply browned and knife-tender." },
      carrotsOut:  { dish: "carrots", title: "Carrots out; hold on the pan", detail: "They get a short re-warm before serving." },
      rewarm:      { dish: "carrots", title: "Carrots back in to re-warm", detail: "{rewarm} minutes at 350°F." },
      carrotFinish:{ dish: "carrots", title: "Finish the carrots", detail: "1 to 2 tablespoons orange juice, toss, taste, adjust salt and pepper; warm platter, parsley or thyme." },

      ovenDown:    { dish: "", title: "Oven down to 350°F", detail: "Set it to 350°F and crack the door for a few minutes." },
      ovenUp:      { dish: "", title: "Oven back up to 425°F", detail: "Close the door and set it to 425°F for the carrots." },
      secondOven:  { dish: "mac", title: "Heat the second oven to 350°F", detail: "" }
    }
  },

  // ---------------------------------------------------------------------------
  // NOTES TAB
  // ---------------------------------------------------------------------------
  openItems: [
    { text: "Butter and flour quantities for the mac & cheese roux are not yet set." },
    { text: "Confirm the chicken broth at home is unsalted or very low-sodium." },
    { text: "Confirm carrot and onion quantities at home." },
    { text: "Add the five food photos to the images folder.", hint: "photos" },
    { text: "Decide the target serving time.", hint: "servingTime" },
    { text: "Resolve the oven sequencing (carrots at 425°F and mac at 350°F).", hint: "ovenPlan" }
  ],

  // Reminders are quoted from the recipes above.
  reminders: [
    "Salt rule: the turkey is enhanced, so nothing gets extra salt until tasted.",
    "Use unsalted or very low-sodium liquid in the pan and stock.",
    "Keep enough liquid in the pan to prevent blackened drippings. Dark brown is flavor; black is ruined gravy.",
    "The turkey's rest period is gravy time.",
    "Keep a small pot of hot unsalted stock ready for final adjustments.",
    "Use low-moisture mozzarella, never fresh.",
    "Warm the serving bowl.",
    "Oil first, butter later."
  ],

  // ---------------------------------------------------------------------------
  // SOURCE CREDITS (footer)
  // ---------------------------------------------------------------------------
  credits: [
    { label: "Milk Street (mashed potatoes)", url: "https://www.177milkstreet.com/recipes/butter-braised-mashed-potatoes" },
    { label: "Milk Street (carrots)", url: "https://www.177milkstreet.com/stories/11-2024-make-carrots-the-most-exciting-side-on-your-thanksgiving-table" },
    { label: "Milk Street (gravy)", url: "https://www.177milkstreet.com/stories/best-turkey-gravy-recipe" },
    { label: "America's Test Kitchen (carrot cutting)", url: "https://www.americastestkitchen.com/how_tos/5794-cutting-carrots-for-roasting" },
    { label: "Alton Brown (gravy)", url: "https://altonbrown.com/recipes/best-thanksgiving-gravy-ever/" }
  ]
};
