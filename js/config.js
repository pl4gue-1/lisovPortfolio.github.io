/* Данные сайта.
   Здесь только контент: ссылки, работы, кейсы.
   Внешний вид правится в css/style.css, тексты — в js/i18n.js. */

window.SITE = {

  /* Контакты. Меняются здесь — обновятся и кадила, и строки внизу. */
  contacts: {
    instagram: "https://www.instagram.com/",
    telegram: "https://t.me/",
    email: "mailto:hello@example.com"
  },

  /* Работы в лентах. Ключи = data-ribbon у секций.
     Формат: { img: "Assets/works/файл.jpg", ru: "Название", en: "Title" }
     Пути — только относительные, от корня сайта. */
  works: {
    modeling: [
      { img: "Assets/works/pizzaMan1.png", ru: "ПиццаЧел", en: "PizzaMan" },
      { img: "Assets/works/Portf1.png", ru: "Негодник", en: "mischief" },
      { img: "Assets/works/мудя.png", ru: "Чревовещатель", en: "Ventriloquist" },
      { img: "Assets/works/duo1.png", ru: "Близнецы", en: "Gemini" },
      { img: "Assets/works/tower.png", ru: "Башня", en: "Tower" }
    ],
    garments: [
      { img: "Assets/works/garments/garment1.png", ru: "Белорусский трикотаж №1", en: "Couture No.1" },
      { img: "Assets/works/garments/garment2.png", ru: "Белорусский трикотаж №2", en: "Couture No.2" },
	{ img: "Assets/works/garments/garment3.png", ru: "Белорусский трикотаж №3", en: "Couture No.3" },
    ],
    vfx: [
      { img: "Assets/works/vfx/theatre.gif", ru: "Театр", en: "Theatre" },
      { img: "Assets/works/vfx/INST1.gif", ru: "Хочу в Тайланд", en: "Thai" },
      { img: "Assets/works/vfx/joys.gif", ru: "Трип ротейшн", en: "Trip" },
      { img: "Assets/works/vfx/mirror.gif", ru: "Мост", en: "Bridge" },
      { img: "Assets/works/vfx/duo.gif", ru: "Дуэт", en: "Duetto" }
    ],
    post: [
      { img: "Assets/works/post/ffff.png", ru: "1", en: "1" },
      { img: "Assets/works/post/сфинкс2.png", ru: "2", en: "2" },
      { img: "Assets/works/post/VSJtrible.png", ru: "3", en: "3" },
      { img: "Assets/works/post/синтониДвор.png", ru: "4", en: "4" },
      { img: "Assets/works/post/Weapon2.png", ru: "5", en: "5" },
      { img: "Assets/works/post/Эмо2.png", ru: "6", en: "6" }
    ]
  },

  /* Кейсы. Формат: { img: "...", ru: "...", en: "...", tag: "3D + VFX" } */
  cases: [
    { img: "Assets/works/cases/Ikarus1.jpg", ru: "Ikarus", en: "Ikarus", tag: "3D + Post" },
    { img: "Assets/works/cases/sdf.gif", ru: "PRETEND", en: "PRETEND", tag: "VFX" }
  ]
};
