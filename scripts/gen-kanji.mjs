// Sinh src/content/kanji-n5.json (100 kanji N5) + kanji-strokes.json từ KanjiVG.
// Data nguồn: nghĩa/âm/từ ghép do Kotori biên soạn (đối chiếu KANJIDIC2), nét từ KanjiVG.
// Chạy: node scripts/gen-kanji.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const kanjivgDir = process.env.KANJIVG_DIR ?? "C:/Users/Lenovo/AppData/Local/Temp/kanjivg/kanjivg-master/kanji";

// [char, nghĩa_vi, "on1,on2", "kun1,kun2", "word|reading|vi;;word2|reading2|vi2"]
// Âm on viết katakana, kun viết hiragana — theo quy ước từ điển.
const D = [
  ["日", "ngày, mặt trời", "ニチ,ジツ", "ひ,か", "日本|にほん|Nhật Bản;;毎日|まいにち|mỗi ngày;;日曜日|にちようび|chủ nhật"],
  ["一", "một", "イチ", "ひと", "一人|ひとり|một người;;一日|いちにち|một ngày;;一回|いっかい|một lần"],
  ["二", "hai", "ニ", "ふた", "二人|ふたり|hai người;;二月|にがつ|tháng hai;;二日|ふつか|hai ngày, ngày mùng 2"],
  ["三", "ba", "サン", "み", "三人|さんにん|ba người;;三月|さんがつ|tháng ba;;三日|さんにち|ba ngày"],
  ["四", "bốn", "シ", "よん,よ", "四月|しがつ|tháng tư;;四日|よっか|bốn ngày, ngày mùng 4;;四人|よにん|bốn người"],
  ["五", "năm", "ゴ", "いつ", "五月|ごがつ|tháng năm;;五日|いつか|năm ngày, ngày mùng 5;;五人|ごにん|năm người"],
  ["六", "sáu", "ロク", "む", "六月|ろくがつ|tháng sáu;;六日|むいか|sáu ngày;;六人|ろくにん|sáu người"],
  ["七", "bảy", "シチ", "なな", "七月|しちがつ|tháng bảy;;七日|なのか|bảy ngày;;七人|しちにん|bảy người"],
  ["八", "tám", "ハチ", "や", "八月|はちがつ|tháng tám;;八日|ようか|tám ngày;;八人|はちにん|tám người"],
  ["九", "chín", "キュウ,ク", "ここの", "九月|くがつ|tháng chín;;九日|ここのか|chín ngày;;九時|くじ|chín giờ"],
  ["十", "mười", "ジュウ", "とお", "十日|とおか|mười ngày;;十分|じゅっぷん|mười phút;;十月|じゅうがつ|tháng mười"],
  ["百", "trăm", "ヒャク", "", "三百|さんびゃく|ba trăm;;八百|はっぴゃく|tám trăm"],
  ["千", "nghìn", "セン", "ち", "一千|いっせん|một nghìn;;二千|にせん|hai nghìn"],
  ["万", "vạn, mười nghìn", "マン,バン", "", "一万|いちまん|mười nghìn;;三万|さんまん|ba mươi nghìn"],
  ["円", "yên (tiền Nhật); hình tròn", "エン", "", "円|えん|yên;;百円|ひゃくえん|trăm yên"],
  ["時", "giờ, thời gian", "ジ", "とき", "時間|じかん|thời gian;;一時|いちじ|một giờ;;時々|ときどき|thỉnh thoảng"],
  ["分", "phút; hiểu", "フン,ブン", "わ", "十分|じゅっぷん|mười phút;;三分|さんぷん|ba phút"],
  ["半", "một nửa", "ハン", "なか", "半分|はんぶん|một nửa;;七時半|しちじはん|bảy giờ rưỡi"],
  ["毎", "mỗi, hằng", "マイ", "", "毎日|まいにち|hằng ngày;;毎朝|まいあさ|mỗi sáng;;毎週|まいしゅう|hằng tuần"],
  ["年", "năm", "ネン", "とし", "今年|ことし|năm nay;;一年|いちねん|một năm;;去年|きょねん|năm ngoái"],
  ["午", "buổi trưa trước (a.m.)", "ゴ", "", "午前|ごぜn|buổi sáng (trước trưa);;午後|ごご|buổi chiều"],
  ["前", "trước, phía trước", "ゼン", "まえ", "午前|ごぜん|buổi sáng;;駅の前|えきのまえ|trước nhà ga"],
  ["後", "sau, phía sau", "ゴ", "あと,うし", "午後|ごご|buổi chiều;;一週間後|いっしゅうかんご|một tuần sau"],
  ["今", "bây giờ", "コン", "いま", "今日|きょう|hôm nay;;今朝|けさ|sáng nay;;今|いま|bây giờ"],
  ["人", "người", "ジン,ニン", "ひと", "人|ひと|người;;日本人|にほんじん|người Nhật;;三人|さんにん|ba người"],
  ["名", "tên", "メイ,ミョウ", "な", "名前|なまえ|tên;;有名|ゆうめい|nổi tiếng"],
  ["男", "đàn ông, nam", "ダン,ナン", "おとこ", "男の人|おとこのひと|đàn ông;;男の子|おとこのこ|con trai"],
  ["女", "đàn bà, nữ", "ジョ,ニョ", "おんな", "女の人|おんなのひと|đàn bà;;女の子|おんなのこ|con gái"],
  ["子", "trẻ con", "シ", "こ", "子ども|こども|trẻ con;;男の子|おとこのこ|con trai;;女の子|おんなのこ|con gái"],
  ["父", "cha", "フ", "ちち", "お父さん|おとうさん|bố (của người khác);;父母|ふぼ|cha mẹ"],
  ["母", "mẹ", "ボ", "はは", "お母さん|おかあさん|mẹ (của người khác);;母|はは|mẹ (của tôi)"],
  ["友", "bạn", "ユウ", "とも", "友達|ともだち|bạn bè;;友人|ゆうじん|bạn bè (trang trọng)"],
  ["先", "trước, đầu", "セン", "", "先生|せんせい|giáo viên;;先週|せんしゅう|tuần trước"],
  ["生", "đời sống, học sinh; sống", "セイ", "い,う", "学生|がくせい|học sinh;;生活|せいかつ|cuộc sống;;生まれる|うまれる|được sinh ra"],
  ["学", "học", "ガク", "まな", "学生|がくせい|học sinh;;学校|がっこう|trường học;;大学|だいがく|đại học"],
  ["校", "trường", "コウ", "", "学校|がっこう|trường học;;日本語学校|にほんごがっこう|trường tiếng Nhật"],
  ["語", "ngôn ngữ", "ゴ", "", "日本語|にほんご|tiếng Nhật;;英語|えいご|tiếng Anh"],
  ["読", "đọc", "ドク", "よ", "読みます|よみます|đọc;;読む|よむ|đọc (nguyên mẫu)"],
  ["書", "viết", "ショ", "か", "書きます|かきます|viết;;辞書|じしょ|từ điển"],
  ["聞", "nghe", "ブン", "き", "聞きます|ききます|nghe, hỏi;;聞く|きく|nghe"],
  ["見", "nhìn, xem", "ケン", "み", "見ます|みます|nhìn, xem;;見る|みる|nhìn"],
  ["話", "nói chuyện; câu chuyện", "ワ", "はな", "話します|はなします|nói;;電話|でんわ|điện thoại"],
  ["行", "đi", "コウ", "い", "行きます|いきます|đi;;銀行|ぎんこう|ngân hàng;;旅行|りょこう|du lịch"],
  ["来", "đến", "ライ", "く", "来ます|きます|đến;;来週|らいしゅう|tuần sau"],
  ["出", "ra, xuất", "シュツ", "で,だ", "出ます|でます|ra khỏi;;出口|でぐち|lối ra"],
  ["入", "vào", "ニュウ", "はい,い", "入ります|はいります|vào;;入口|いりぐち|lối vào"],
  ["立", "đứng", "リツ", "た", "立ちます|たちます|đứng;;自動販売機|じどうはんばいき|máy bán hàng tự động"],
  ["休", "nghỉ", "キュウ", "やす", "休みます|やすみます|nghỉ;;お休みなさい|おやすみなさい|chúc ngủ ngon"],
  ["買", "mua", "バイ", "か", "買います|かいます|mua;;買い物|かいもの|đi mua sắm"],
  ["売", "bán", "バイ", "う", "売ります|うります|bán;;売り場|うりば|quầy bán"],
  ["食", "ăn", "ショク", "た", "食べます|たべます|ăn;;食堂|しょくどう|căng tin, quán ăn"],
  ["飲", "uống", "イン", "の", "飲みます|のみます|uống;;飲み物|のみもの|đồ uống"],
  ["東", "đông", "トウ", "ひがし", "東|ひがし|hướng đông;;東京|とうきょう|Tokyo"],
  ["西", "tây", "セイ,サイ", "にし", "西|にし|hướng tây;;関西|かんさい|vùng Kansai"],
  ["南", "nam", "ナン", "みなみ", "南|みなみ|hướng nam;;南口|みなみぐち|lối nam (nhà ga)"],
  ["北", "bắc", "ホク", "きた", "北|きた|hướng bắc;;北海道|ほっかいどう|Hokkaido"],
  ["上", "trên, lên", "ジョウ", "うえ,あ,のぼ", "机の上|つくえのうえ|trên bàn;;上手|じょうず|giỏi, khéo"],
  ["下", "dưới, xuống", "カ,ゲ", "した,さ,お", "下|した|phía dưới;;下ります|おります|xuống (xe)"],
  ["中", "trong, giữa", "チュウ", "なか", "中|なか|bên trong;;中国|ちゅうごく|Trung Quốc"],
  ["外", "ngoài", "ガイ", "そと", "外国|がいこく|nước ngoài;;外|そと|bên ngoài"],
  ["口", "miệng; lối", "コウ", "くち", "入口|いりぐち|lối vào;;口|くち|miệng"],
  ["手", "tay", "シュ", "て", "手|て|tay;;手紙|てがみ|thư tay"],
  ["目", "mắt", "モク", "め", "目|め|mắt;;一目|ひとめ|một ánh nhìn"],
  ["耳", "tai", "ジ", "みみ", "耳|みみ|tai;;大きい耳|おおきいみみ|tai to"],
  ["足", "chân; đủ", "ソク", "あし,た", "足|あし|chân, bàn chân;;足りる|たりる|đủ"],
  ["天", "trời", "テン", "", "天気|てんき|thời tiết;;天ぷら|てんぷら|tempura"],
  ["気", "khí, tinh thần", "キ", "", "天気|てんき|thời tiết;;元気|げんき|khỏe mạnh"],
  ["雨", "mưa", "ウ", "あめ", "雨|あめ|mưa;;大雨|おおあめ|mưa to"],
  ["電", "điện", "デン", "", "電車|でんしゃ|tàu điện;;電話|でんわ|điện thoại;;電気|でんき|đèn, điện"],
  ["車", "xe", "シャ", "くるま", "車|くるま|xe hơi;;電車|でんしゃ|tàu điện"],
  ["山", "núi", "サン", "やま", "山|やま|núi;;富士山|ふじさん|núi Phú Sĩ"],
  ["川", "sông", "セン", "かわ", "川|かわ|sông;;小川|おがわ|dòng suối"],
  ["花", "hoa", "カ", "はな", "花|はな|hoa;;花見|はなみ|ngắm hoa"],
  ["大", "to, lớn", "ダイ,タイ", "おお", "大学|だいがく|đại học;;大きい|おおきい|to lớn;;大雨|おおあめ|mưa to"],
  ["小", "nhỏ", "ショウ", "ちい", "小さい|ちいさい|nhỏ bé;;小学校|しょうがっこう|tiểu học"],
  ["高", "cao; đắt", "コウ", "たか", "高い|たかい|cao, đắt;;大学|だいがく|đại học"],
  ["安", "rẻ; an", "アン", "やす", "安い|やすい|rẻ;;安全|あんぜん|an toàn"],
  ["新", "mới", "シン", "あたら", "新しい|あたらしい|mới;;新聞|しんぶん|báo"],
  ["古", "cũ, cổ", "コ", "ふる", "古い|ふるい|cũ;;中古|ちゅうこ|đã qua sử dụng"],
  ["長", "dài, dài (thời gian)", "チョウ", "なが", "長い|ながい|dài;;社長|しゃちょう|giám đốc"],
  ["少", "ít", "ショウ", "すこ,すく", "少し|すこし|một ít;;少ない|すくない|ít"],
  ["多", "nhiều", "タ", "おお", "多い|おおい|nhiều;;多分|たぶん|có lẽ"],
  ["早", "sớm, sớm muộn", "ソウ", "はや", "早い|はやい|sớm;;朝早く|あさはやく|sớm buổi sáng"],
  ["白", "trắng", "ハク", "しろ", "白い|しろい|trắng;;白人|はくじん|người da trắng"],
  ["元", "nguồn; khỏe", "ゲン", "もと", "元気|げんき|khỏe mạnh;;元|もと|nguồn gốc"],
  ["会", "gặp; hội", "カイ", "あ", "会います|あいます|gặp;;会社|かいしゃ|công ty;;会議|かいぎ|cuộc họp"],
  ["社", "công ty, đền", "シャ", "", "会社|かいしゃ|công ty;;神社|じんじゃ|đền Thần đạo"],
  ["国", "nước, quốc gia", "コク", "くに", "外国|がいこく|nước ngoài;;国|くに|nước, quê hương"],
  ["間", "khoảng; giữa; phòng", "カン,ケン", "あいだ", "時間|じかん|thời gian;;間|あいだ|khoảng giữa"],
  ["何", "cái gì; bao nhiêu", "ナン", "なに", "何|なに,なん|cái gì;;何時|なんじ|mấy giờ"],
  ["私", "tôi", "シ", "わたし", "私|わたし|tôi;;私たち|わたしたち|chúng tôi"],
  ["犬", "chó", "ケン", "いぬ", "犬|いぬ|con chó;;大きい犬|おおきいいぬ|con chó to"],
  ["魚", "cá", "ギョ", "さかな", "魚|さかな|con cá;;白い魚|しろいさかな|con cá trắng"],
  ["米", "gạo", "マイ", "こめ", "米|こめ|gạo;;アメリカ|アメリカ|nước Mỹ (米国)"],
  ["駅", "nhà ga", "エキ", "", "駅|えき|nhà ga;;駅前|えきまえ|trước nhà ga"],
  ["右", "phải", "ウ", "みぎ", "右|みぎ|bên phải;;右手|みぎて|bàn tay phải"],
  ["左", "trái", "サ", "ひだり", "左|ひだり|bên trái;;左手|ひだりて|bàn tay trái"],
  ["店", "cửa hàng", "テン", "みせ", "店|みせ|cửa hàng;;書店|しょてん|hiệu sách"],
  ["図", "hình, sơ đồ", "ズ", "", "図書館|としょかん|thư viện;;地図|ちず|bản đồ"],
  ["銀", "bạc; ngân hàng", "ギン", "", "銀行|ぎんこう|ngân hàng;;銀|ぎん|bạc"],
];

