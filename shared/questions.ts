import type { Question } from "./types";

/** Системные вопросы по векторам с RU/UZ локализацией */
export const VECTOR_QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "Vektor nima?",
    options: [
      "Faqat son",
      "Yo'nalishga ega kesma",
      "Faqat uzunlik",
      "Nuqta",
    ],
    correctIndex: 1,
    translations: {
      ru: {
        text: "Что такое вектор?",
        options: [
          "Только число",
          "Отрезок, имеющий направление",
          "Только длина",
          "Точка",
        ],
      },
      uz: {
        text: "Vektor nima?",
        options: [
          "Faqat son",
          "Yo'nalishga ega kesma",
          "Faqat uzunlik",
          "Nuqta",
        ],
      },
    },
  },
  {
    id: "q2",
    text: "Vektorning asosiy xususiyatlari qaysilar?",
    options: [
      "Rang va shakl",
      "Uzunlik va yo'nalish",
      "Faqat koordinata",
      "Faqat uzunlik",
    ],
    correctIndex: 1,
    translations: {
      ru: {
        text: "Какие основные свойства вектора?",
        options: [
          "Цвет и форма",
          "Длина и направление",
          "Только координата",
          "Только длина",
        ],
      },
      uz: {
        text: "Vektorning asosiy xususiyatlari qaysilar?",
        options: [
          "Rang va shakl",
          "Uzunlik va yo'nalish",
          "Faqat koordinata",
          "Faqat uzunlik",
        ],
      },
    },
  },
  {
    id: "q3",
    text: "Agar a = (2;3), b = (1;4) bo'lsa, a + b ni toping",
    options: ["(3;7)", "(1;1)", "(2;7)", "(3;1)"],
    correctIndex: 0,
    translations: {
      ru: {
        text: "Если a = (2;3), b = (1;4), найдите a + b",
        options: ["(3;7)", "(1;1)", "(2;7)", "(3;1)"],
      },
      uz: {
        text: "Agar a = (2;3), b = (1;4) bo'lsa, a + b ni toping",
        options: ["(3;7)", "(1;1)", "(2;7)", "(3;1)"],
      },
    },
  },
  {
    id: "q4",
    text: "Qarama-qarshi vektor qanday bo'ladi?",
    options: [
      "Uzunligi boshqa",
      "Yo'nalishi bir xil",
      "Yo'nalishi teskari",
      "Uzunligi nol",
    ],
    correctIndex: 2,
    translations: {
      ru: {
        text: "Каким является противоположный вектор?",
        options: [
          "Имеет другую длину",
          "Имеет то же направление",
          "Имеет противоположное направление",
          "Имеет нулевую длину",
        ],
      },
      uz: {
        text: "Qarama-qarshi vektor qanday bo'ladi?",
        options: [
          "Uzunligi boshqa",
          "Yo'nalishi bir xil",
          "Yo'nalishi teskari",
          "Uzunligi nol",
        ],
      },
    },
  },
  {
    id: "q5",
    text: "Nol vektor nima?",
    options: [
      "Yo'nalishi bor",
      "Uzunligi 1",
      "Uzunligi 0",
      "Faqat musbat",
    ],
    correctIndex: 2,
    translations: {
      ru: {
        text: "Что такое нулевой вектор?",
        options: [
          "У него есть направление",
          "Его длина равна 1",
          "Его длина равна 0",
          "Он только положительный",
        ],
      },
      uz: {
        text: "Nol vektor nima?",
        options: [
          "Yo'nalishi bor",
          "Uzunligi 1",
          "Uzunligi 0",
          "Faqat musbat",
        ],
      },
    },
  },
  {
    id: "q6",
    text: "Agar vektor uzunligi 5 ga teng bo'lsa, bu nimani bildiradi?",
    options: [
      "Yo'nalishi yo'q",
      "Moduli 5",
      "Nol vektor",
      "Manfiy vektor",
    ],
    correctIndex: 1,
    translations: {
      ru: {
        text: "Если длина вектора равна 5, что это означает?",
        options: [
          "У него нет направления",
          "Его модуль равен 5",
          "Это нулевой вектор",
          "Это отрицательный вектор",
        ],
      },
      uz: {
        text: "Agar vektor uzunligi 5 ga teng bo'lsa, bu nimani bildiradi?",
        options: [
          "Yo'nalishi yo'q",
          "Moduli 5",
          "Nol vektor",
          "Manfiy vektor",
        ],
      },
    },
  },
];
