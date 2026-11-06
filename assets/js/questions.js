/**
 * BANK SOAL
 * ---------------------------------------------------------------
 * Ubah pengaturan dan soal di file ini saja.
 *  - question : teks pertanyaan
 *  - options  : daftar pilihan jawaban (boleh 2–6 pilihan)
 *  - answer   : indeks jawaban benar (0 = A, 1 = B, 2 = C, dst.)
 *  - explain  : (opsional) pembahasan yang tampil di halaman hasil
 */
const EXAM_CONFIG = {
  title: "Tes Awal Pengetahuan Umum",
  description: "Kerjakan soal-soal berikut dengan jujur dan teliti.",
  durationMinutes: 15,
  passingScore: 70,       // nilai minimal lulus (0–100)
  shuffleQuestions: true, // acak urutan soal
  shuffleOptions: false   // acak urutan pilihan jawaban
};

const QUESTIONS = [
  {
    question: "Ibu kota negara Indonesia saat ini adalah ...",
    options: ["Bandung", "Jakarta", "Surabaya", "Medan"],
    answer: 1,
    explain: "Jakarta masih berstatus ibu kota, sementara pemindahan ke IKN Nusantara dilakukan bertahap."
  },
  {
    question: "Hasil dari 12 × 8 adalah ...",
    options: ["86", "94", "96", "108"],
    answer: 2
  },
  {
    question: "Pancasila sebagai dasar negara disahkan pada tanggal ...",
    options: ["17 Agustus 1945", "18 Agustus 1945", "1 Juni 1945", "22 Juni 1945"],
    answer: 1,
    explain: "Pancasila disahkan oleh PPKI pada 18 Agustus 1945 bersama UUD 1945."
  },
  {
    question: "Planet terbesar di tata surya adalah ...",
    options: ["Saturnus", "Bumi", "Neptunus", "Jupiter"],
    answer: 3
  },
  {
    question: "Bahasa pemrograman yang berjalan langsung di browser web adalah ...",
    options: ["Python", "JavaScript", "C++", "Java"],
    answer: 1
  },
  {
    question: "Rumus kimia air adalah ...",
    options: ["CO₂", "O₂", "H₂O", "NaCl"],
    answer: 2
  },
  {
    question: "Lambang negara Indonesia adalah ...",
    options: ["Garuda Pancasila", "Bendera Merah Putih", "Bhinneka Tunggal Ika", "Monas"],
    answer: 0
  },
  {
    question: "Jika x + 5 = 12, maka nilai x adalah ...",
    options: ["5", "6", "7", "17"],
    answer: 2
  },
  {
    question: "Singkatan HTML adalah ...",
    options: [
      "Hyper Text Markup Language",
      "High Text Machine Language",
      "Hyperlink and Text Management Language",
      "Home Tool Markup Language"
    ],
    answer: 0
  },
  {
    question: "Sinonim dari kata \"cerdas\" adalah ...",
    options: ["Bodoh", "Pandai", "Malas", "Lambat"],
    answer: 1
  }
];
