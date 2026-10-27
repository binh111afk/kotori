// Thêm 4 bài nghe l5-l8 vào listening-n5.json
import { readFileSync, writeFileSync } from "node:fs";

const p = "src/content/listening-n5.json";
const d = JSON.parse(readFileSync(p, "utf8"));

d.units.push(
  { id: "l5", title: "Nghe 5 — Ở siêu thị", order: 35 },
  { id: "l6", title: "Nghe 6 — Ở bệnh viện", order: 36 },
  { id: "l7", title: "Nghe 7 — Cuộc gọi điện thoại", order: 37 },
  { id: "l8", title: "Nghe 8 — Ở lớp học", order: 38 },
);

d.lessons.push(
  {
    id: "l5", unit_id: "l5", title: "スーパーで — Ở siêu thị",
    topic: "Mua sắm, hỏi giá, đồ ăn",
    theory: { tips: [
      "Ở siêu thị, nhân viên hay hỏi 「なにかおさがしですか」(Anh tìm gì ạ?) — trả lời 〜を探しています.",
      "Giá được nói bằng 円 (えん): 百円 = 100 yên. Nghe số + 円 là biết giá.",
      "Khi thanh toán, nhân viên nói 「〇〇円になります」— nghe 円 là biết cần trả bao nhiêu.",
    ], keywords: [
      { jp: "いくら", vi: "bao nhiêu tiền" },
      { jp: "高い", r: "たかい", vi: "đắt" },
      { jp: "安い", r: "やすい", vi: "rẻ" },
      { jp: "ください", vi: "cho tôi" },
      { jp: "全部", r: "ぜんぶ", vi: "tất cả" },
    ]},
    dialogue: { lines: [
      { speaker: "店員", segments: [{ t: "いらっしゃいませ！" }, { t: "何", r: "なに" }, { t: "になさいますか。" }], vi: "Xin chào quý khách! Anh muốn mua gì ạ?" },
      { speaker: "マイ", segments: [{ t: "りんご" }, { t: "を" }, { t: "三", r: "みっ" }, { t: "つ" }, { t: "と" }, { t: "牛乳", r: "ぎゅうにゅう" }, { t: "を" }, { t: "ください。" }], vi: "Cho tôi 3 quả táo và sữa." },
      { speaker: "店員", segments: [{ t: "りんご" }, { t: "は" }, { t: "一", r: "いっ" }, { t: "個", r: "こ" }, { t: "百", r: "ひゃく" }, { t: "円", r: "えん" }, { t: "です。" }], vi: "Táo một quả 100 yên ạ." },
      { speaker: "マイ", segments: [{ t: "ちょっと" }, { t: "高", r: "たか" }, { t: "いですね。" }, { t: "隣", r: "となり" }, { t: "の" }, { t: "店", r: "みせ" }, { t: "は？" }], vi: "Hơi đắt nhỉ. Cửa hàng bên cạnh thì sao?" },
      { speaker: "店員", segments: [{ t: "隣", r: "となり" }, { t: "は" }, { t: "安", r: "やす" }, { t: "いです" }, { t: "けど、" }, { t: "ここの" }, { t: "方", r: "ほう" }, { t: "が" }, { t: "美味", r: "おい" }, { t: "しいですよ。" }], vi: "Bên cạnh rẻ hơn nhưng ở đây ngon hơn đấy." },
      { speaker: "マイ", segments: [{ t: "じゃあ、" }, { t: "ここで" }, { t: "買", r: "か" }, { t: "います。" }, { t: "全部", r: "ぜんぶ" }, { t: "で" }, { t: "いくら" }, { t: "ですか。" }], vi: "Vậy tôi mua ở đây. Tất cả bao nhiêu ạ?" },
      { speaker: "店員", segments: [{ t: "全部", r: "ぜんぶ" }, { t: "で" }, { t: "五", r: "ご" }, { t: "百", r: "ひゃく" }, { t: "円", r: "えん" }, { t: "です。" }], vi: "Tất cả 500 yên ạ." },
    ]},
    source: "kotori — hội thoại soạn theo ngữ pháp Minna I bài 11–12 (U4, U8)",
    verified: true, order_index: 5,
  },
  {
    id: "l6", unit_id: "l6", title: "病院で — Ở bệnh viện",
    topic: "Khám bệnh, mô tả triệu chứng",
    theory: { tips: [
      "Ở bệnh viện Nhật, bác sĩ hay hỏi 「どこが痛いですか」(Anh đau chỗ nào?) — trả lời bằng [bộ phận] + が痛いです.",
      "Cách nói bị bệnh: 風邪をひきました (bị cảm), 熱があります (bị sốt).",
      "Thuốc = 薬 (くすり). Nhắc uống thuốc: 薬を飲みます.",
    ], keywords: [
      { jp: "痛い", r: "いたい", vi: "đau" },
      { jp: "熱", r: "ねつ", vi: "sốt" },
      { jp: "薬", r: "くすり", vi: "thuốc" },
      { jp: "病院", r: "びょういん", vi: "bệnh viện" },
      { jp: "風邪", r: "かぜ", vi: "cảm" },
    ]},
    dialogue: { lines: [
      { speaker: "医者", segments: [{ t: "どうしましたか。" }], vi: "Anh bị làm sao ạ?" },
      { speaker: "マイ", segments: [{ t: "頭", r: "あたま" }, { t: "が痛", r: "いた" }, { t: "くて、" }, { t: "熱", r: "ねつ" }, { t: "もあります。" }], vi: "Tôi đau đầu và cũng bị sốt." },
      { speaker: "医者", segments: [{ t: "風邪", r: "かぜ" }, { t: "ですね。" }, { t: "薬", r: "くすり" }, { t: "を" }, { t: "出", r: "だ" }, { t: "します。" }], vi: "Anh bị cảm. Tôi kê thuốc cho anh." },
      { speaker: "マイ", segments: [{ t: "いつ" }, { t: "飲", r: "の" }, { t: "みます" }, { t: "か" }, { t: "。" }], vi: "Uống thuốc lúc nào ạ?" },
      { speaker: "医者", segments: [{ t: "毎", r: "まい" }, { t: "食", r: "しょく" }, { t: "後", r: "ご" }, { t: "に" }, { t: "飲", r: "の" }, { t: "んで" }, { t: "ください。" }], vi: "Vui lòng uống sau mỗi bữa ăn." },
      { speaker: "マイ", segments: [{ t: "分", r: "わ" }, { t: "かりました。" }, { t: "ありがとう" }, { t: "ございます。" }], vi: "Tôi hiểu rồi. Cảm ơn bác sĩ." },
    ]},
    source: "kotori — hội thoại soạn theo ngữ pháp Minna I bài 7–12 (U12)",
    verified: true, order_index: 6,
  },
  {
    id: "l7", unit_id: "l7", title: "電話で — Cuộc gọi điện thoại",
    topic: "Hẹn lịch, liên lạc, nhờ vả",
    theory: { tips: [
      "Nghe máy: 「もしもし」là câu mở đầu cuộc gọi — bắt buộc phải nhớ!",
      "Tự giới thiệu trước: 「マイです」— người Nhật không hỏi 「誰ですか」ngay.",
      "Hỏi có thể gặp: 「〜てもいいですか」— nghe もいい là biết đang xin phép.",
    ], keywords: [
      { jp: "もしもし", vi: "alo" },
      { jp: "今", r: "いま", vi: "bây giờ" },
      { jp: "大丈夫", r: "だいじょうぶ", vi: "không sao" },
      { jp: "後で", r: "あとで", vi: "sau" },
      { jp: "電話番号", r: "でんわばんごう", vi: "số điện thoại" },
    ]},
    dialogue: { lines: [
      { speaker: "マイ", segments: [{ t: "もしもし、" }, { t: "タナカ" }, { t: "さんですか。" }, { t: "マイ" }, { t: "です。" }], vi: "Alo, anh Tanaka phải không? Tôi là Mai." },
      { speaker: "タナカ", segments: [{ t: "あ、マイさん。" }, { t: "どうしましたか。" }], vi: "À, Mai à. Có chuyện gì vậy?" },
      { speaker: "マイ", segments: [{ t: "あした、" }, { t: "会", r: "あ" }, { t: "ってもいいですか。" }], vi: "Ngày mai mình gặp nhau được không?" },
      { speaker: "タナカ", segments: [{ t: "いいですよ。" }, { t: "何", r: "なん" }, { t: "時", r: "じ" }, { t: "に？" }], vi: "Được chứ. Mấy giờ?" },
      { speaker: "マイ", segments: [{ t: "三", r: "さん" }, { t: "時", r: "じ" }, { t: "に" }, { t: "駅", r: "えき" }, { t: "の前", r: "まえ" }, { t: "で" }, { t: "お願いします。" }], vi: "Lúc 3 giờ, trước nhà ga nhé." },
      { speaker: "タナカ", segments: [{ t: "分", r: "わ" }, { t: "かりました。" }, { t: "また" }, { t: "あした。" }], vi: "Hiểu rồi. Hẹn gặp mai." },
    ]},
    source: "kotori — hội thoại soạn theo ngữ pháp Minna I bài 6–14 (U6, U17)",
    verified: true, order_index: 7,
  },
  {
    id: "l8", unit_id: "l8", title: "教室で — Ở lớp học",
    topic: "Học tiếng Nhật, nhờ vả, bài tập",
    theory: { tips: [
      "Trong lớp học, nghe 動詞+てください là thầy cô đang nhờ/lệnh.",
      "Không hiểu thì nói: すみません、もう一度お願いします (xin nhắc lại).",
      "「宿題」(しゅくだい) là từ nghe nhiều nhất ở trường học — nhớ kĩ!",
    ], keywords: [
      { jp: "もう一度", r: "もういちど", vi: "một lần nữa" },
      { jp: "宿題", r: "しゅくだい", vi: "bài tập về nhà" },
      { jp: "難しい", r: "むずかしい", vi: "khó" },
      { jp: "分かります", r: "わかります", vi: "hiểu" },
      { jp: "漢字", r: "かんじ", vi: "chữ kanji" },
    ]},
    dialogue: { lines: [
      { speaker: "先生", segments: [{ t: "皆", r: "みな" }, { t: "さん、" }, { t: "この漢字", r: "かんじ" }, { t: "を" }, { t: "読", r: "よ" }, { t: "んで" }, { t: "ください。" }], vi: "Các em đọc kanji này giúp cô." },
      { speaker: "マイ", segments: [{ t: "すみません、" }, { t: "もう一度" }, { t: "お願いします。" }], vi: "Xin lỗi, xin thầy nhắc lại một lần nữa." },
      { speaker: "先生", segments: [{ t: "はい。" }, { t: "もう一度" }, { t: "読", r: "よ" }, { t: "みます。" }], vi: "Được. Cô đọc lại một lần nữa." },
      { speaker: "マイ", segments: [{ t: "分", r: "わ" }, { t: "かりました！" }], vi: "Em hiểu rồi!" },
      { speaker: "先生", segments: [{ t: "宿題", r: "しゅくだい" }, { t: "は" }, { t: "金", r: "きん" }, { t: "曜日", r: "ようび" }, { t: "までですよ。" }], vi: "Bài tập đến thứ sáu nhé." },
      { speaker: "タナカ", segments: [{ t: "大変", r: "たいへん" }, { t: "ですね。" }, { t: "いっしょに" }, { t: "しましょう。" }], vi: "Vất vả nhỉ. Cùng làm nhé!" },
    ]},
    source: "kotori — hội thoại soạn theo ngữ pháp Minna I bài 14–16 (U6, U17)",
    verified: true, order_index: 8,
  },
);