function strokePaths(codepoint) {
  const file = join(kanjivgDir, `${codepoint}.svg`);
  if (!existsSync(file)) return null;
  const svg = readFileSync(file, "utf8");
  const paths = [...svg.matchAll(/<path[^>]*id="kvg:[0-9a-fA-F]+-s(\d+)"[^>]*d="([^"]+)"/g)];
  if (!paths.length) return null;
  return paths.sort((a, b) => Number(a[1]) - Number(b[1])).map((m) => m[2]);
}

const items = [];
const strokes = {};
const missing = [];

D.forEach((row, i) => {
  const [char, meaningVi, onStr, kunStr, examplesStr] = row;
  const codepoints = [...char].map((c) => c.codePointAt(0).toString(16).padStart(5, "0"));
  const paths = [];
  for (const cp of codepoints) {
    const p = strokePaths(cp);
    if (p) paths.push(...p);
    else missing.push(`${char} (${cp})`);
  }
  strokes[char] = { strokes: paths };
  items.push({
    id: `k5-${String(i + 1).padStart(3, "0")}`,
    char,
    meaning_vi: meaningVi,
    on_reading: onStr ? onStr.split(",").filter(Boolean) : [],
    kun_reading: kunStr ? kunStr.split(",").filter(Boolean) : [],
    stroke_count: paths.length,
    examples: examplesStr
      .split(";;")
      .map((e) => e.trim())
      .filter((e) => e && !e.includes("| |"))
      .map((e) => {
        const [w, r, vi] = e.split("|");
        return { word: w.trim(), reading: (r ?? "").trim(), vi: (vi ?? "").trim() };
      })
      .filter((e) => e.word && e.vi),
    source: "nghĩa/âm: Kotori đối chiếu KANJIDIC2 (EDRDG); nét: KanjiVG",
    verified: paths.length > 0,
    order_index: i + 1,
  });
});

writeFileSync(join(root, "src", "content", "kanji-n5.json"), JSON.stringify({ items }, null, 1));
writeFileSync(join(root, "src", "content", "kanji-strokes.json"), JSON.stringify(strokes));
console.log(`kanji: ${items.length} chữ, strokes: ${items.length - missing.length}/${items.length}`);
if (missing.length) console.log("THIẾU:", missing.join(", "));
