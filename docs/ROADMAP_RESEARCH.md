# ROADMAP_RESEARCH.md — Nghiên cứu lộ trình học tiếng Nhật cho app Kotori

> **Trạng thái:** Chờ duyệt trước khi vào Phase 1.
> **Ngày viết:** 2026-10-23. **Phạm vi:** Phase 0 — nghiên cứu, không code.
> Tài liệu này đối chiếu nguồn chính thức + giáo trình phổ biến + nghiên cứu khoa học, rồi đề xuất lộ trình riêng cho Kotori (コトリ). Mọi số liệu không chính thức đều được ghi rõ là **ước lượng**.

---

## 1. Khung JLPT N5 → N1

### 1.1. Thông tin chính thức (jlpt.jp)

Theo trang chính thức của Quỹ Nhật Bản dành cho Trao đổi Quốc tế (Japan Foundation) — [jlpt.jp/e/about/levelsummary.html](https://www.jlpt.jp/e/about/levelsummary.html):

| Cấp | Mô tả khả năng (trích nguyên văn) |
|-----|-----------------------------------|
| **N5** | Hiểu một phần tiếng Nhật cơ bản. Đọc: các câu và cách diễn đạt quen thuộc viết bằng hiragana, katakana, và kanji cơ bản. Nghe: hội thoại ngắn, chậm về chủ đề đời thường/lớp học. |
| **N4** | Hiểu tiếng Nhật cơ bản. Đọc: đoạn văn về chủ đề hằng ngày quen thuộc. Nghe: hội thoại đời thường, hiểu được **nếu nói chậm**. |
| **N3** | Hiểu tiếng Nhật dùng trong đời thường **ở mức nhất định** — cấp độ "cầu nối" giữa sơ cấp và trung cấp. |
| **N2** | Hiểu tiếng Nhật đời thường **trong nhiều hoàn cảnh khác nhau**. Đọc: bài báo, bình luận viết rõ ràng. Nghe: hội thoại, tin tức ở tốc độ **gần tự nhiên**. |
| **N1** | Hiểu tiếng Nhật **trong nhiều hoàn cảnh khác nhau**. Đọc: văn bản trừu tượng, phức tạp về logic (bài xã luận, phê bình). Nghe: hội thoại, tin tức, bài giảng ở tốc độ tự nhiên. |

**Quan trọng:** JLPT **không công bố danh sách từ vựng / kanji / ngữ pháp chính thức** từ cải cách 2010. Trang chủ chỉ mô tả năng lực qua Đọc và Nghe. Mọi con số dưới đây là **ước lượng của cộng đồng và các tổ chức dạy tiếng Nhật**.

### 1.2. Ước lượng nội dung theo cấp (không chính thức)

Tổng hợp từ Coto Academy, Migaku, jlptstudy.net và cộng đồng r/LearnJapanese:

| Cấp | Từ vựng (ước tính lũy kế) | Kanji | Điểm ngữ pháp (ước tính) | Số giờ học tham khảo* |
|-----|---------------------------|-------|--------------------------|------------------------|
| N5 | ~800 | ~100 | ~80 | 300–450 giờ |
| N4 | ~1.500 | ~300 | ~120 | 600–900 giờ |
| N3 | ~3.000–3.750 | ~650 | ~200 | 1.080–1.800 giờ |
| N2 | ~6.000 | ~1.000 | +200–300 | 1.400–2.600 giờ |
| N1 | ~10.000+ | ~2.000 | +300 | 2.300–4.800 giờ |

\* Số giờ là tham khảo cho người học phương Tây; **người Việt có lợi thế lớn về kanji** (vốn chữ Hán qua từ Hán-Việt) nên thường nhanh hơn đáng kể — đây là nhận xét biên tập của tôi, không phải số liệu nghiên cứu, dùng để định lượng nội dung seed chứ không cam kết thời gian cho người học.

**Nguồn cho bảng ước lượng:** [Coto Academy](https://cotoacademy.com/study-hours-needed-pass-jlpt-comparison-levels), [Migaku JLPT Study Schedule](https://migaku.com/blog/japanese/jlpt-study-schedule-guide), [jlptstudy.net](https://www.jlptstudy.net/N5) (danh sách từ vựng N5 được chuyển hoá từ **đề thi thật trước 2010** — cơ sở thực nghiệm tốt nhất hiện có vì JLPT ngừng công bố danh sách), [r/LearnJapanese](https://www.reddit.com/r/LearnJapanese/comments/1p6koc/jlpt_is_on_an_exponential_scale).

> **Hệ quả thiết kế:** con số ~800 từ / ~100 kanji / ~80 điểm ngữ pháp là **mục tiêu seed N5** của Kotori. Danh sách cụ thể lấy nền từ jlptstudy.net + các list cộng đồng, **đối chiếu ngược với JMdict** (xem §4) và gắn `source` + `verified` cho từng mục.

---

## 2. Thứ tự dạy ngữ pháp của các giáo trình phổ biến

### 2.1. Minna no Nihongo (みんなの日本語) — chuẩn lớp học hiện diễn

- Shokyū I: bài 1–25 (≈ N5); Shokyū II: bài 26–50 (≈ N4). Nguồn: [minnanihongo.com](https://minnanihongo.com), [WaniKani Community — Table of Contents Shokyu 1 & 2](https://community.wanikani.com/t/minna-no-nihongo-shokyu-1-2-table-of-contents/56400).
- Trình tự tiêu biểu (tóm tắt từ mục lục):
  - **Bài 1–2:** です/じゃありません, cách hỏi か, đại từ chỉ vật これ/それ/あれ, danh từ nối.
  - **Bài 3–5:** ます/ません/ました, chỉ hướng へ/に, nơi diễn ra で, xuất phát/điểm đến から/まで.
  - **Bài 6–11:** quá khứ của tính từ, so sánh, cách đếm, ~たい, vị trí trong/ngoài/trên/dưới.
  - **Bài 12–18:** て-form và các kết hợp (てください, ています, てから), câu thường (plain form), bổ nghĩa danh từ, ~ことが好き.
  - **Bài 19–25:** 可能形 (khả động), ~たら/~ば, 受身 (bị động), đầu nhánh N4.
  - **Bài 26–50 (II):** だけ/しか, 使役 (khiến), 使役受役, ~そう/~よう/~らしい, cặp tự động/tha động, keigo, kết thúc quanh N4.
- Mỗi bài: hội thoại → từ vựng → ngữ pháp (sách riêng) → luyện tập → đọc.

### 2.2. Genki — chuẩn lớp học phương Tây

- 23 bài, 2 tập (I: 1–12, II: 13–23); ~1.700 từ, ~300 kanji. Nguồn: [Trang chủ Genki 3rd edition](https://genki3.japantimes.co.jp/en/intro), [Tofugu review](https://www.tofugu.com/reviews/genki-textbook), [St. Olaf Grammar Index](https://wp.stolaf.edu/japanese/grammar-index/genki-i-ii-grammar-index).
- Tập I: hỏi thăm, chỉ vật/chỗ, động từ + trợ từ cơ bản, tính từ, て-form (bài 6), tính từ quá khứ, ~てもいい, short forms, bổ nghĩa danh từ, quá khứ thường.
- Tập II: khả động, 意志形 (volitional), ~なら/~ば/~たら, cặp tự động/tha động, 使役, 受身, kết thúc bằng 使役受役 (bài 23).
- Cấu trúc mỗi bài: Dialogue → Vocabulary → Grammar → Practice — rất hợp để mô phỏng thành luồng học trong app.

### 2.3. Marugoto (国際交流基金)

- Dựa trên **JF Standard** (chiếu theo CEFR, dùng thang "Can-do"): Starter (A1) → Elementary 1 & 2 (A2) → Pre-Intermediate (A2/B1) → Intermediate 1 & 2 (B1). Mỗi cấp có hai sách: **Katsudoo** (hoạt động giao tiếp) và **Rikai** (hiểu biết/ngữ pháp). Nguồn: [marugoto.jpf.go.jp](https://marugoto.jpf.go.jp/en/teacher/feature).
- **Điểm rút ra:** định hướng giao tiếp theo chủ đề đời sống ("chào hỏi", "đi ăn", "mua sắm") — phù hợp với cách tổ chức unit theo chủ đề của Kotori.

### 2.4. Tobira: Gateway to Advanced Japanese

- Giáo trình trung cấp, phủ gần hết ngữ pháp N3 (và hơn chút nữa), bài đọc dài. Nguồn: [WaniKani Community](https://community.wanikani.com/t/kanzen-n3-or-tobira/25984).
- **Điểm rút ra:** chỉ ảnh hưởng khung N3+ (sau này), không ảnh hưởng N5.

### 2.5. Shin Kanzen Master (新完全マスター)

- Bộ **ôn thi JLPT** theo cấp (N3–N1 chủ yếu) và theo kỹ năng: Ngữ pháp, Đọc, Nghe, Từ vựng, Kanji — 5 cuốn/cấp; mỗi bài nêu 5–6 điểm ngữ pháp gần giống nhau + luyện tập dày. Nguồn: mô tả thống nhất trên các diễn đàn (WaniKani Community, r/LearnJapanese).
- **Điểm rút ra:** mô hình "1 bài = cụm điểm ngữ pháp dễ nhầm + luyện" chính là nguyên lý **interleaving** (§3.3) — Kotori áp dụng vào phần ôn tập/quiz.

### 2.6. Tae Kim's Guide to Japanese

- Guide miễn phí nổi tiếng, đi theo hướng **plain form trước tiên** (mở đầu bằng だ/じゃない thay vì です), chia Basic Grammar (từ loại: danh/tính/động/phó) → Essential Grammar (て-form, khả động...) → Special Expressions → Advanced. Nguồn: [guidetojapanese.org](https://www.guidetojapanese.org/learn), [Basic Grammar](https://www.guidetojapanese.org/basicgram.html), [Essential Grammar](https://www.guidetojapanese.org/essential).
- **Điểm rút ra:** nội dung giải thích "tại sao nói vậy" rất tốt để tham khảo khi soạn giải thích tiếng Việt; nhưng thứ tự giới thiệu ます-form trước (Minna/Genki) thân thiện hơn với người mới — Kotori giữ thứ tự Minna/Genki.

### 2.7. Kết luận sư phạm cho N5

Trình tự ngữ pháp N5 của Minna và Genki **trùng khớp cao** (ます → trợ từ → tính từ → て-form → plain form → bổ nghĩa danh từ → khả động/tiếp nghĩa), đủ tin cậy làm xương sống. Kotori:

1. Dùng **trình tự Minna/Genki làm xương sống** ngữ pháp N5 (đã được kiểm chứng thực tế bởi hàng triệu người học).
2. Tổ chức **theo chủ đề giao tiếp** (Marugoto) để tạo động lực và ngữ cảnh.
3. Giải thích tiếng Việt tự soạn, tham chiếu Tae Kim cho phần "vì sao".
4. Nhóm các điểm dễ nhầm vào phần ôn xen kẽ (Shin Kanzen Master / interleaving).

---

## 3. Nguyên lý khoa học học tập

### 3.1. Spaced Repetition (SRS)

- Đường cong quên của Ebbinghaus (1885) là nền tảng: trí nhớ suy giảm theo hàm mũ, ôn tập đúng thời điểm làm chu kỳ suy giảm khởi động lại với độ dốc nhỏ dần.
- **SM-2** (SuperMemo, 1987): thuật toán kinh điển của Anki hơn 15 năm — mỗi thẻ có ease factor, khoảng cách nhân theo số lần trả lời đúng liên tiếp. Đơn giản, xác định (deterministic), dễ kiểm thử.
- **FSRS** (Free Spaced Repetition Scheduler, Jarrett Ye, 2022): dựa mô hình bộ nhớ DSR (Difficulty, Stability, Retrievability), chính xác hơn SM-2 về đoán xác suất nhớ; **Anki tích hợp sẵn từ bản 23.10 (11/2023)**. Có bản TypeScript chính thức `ts-fsrs` do cộng đồng [Open Spaced Repetition](https://github.com/open-spaced-repetition) bảo trì ([trang ts-fsrs](https://open-spaced-repetition.github.io/ts-fsrs/)).
- **Đề xuất cho Kotori:** v1 dùng **SM-2 rút gọn** (4 nút đánh giá: Lại / Khó / Được / Dễ), khoảng ~60 dòng, đo được bằng Vitest; khi có dữ liệu người dùng thật và muốn cá nhân hoá, nâng cấp lên `ts-fsrs` (thư viện sẵn, không phải tự viết). Lý do: SM-2 minh bạch và đủ tốt ở giai đoạn N5; FSRS cần lịch sử ôn nhiều mới phát huy.

### 3.2. Active Recall (Hiệu ứng kiểm tra)

- Roediger & Karpicke (2006), *Test-Enhanced Learning*, Psychological Science 17(3), 249–255 ([bài gốc](https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01693.x)): nhóm **tự chủ động gợi nhớ** giữ được ~61% nội dung sau 1 tuần, nhóm chỉ **đọc lại** giữ ~40%.
- **Hệ quả thiết kế:** mọi bài học của Kotori phải kết thúc bằng hành động gợi nhớ (bài tập, quiz, flashcard yêu cầu tự trả lời trước khi lật) — không bao giờ chỉ "đọc xong là xong".

### 3.3. Interleaving (Luyện xen kẽ)

- Rohrer & Taylor (2007): nhóm luyện **chặn theo loại bài** đạt 89% khi luyện nhưng nhóm **xen kẽ** các loại bài thắng cách biệt ~43% ở bài kiểm tra 1 ngày sau; Taylor & Rohrer (2010) cho thấy điểm test **tăng gấp đôi**; xác nhận lại bằng RCT quy mô lớn (Rohrer et al., 2020). Nguồn: [Rohrer 2012 (ERIC)](https://files.eric.ed.gov/fulltext/ED536926.pdf), [tổng kết](https://www.learningscientists.org/blog/2021/10/28-1).
- Cơ chế: buộc người học **phân biệt các dạng gần giống nhau** — đúng thứ tiếng Nhật rất cần (シ/ツ, ソ/ン, nhờ/khoan — は/が, に/で).
- **Hệ quả thiết kế:** trang "Ôn tập hôm nay" **trộn nhiều unit + nhiều dạng bài**; game và quiz cố tình ghép các cặp dễ nhầm.

### 3.4. Comprehensible Input (Đầu vào dễ hiểu i+1)

- Krashen, *Principles and Practice in Second Language Acquisition* (1982, [PDF miễn phí](https://www.sdkrashen.com/content/books/principles_and_practice.pdf)): ngôn ngữ được "acquire" qua đầu vào hiểu được, cao hơn trình độ hiện tại đúng một bậc (i+1).
- **Hệ quả thiết kế:** câu ví dụ, bài đọc, bài nghe N5 chỉ dùng **từ đã học + tối đa 1 yếu tố mới**; transcript nghe luôn có furigana + bản dịch để "đầu vào" luôn hiểu được.

---

## 4. Nguồn dữ liệu mở & giấy phép (đã kiểm tra)

| Nguồn | Cung cấp | Giấy phép | Attribution bắt buộc |
|-------|----------|-----------|----------------------|
| [JMdict / EDICT](https://www.edrdg.org/edrdg/licence) (EDRDG) | Từ điển Nhật–Anh: từ, cách đọc kana, kanji viết, từ loại, nghĩa tiếng Anh | **CC BY-SA 4.0** | "© Electronic Dictionary Research and Development Group (EDRDG), dùng theo CC BY-SA 4.0" + link license |
| [KANJIDIC2](http://www.edrdg.org/kanjidic) (EDRDG) | Kanji: âm on/kun, nghĩa tiếng Anh, số nét, cấp học, JLPT (danh mục cũ) | **CC BY-SA 4.0** | Như trên |
| [KanjiVG](https://kanjivg.tagaini.net) ([GitHub](https://github.com/KanjiVG/kanjivg)) | **Thứ tự nét** kanji/kana dạng SVG path + tên nét | **CC BY-SA 3.0** (© Ulrich Apel) | "KanjiVG © Ulrich Apel, CC BY-SA 3.0" + link; dữ liệu phái sinh phải cùng license |
| [Tatoeba](https://tatoeba.org/en/terms_of_use) | Câu ví dụ đa ngôn ngữ, **có bản dịch tiếng Việt** | **CC BY 2.0 FR** (một số câu CC0) | "Tatoeba Project" + link tatoeba.org |
| [jlptstudy.net](https://www.jlptstudy.net/N5) | Danh sách từ vựng/kanji N5 lấy từ đề thi thật trước 2010 | Site mở, dữ liệu gốc do JLPT phát hành (không còn bản quyền danh sách công bố) | Ghi nguồn "danh sách cộng đồng dựa trên đề JLPT trước 2010" |

**Lưu ý pháp lý quan trọng:**
1. JMdict, KANJIDIC2, KanjiVG là **ShareAlike**: nếu ta biến đổi dữ liệu gốc (dịch nghĩa, cắt lọc), phần phái sinh của dữ liệu đó phải phân phối cùng license — quy ước này được ghi trên trang attribution của app.
2. **JMdict không có nghĩa tiếng Việt.** Nghĩa tiếng Việt của Kotori do đội soạn nội dung (tôi) tự dịch từ gloss tiếng Anh của JMdict + đối chiếu, và gắn `verified` theo quy trình ở §6.3.
3. App có trang `/nguon` (Nguồn & giấy phép) hiển thị đầy đủ các credit trên — hiển thị ở footer.

---

## 5. Lộ trình đề xuất của Kotori *(phần tự thiết kế — đã ghi rõ lý do)*

### 5.1. Kiến trúc nội dung: 3 track

```
Track Kana  ──► Track N5 (đầy đủ) ──► Track N4..N1 (khung sườn, mở rộng sau)
```

### 5.2. Track Kana (Unit K1–K10)

| Unit | Nội dung |
|------|----------|
| K1–K5 | Hiragana: 5 hàng gojūon (あ行…わ行 + ん), mỗi unit 9–10 chữ |
| K6 | Hiragana: dakuten ゛ + handakuten ゜ + sokuon っ + trường âm |
| K7 | Hiragana: yōon (きゃ しゅ…) + ôn tổng, cặp dễ nhầm (シ/ツ, ソ/ン…) |
| K8–K9 | Katakana: gojūon + dakuten/yōon/sokuon/长音 (song song cấu trúc K1–K7) |
| K10 | Katakana tổng hợp: chữ nước ngoài thường gặp (コーヒー, テスト…), ôn cả 2 bảng |

Mỗi kana có: mặt chữ, romaji, **hoạt hình thứ tự nét** (KanjiVG), mnemonic tiếng Việt (tự soạn — xem §5.6), audio (TTS), badge tiến độ theo hàng.

### 5.3. Track N5: 8 unit chủ đề

Mỗi unit 4–6 bài học. Mỗi bài = **10–15 từ vựng + 1–2 điểm ngữ pháp + bài tập + mini-quiz**. Kanji chạy song song (mỗi unit ~13 chữ, tổng ~103).

| Unit | Chủ đề | Ngữ pháp xương sống (theo Minna/Genki) | Kanji nhóm |
|------|--------|------------------------------------------|------------|
| U1 | Chào hỏi & tự giới thiệu | です/じゃありません, か, trợ từ は/も, khẳng định/phủ định, hỏi đáp | Số, người (私, 人, 先生, 学生…) |
| U2 | Cái này, cái kia | これ/それ/あれ/どれ, の (sở hữu), ここ/そこ/あそこ/どこ, だれの | Chỉ định, đồ vật (本, 語, 円, 何…) |
| U3 | Ngày thường | ます/ません/ました, thời gian, を, へ/に, で, から/まで | Thời gian (日, 月, 火, 時, 分, 半…) |
| U4 | Ăn uống & mua sắm | が好き/嫌い, số đếm & lượng từ, ほしいです, ~たいです | Ăn uống (食, 飲, 肉, 魚, 米…) |
| U5 | Miêu tả | Tính từ い/な, quá khứ, そして/でも/が (nối câu) | Tính chất (大, 小, 高, 安, 新, 古…) |
| U6 | Đề nghị & đang làm | て-form (chuẩn hoá 3 nhóm động từ), てください, ています, てから, てもいいです, てはいけません | Hành động (行, 来, 見, 聞, 読, 書…) |
| U7 | Câu thường & kể chuyện | Plain form 3 nhóm, quá khứ thường, bổ nghĩa danh từ, ~ことが好きです, ~できます | Học hành, địa điểm (学, 校, 家, 部屋…) |
| U8 | So sánh & tổng kết N5 | より/のほうが/いちばん, ôn trợ từ toàn N5, tổng kết | Tổng hợp N5 |

- **Từ vựng:** mục tiêu ~800–1.000 mục N5, mỗi mục gồm: `kana`, `kanji` (nếu có), `romaji`, `nghĩa_việt`, `loại_từ`, `câu_ví dụ` (kèm furigana + dịch + nguồn), `audio_text` (chuỗi để TTS), `topic`, `level`, `source`, `verified`.
- **Ngữ pháp:** ~80 điểm N5, mỗi điểm: cấu trúc, giải thích tiếng Việt (kèm lỗi hay gặp của người Việt — tự soạn), 3–5 ví dụ có furigana + dịch, source, verified.
- **Kanji:** ~103 chữ, mỗi chữ: nghĩa, on/kun, số nét, 2–4 từ ghép, nét KanjiVG, source.

### 5.4. Track N4–N1 (khung sườn)

Chỉ dựng **schema dữ liệu + danh sách unit trống** (tên unit, chủ đề dự kiến, số điểm ngữ pháp ước tính từ §1.2) để mở rộng sau bằng cách seed thêm — không soạn nội dung trong đợt này.

### 5.5. Luồng học trong app (mỗi buổi học)

```
Học mới (flashcard + audio) ─► Luyện (bài tập 6 dạng) ─► Ôn SRS (hàng ngày) ─► Game (củng cố)
```

- **SRS:** SM-2 rút gọn (§3.1), hàng đợi "Ôn tập hôm nay" trộn unit + dạng bài (interleaving §3.3), từ sai từ game/bài tập tự động vào hàng đợi.
- **Bài tập 6 dạng:** chọn đáp án · điền chỗ trống (gõ) · sắp xếp câu · nối cặp · chia từ (động từ/tính từ) · điền trợ từ. Bộ kiểm tra đáp án chuẩn hoá kana/kanji/romaji + nhận nhiều đáp án đúng + giải thích tiếng Việt.

### 5.6. Các điểm **tự thiết kế** của tôi (không có trong nguồn) và lý do

1. **Xen kẽ từ vựng + ngữ pháp theo chủ đề** thay vì tách 2 track riêng: theo Marugoto (§2.3) và i+1 (§3.4) — từ vựng có ngữ cảnh thì nhớ lâu hơn, mỗi bài nhỏ 10–15 từ để giữ nhịp.
2. **Kanji theo nhóm chủ đề chạy song song unit** (theo truyền thống Minna/Genki) thay vì hệ thống radical kiểu WaniKani: với ~100 chữ N5, nhóm chủ đề đơn giản và gắn với từ vựng đang học; WaniKani-style là hệ phức tạp, chưa cần ở N5.
3. **Mnemonics tiếng Việt tự soạn** cho kana (nguyên lý elaborative encoding — gắn chữ lạ với hình ảnh quen thuộc bằng ngôn ngữ mẹ đẻ): đây là nội dung biên tập, không có nguồn duy nhất, sẽ gắn `source: "tự soạn"` và không dùng `verified` cho mục đích đúng/sai (chỉ là gợi nhớ).
4. **SM-2 trước, FSRS sau** (§3.1).
5. **Quy ước `source` + `verified` cho mọi mục nội dung** (đề xuất chi tiết ở §6.3).

---

## 6. Rủi ro, quy trình verified, và thứ tự các phase

### 6.1. Rủi ro đã nhận diện

| Rủi ro | Giảm thiểu |
|--------|-----------|
| Web Speech API phụ thuộc máy (không có giọng ja-JP trên một số thiết bị) | Lớp trừu tượng `AudioProvider`, phát hiện & hướng dẫn cài giọng, sau này cắm TTS API/audio thu sẵn |
| Nghĩa tiếng Việt tự dịch có thể sai | Quy trình verified §6.3, mọi mục có `source`, app hiển thị nguồn |
| Danh sách JLPT không chính thức | Dùng jlptstudy.net + JMdict đối chiếu chéo, ghi rõ "ước lượng" trong UI |
| Chấm đáp án tự do (gõ kana/romaji) | Bộ chuẩn hoá + Vitest bao phủ, nhận nhiều biến thể đúng |

### 6.2. Thứ tự phase (đã thống nhất với bạn — lặp lại để đồng bộ)

1. Phase 1: Nền tảng (Next.js + Supabase + design system + landing)
2. Phase 2: Kana + Từ vựng + SRS + AudioProvider
3. Phase 3: Bài tập + Ngữ pháp
4. Phase 4: Streak/XP/badge/thống kê
5. Phase 5: Game
6. Phase 6: Luyện nghe
7. Phase 7: Kanji + N5 hoàn thiện + khung N4 + PWA
8. Phase 8: Kiểm thử, rà soát đáp án, bảo mật, production

### 6.3. Quy trình `verified` cho nội dung

- `verified: true` — mục đã đối chéo **≥ 2 nguồn độc lập** (ví dụ: nghĩa tiếng Việt khớp với gloss JMdict + sentence Tatoeba; kana thứ tự nét khớp KanjiVG).
- `verified: false` — mục chỉ có 1 nguồn hoặc tự soạn (mnemonic, giải thích): vẫn dùng được nhưng hiện badge "cần kiểm chứng" trong **bảng điều khiển nội dung nội bộ** (không hiện cho người học), và được liệt kê trong báo cáo cuối Phase 8.
- Script validate nội dung (Phase 3+) tự chặn: thiếu đáp án, thiếu source, trùng lặp, sai định dạng kana/romaji.

---

## 7. Tài liệu tham khảo (đã dùng trong tài liệu này)

- JLPT chính thức: https://www.jlpt.jp/e/about/levelsummary.html
- Coto Academy — giờ học & số liệu theo cấp: https://cotoacademy.com/study-hours-needed-pass-jlpt-comparison-levels
- Migaku — JLPT study schedule: https://migaku.com/blog/japanese/jlpt-study-schedule-guide
- jlptstudy.net N5: https://www.jlptstudy.net/N5
- Minna no Nihongo TOC (WaniKani Community): https://community.wanikani.com/t/minna-no-nihongo-shokyu-1-2-table-of-contents/56400
- Genki 3rd ed index: https://genki3.japantimes.co.jp/en/intro · Review Tofugu: https://www.tofugu.com/reviews/genki-textbook · St. Olaf Grammar Index: https://wp.stolaf.edu/japanese/grammar-index/genki-i-ii-grammar-index
- Marugoto / JF Standard: https://marugoto.jpf.go.jp/en/teacher/feature
- Tae Kim's Guide: https://www.guidetojapanese.org/learn
- Roediger & Karpicke 2006: https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01693.x
- Rohrer 2012 (interleaving, ERIC): https://files.eric.ed.gov/fulltext/ED536926.pdf
- Krashen — Principles and Practice (PDF): https://www.sdkrashen.com/content/books/principles_and_practice.pdf
- FSRS / Open Spaced Repetition: https://github.com/open-spaced-repetition · https://open-spaced-repetition.github.io/ts-fsrs/
- EDRDG licence (JMdict/KANJIDIC2): https://www.edrdg.org/edrdg/licence
- KanjiVG: https://kanjivg.tagaini.net
- Tatoeba terms: https://tatoeba.org/en/terms_of_use
