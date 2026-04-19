import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { Question } from "@shared/types";

export type Lang = "ru" | "uz";

type I18nValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  value,
  children,
}: {
  value: I18nValue;
  children: ReactNode;
}) {
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return value;
}

export function getQuestionCopy(question: Question, lang: Lang) {
  const translated = question.translations?.[lang];
  return {
    text: translated?.text ?? question.text,
    options: translated?.options ?? question.options,
    hint: translated?.hint ?? question.hint,
  };
}

export const t = {
  ru: {
    languageLabel: "Язык",
    lightTheme: "Светлая тема",
    darkTheme: "Тёмная тема",
    backHome: "← На главную",
    room: "Комната",
    homeKicker: "Игровая викторина для класса",
    homeTitle: "Вектор-баттл",
    homeText:
      "Яркая математическая игра для детей: две команды, быстрые ответы, большой экран, дружелюбный персонаж и понятные подсказки без перегруза.",
    createRoom: "Новая игра (экран учителя)",
    startShort: "Начать",
    creatingRoom: "Создаём комнату…",
    teacherDirectory: "Справочник классов и ФИО (заранее)",
    teacherSettings: "Классы",
    rankingShort: "Рейтинг",
    rankingsTitleLink: "Таблица рейтингов",
    homeFooter:
      "Ученики подключаются по QR-коду, выбирают команду и отвечают прямо со своих телефонов.",
    loading: "Загрузка…",
    teamInvalidLink: "Неверная ссылка команды.",
    blueTeam: "Синие",
    redTeam: "Красные",
    blueVector: "Синий вектор",
    redVector: "Красный вектор",
    joinIntro:
      "Подключайтесь спокойно: экран стал компактнее, а ответы помещаются удобнее даже на небольшом телефоне.",
    chooseTeam: "Выберите команду",
    chooseTeamText: "После входа свободна только одна сторона: если синяя уже занята, выбирайте красную.",
    teamBusy: "Эта команда уже занята",
    teamFree: "Свободна для входа",
    enterBlue: "Войти за синих",
    enterRed: "Войти за красных",
    teamBusyShort: "занято",
    assembleTeam: "Соберите команду",
    assembleText:
      "Сначала выберите образ команды, затем быстро заполните участников и нажмите готовность.",
    teamAvatar: "Аватар команды",
    classFromDirectory: "Класс из справочника",
    choose: "— выбрать —",
    studentsShort: "уч.",
    classLabel: "Класс",
    groupName: "Название группы",
    members: "Участники",
    addMember: "+ Добавить участника",
    memberPlaceholder: (n: number) => `Ученик ${n}`,
    readyTitle: "Мы готовы",
    readyText: "Можно начинать, когда подключится вторая команда.",
    questionOf: (index: number, total: number) => `Вопрос ${index} из ${total}`,
    answerSent: "Ответ отправлен. Ждём вторую команду…",
    countingOnScreen: "Идёт подсчёт на большом экране…",
    gameFinished: "Игра окончена. Смотрите итог на экране учителя.",
    rating: "Рейтинг",
    teacherTitle: "Справочник классов и ФИО",
    teacherText:
      "Учитель заполняет список заранее. На телефонах ученики смогут выбрать класс и подставить фамилии одним нажатием.",
    newClass: "Новый класс",
    removeClass: "Удалить класс",
    students: "Ученики",
    studentName: "ФИО",
    addStudent: "+ Ученик",
    addClass: "+ Класс",
    saving: "Сохранение…",
    save: "Сохранить",
    rankingsTitle: "Зал достижений",
    rankingsText:
      "После каждой игры результат сохраняется автоматически. Вместо сухой таблицы здесь теперь карточки с понятной подачей команды, очков и участников.",
    noRecords: "Пока нет записей.",
    classWord: "Класс",
    roomWord: "Комната",
    membersMissing: "Участники не указаны",
    points: "очков",
    arenaTitle: "Экран для класса",
    arenaText:
      "Один QR-код ведёт на экран выбора команды. Как только одна сторона занята, второй команде остаётся только свободная.",
    waitQr: "Ждём подключения по QR",
    oneQrTitle: "Один QR для входа",
    scanQrText: "Ученики сканируют код и внутри выбирают свободную команду.",
    onlineFilling: "Онлайн — заполняют анкету",
    onlineReady: "Онлайн и готовы к старту",
    blueAnswered: "Синие ответили!",
    redAnswered: "Красные ответили!",
    blueWaiting: "Синие…",
    redWaiting: "Красные…",
    waitRed: "Ждём красных",
    waitBlue: "Ждём синих",
    waitingAnswer: "ожидание ответа",
    gameOver: "Игра окончена",
    roundOf: (current: number, total: number) => `Раунд ${current} / ${total}`,
    blueStatus: "Синие",
    redStatus: "Красные",
    waitingOnline: "ждём в сети",
    online: "онлайн",
    readyShort: "готовы ✓",
    waitReady:
      "Дождитесь, пока обе команды отметят «Мы готовы» — или начните, когда будете уверены.",
    startGame: "Начать игру",
    maybeBeforeReady: " (можно и до «готовы» у всех)",
    correctOption: "Верный вариант",
    nextQuestion: "Следующий вопрос",
    draw: "Ничья!",
    winners: "Победили:",
    rankingSaved: "Результаты сохранены в таблице рейтингов.",
    openRanking: "Открыть рейтинг",
    correct: "Верно",
    wrong: "Ошибка",
    fastest: "Самые быстрые",
    time: "Время",
    score: "Очки",
    chosenAnswer: "Выбранный ответ",
    noAnswer: "Ответ не выбран",
  },
  uz: {
    languageLabel: "Til",
    lightTheme: "Yorug' mavzu",
    darkTheme: "Qorong'i mavzu",
    backHome: "← Bosh sahifa",
    room: "Xona",
    homeKicker: "Sinf uchun o'yin viktorinasi",
    homeTitle: "Vektor-battl",
    homeText:
      "Bolalar uchun yorqin matematik o'yin: ikki jamoa, tezkor javoblar, katta ekran, do'stona personaj va ortiqcha yuklamasiz tushunarli ko'rsatmalar.",
    createRoom: "Yangi o'yin (o'qituvchi ekrani)",
    startShort: "Boshlash",
    creatingRoom: "Xona yaratilmoqda…",
    teacherDirectory: "Sinflar va F.I.Sh. ro'yxati",
    teacherSettings: "Sinflar",
    rankingShort: "Reyting",
    rankingsTitleLink: "Natijalar jadvali",
    homeFooter:
      "O'quvchilar QR-kod orqali ulanadi, jamoani tanlaydi va telefonidan javob beradi.",
    loading: "Yuklanmoqda…",
    teamInvalidLink: "Jamoa havolasi noto'g'ri.",
    blueTeam: "Ko'klar",
    redTeam: "Qizillar",
    blueVector: "Ko'k vektor",
    redVector: "Qizil vektor",
    joinIntro:
      "Bemalol ulang: ekran ixchamlashtirildi va javoblar kichik telefonlarda ham qulay joylashadi.",
    chooseTeam: "Jamoani tanlang",
    chooseTeamText: "Kirishdan keyin faqat bo'sh tomon tanlanadi: agar ko'k band bo'lsa, qizilni tanlang.",
    teamBusy: "Bu jamoa allaqachon band",
    teamFree: "Kirish uchun bo'sh",
    enterBlue: "Ko'klar safida kirish",
    enterRed: "Qizillar safida kirish",
    teamBusyShort: "band",
    assembleTeam: "Jamoani yig'ing",
    assembleText:
      "Avval jamoa obrazini tanlang, keyin ishtirokchilarni tez kiriting va tayyorlikni belgilang.",
    teamAvatar: "Jamoa avatari",
    classFromDirectory: "Ro'yxatdan sinfni tanlang",
    choose: "— tanlang —",
    studentsShort: "o'q.",
    classLabel: "Sinf",
    groupName: "Guruh nomi",
    members: "Ishtirokchilar",
    addMember: "+ Ishtirokchi qo'shish",
    memberPlaceholder: (n: number) => `O'quvchi ${n}`,
    readyTitle: "Biz tayyormiz",
    readyText: "Ikkinchi jamoa ulangach boshlash mumkin.",
    questionOf: (index: number, total: number) => `${index}/${total} savol`,
    answerSent: "Javob yuborildi. Ikkinchi jamoani kutamiz…",
    countingOnScreen: "Katta ekranda hisob-kitob ketmoqda…",
    gameFinished: "O'yin tugadi. Yakuniy natijani o'qituvchi ekranida ko'ring.",
    rating: "Reyting",
    teacherTitle: "Sinflar va F.I.Sh. ma'lumotnomasi",
    teacherText:
      "O'qituvchi ro'yxatni oldindan to'ldiradi. Telefonlarda o'quvchilar sinfni tanlab, familiyalarni bir bosishda qo'shishi mumkin.",
    newClass: "Yangi sinf",
    removeClass: "Sinfni o'chirish",
    students: "O'quvchilar",
    studentName: "F.I.Sh.",
    addStudent: "+ O'quvchi",
    addClass: "+ Sinf",
    saving: "Saqlanmoqda…",
    save: "Saqlash",
    rankingsTitle: "Yutuqlar zali",
    rankingsText:
      "Har bir o'yindan keyin natija avtomatik saqlanadi. Quruq jadval o'rniga endi jamoa, ball va ishtirokchilar tushunarli kartochkalarda ko'rsatiladi.",
    noRecords: "Hozircha yozuvlar yo'q.",
    classWord: "Sinf",
    roomWord: "Xona",
    membersMissing: "Ishtirokchilar ko'rsatilmagan",
    points: "ball",
    arenaTitle: "Sinf uchun ekran",
    arenaText:
      "Bitta QR-kod jamoa tanlash ekraniga olib kiradi. Bir tomon band bo'lsa, ikkinchi jamoaga faqat bo'sh tomon qoladi.",
    waitQr: "QR orqali ulanish kutilmoqda",
    oneQrTitle: "Kirish uchun bitta QR",
    scanQrText: "O'quvchilar kodni skaner qiladi va ichkarida bo'sh jamoani tanlaydi.",
    onlineFilling: "Onlayn — anketa to'ldirilmoqda",
    onlineReady: "Onlayn va startga tayyor",
    blueAnswered: "Ko'klar javob berdi!",
    redAnswered: "Qizillar javob berdi!",
    blueWaiting: "Ko'klar…",
    redWaiting: "Qizillar…",
    waitRed: "Qizillarni kutamiz",
    waitBlue: "Ko'klarni kutamiz",
    waitingAnswer: "javob kutilmoqda",
    gameOver: "O'yin tugadi",
    roundOf: (current: number, total: number) => `${current} / ${total} raund`,
    blueStatus: "Ko'klar",
    redStatus: "Qizillar",
    waitingOnline: "tarmoqda kutilmoqda",
    online: "onlayn",
    readyShort: "tayyor ✓",
    waitReady:
      "Ikkala jamoa ham «Biz tayyormiz»ni belgilasin yoki tayyor bo'lsangiz o'zingiz boshlang.",
    startGame: "O'yinni boshlash",
    maybeBeforeReady: " (hamma tayyor bo'lmasa ham mumkin)",
    correctOption: "To'g'ri variant",
    nextQuestion: "Keyingi savol",
    draw: "Durang!",
    winners: "G'oliblar:",
    rankingSaved: "Natijalar reyting jadvaliga saqlandi.",
    openRanking: "Reytingni ochish",
    correct: "To'g'ri",
    wrong: "Xato",
    fastest: "Eng tezkorlar",
    time: "Vaqt",
    score: "Ball",
    chosenAnswer: "Tanlangan javob",
    noAnswer: "Javob tanlanmagan",
  },
} as const;
