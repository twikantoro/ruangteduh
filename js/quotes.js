/**
 * Mindful Relaxation Quotes & Affirmations
 * Gently fades peaceful thoughts in and out at relaxing intervals.
 */
const MINDFUL_QUOTES = [
    { text: "Tarik napas perlahan... Biarkan bahumu rileks.", author: "Ruang Tenang" },
    { text: "Tidak ada yang perlu diburu-buru saat ini. Nikmati ketenangan detik ini.", author: "Hening" },
    { text: "Lepaskan ketegangan di dahi, rahang, dan jemarimu.", author: "Relaksasi Tubuh" },
    { text: "Kamu sudah bekerja keras hari ini. Beri pikiranmu waktu untuk bernapas.", author: "Apresiasi Diri" },
    { text: "Seperti air yang mengalir tenang, biarkan segala hal berjalan apa adanya.", author: "Filosofi Zen" },
    { text: "Pejamkan matamu sejenak jika lelah menatap layar.", author: "Istirahat Mata" },
    { text: "Dunia di luar sana bisa menunggu. Waktu ini adalah ruang damaimu.", author: "Jeda Sejenak" },
    { text: "Hembuskan napas panjang... dan lepaskan tumpukan beban hari ini.", author: "Napas Sadar" },
    { text: "Istirahat bukanlah tanda menyerah, melainkan cara mengumpulkan energi baru.", author: "Pemulihan" },
    { text: "Hadir seutuhnya di momen ini. Semua akan baik-baik saja.", author: "Ketenangan Jiwa" }
];

class QuoteManager {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.quoteText = this.element ? this.element.querySelector('.quote-text') : null;
        this.quoteAuthor = this.element ? this.element.querySelector('.quote-author') : null;
        this.currentIndex = 0;
        this.interval = null;
    }

    start() {
        if (!this.element) return;
        this.showNextQuote();
        // Cycle quote every 35 seconds
        this.interval = setInterval(() => {
            this.fadeTransition();
        }, 35000);
    }

    fadeTransition() {
        if (!this.element) return;
        this.element.classList.add('quote-fade-out');

        setTimeout(() => {
            this.currentIndex = (this.currentIndex + 1) % MINDFUL_QUOTES.length;
            this.showNextQuote();
            this.element.classList.remove('quote-fade-out');
            this.element.classList.add('quote-fade-in');

            setTimeout(() => {
                this.element.classList.remove('quote-fade-in');
            }, 1500);
        }, 1200);
    }

    showNextQuote() {
        const item = MINDFUL_QUOTES[this.currentIndex];
        if (this.quoteText) this.quoteText.textContent = `"${item.text}"`;
        if (this.quoteAuthor) this.quoteAuthor.textContent = `— ${item.author}`;
    }
}

window.QuoteManager = QuoteManager;