d.exercises.push(
  { id: "x-l5-1", unit_id: "l5", grammar_id: null, type: "choice", payload: { question: "Mai mua gì ở siêu thị?", speak: "りんごを三つと牛乳をください。", options: ["りんごと牛乳", "パンと卵", "魚と野菜"], answerIndex: 0 }, explanation_vi: "Mai mua táo và sữa.", item_ref: "u4-08", source: "kotori — soạn theo hội thoại L5", verified: true, order_index: 21 },
  { id: "x-l5-2", unit_id: "l5", grammar_id: null, type: "choice", payload: { question: "Táo một quả giá bao nhiêu?", speak: "りんごは一個百円です。", options: ["百円", "三百円", "五百円"], answerIndex: 0 }, explanation_vi: "一個百円 = 100 yên/quả.", source: "kotori — soạn theo hội thoại L5", verified: true, order_index: 22 },
  { id: "x-l5-3", unit_id: "l5", grammar_id: null, type: "fill", payload: { before: "全部で", after: "ですか。", accepted: ["いくら"], full: "全部でいくらですか。", translation: "Tất cả bao nhiêu ạ?", speak: "全部でいくらですか。" }, explanation_vi: "いくら = hỏi giá.", item_ref: "u4-17", source: "kotori — soạn theo hội thoại L5", verified: true, order_index: 23 },
  { id: "x-l6-1", unit_id: "l6", grammar_id: null, type: "choice", payload: { question: "Mai bị làm sao?", speak: "頭が痛くて、熱もあります。", options: ["頭が痛い + 熱", "おなかが痛い", "足が痛い"], answerIndex: 0 }, explanation_vi: "Mai đau đầu và sốt.", item_ref: "u12-01", source: "kotori — soạn theo hội thoại L6", verified: true, order_index: 24 },
  { id: "x-l6-2", unit_id: "l6", grammar_id: null, type: "fill", payload: { before: "風邪を", after: "。", accepted: ["ひきました"], full: "風邪をひきました。", translation: "Tôi đã bị cảm.", speak: "風邪をひきました。" }, explanation_vi: "ひきます = bị (bệnh).", item_ref: "u12-15", source: "kotori — soạn theo hội thoại L6", verified: true, order_index: 25 },
  { id: "x-l6-3", unit_id: "l6", grammar_id: null, type: "choice", payload: { question: "Uống thuốc lúc nào?", speak: "毎食後に飲んでください。", options: ["毎食後", "朝だけ", "夜だけ"], answerIndex: 0 }, explanation_vi: "Sau mỗi bữa ăn (毎食後).", source: "kotori — soạn theo hội thoại L6", verified: true, order_index: 26 },
  { id: "x-l7-1", unit_id: "l7", grammar_id: null, type: "choice", payload: { question: "Mai muốn gặp Tanaka lúc mấy giờ?", speak: "三時に駅の前で会いましょう。", options: ["三時", "四時", "五時"], answerIndex: 0 }, explanation_vi: "Lúc 3 giờ (三時に).", source: "kotori — soạn theo hội thoại L7", verified: true, order_index: 27 },
  { id: "x-l7-2", unit_id: "l7", grammar_id: null, type: "fill", payload: { before: "あした、会ってもいい", after: "。", accepted: ["ですか"], full: "あした、会ってもいいですか。", translation: "Mai mình gặp nhau được không?", speak: "あした、会ってもいいですか。" }, explanation_vi: "てもいいですか = xin phép.", source: "kotori — soạn theo hội thoại L7", verified: true, order_index: 28 },
  { id: "x-l8-1", unit_id: "l8", grammar_id: null, type: "choice", payload: { question: "Bài tập đến khi nào?", speak: "宿題は金曜日までですよ。", options: ["金曜日まで", "月曜日まで", "今日まで"], answerIndex: 0 }, explanation_vi: "Đến thứ sáu (金曜日まで).", source: "kotori — soạn theo hội thoại L8", verified: true, order_index: 29 },
  { id: "x-l8-2", unit_id: "l8", grammar_id: null, type: "fill", payload: { before: "すみません、", after: "お願いします。", accepted: ["もう一度"], full: "すみません、もう一度お願いします。", translation: "Xin lỗi, xin nhắc lại một lần nữa.", speak: "すみません、もう一度お願いします。" }, explanation_vi: "もう一度 = một lần nữa.", source: "kotori — soạn theo hội thoại L8", verified: true, order_index: 30 },
);

writeFileSync(p, JSON.stringify(d, null, 1));
console.log(`l5-l8 added: ${d.lessons.length} bài, ${d.exercises.length} bài tập nghe`);
