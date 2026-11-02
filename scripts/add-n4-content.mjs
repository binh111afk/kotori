// Bổ sung nội dung JLPT N4: từ vựng 8 unit (n4-v1 → n4-v8) + 12 điểm ngữ pháp mới & bài tập.
// Chạy một lần: node scripts/add-n4-content.mjs (ghi đè words trong vocab-n4.json, nối thêm vào grammar-n4.json)
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const contentDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "content");
const SRC = "JMdict; nghĩa chuẩn lớp học";

// [kana, kanji|null, romaji, nghĩa, từ loại, ví dụ, cách đọc ví dụ, nghĩa ví dụ]
const vocab = {
  1: [
    ["けいかく", "計画", "keikaku", "kế hoạch", "danh từ", "旅行の計画を立てます。", "りょこうのけいかくをたてます。", "Tôi lập kế hoạch du lịch."],
    ["よてい", "予定", "yotei", "lịch trình, dự định", "danh từ", "明日は予定がありません。", "あしたはよていがありません。", "Mai tôi không có lịch."],
    ["もくてき", "目的", "mokuteki", "mục đích", "danh từ", "旅行の目的は何ですか。", "りょこうのもくてきはなんですか。", "Mục đích chuyến đi là gì?"],
    ["きゅうりょう", "給料", "kyūryō", "lương", "danh từ", "給料をもらいました。", "きゅうりょうをもらいました。", "Tôi đã nhận lương."],
    ["かいぎ", "会議", "kaigi", "cuộc họp", "danh từ", "会議に遅れました。", "かいぎにおくれました。", "Tôi trễ cuộc họp."],
    ["いけん", "意見", "iken", "ý kiến", "danh từ", "意見を言います。", "いけんをいいます。", "Tôi nêu ý kiến."],
    ["かんがえ", "考え", "kangae", "suy nghĩ, quan điểm", "danh từ", "あなたの考えを教えてください。", "あなたのかんがえをおしえてください。", "Hãy cho tôi biết suy nghĩ của bạn."],
    ["じゅんび", "準備", "junbi", "chuẩn bị", "danh từ / động từ する", "会議の準備をします。", "かいぎのじゅんびをします。", "Tôi chuẩn bị cho cuộc họp."],
    ["せつめい", "説明", "setsumei", "giải thích", "danh từ / động từ する", "先生が説明します。", "せんせいがせつめいします。", "Thầy giáo giải thích."],
    ["れんらく", "連絡", "renraku", "liên lạc", "danh từ / động từ する", "あとで連絡します。", "あとでれんらくします。", "Lát nữa tôi sẽ liên lạc."],
    ["けいけん", "経験", "keiken", "kinh nghiệm", "danh từ", "仕事の経験があります。", "しごとのけいけんがあります。", "Tôi có kinh nghiệm làm việc."],
    ["ざんぎょう", "残業", "zangyō", "làm thêm giờ", "danh từ / động từ する", "今日は残業します。", "きょうはざんぎょうします。", "Hôm nay tôi làm thêm giờ."],
  ],
  2: [
    ["うれしい", "嬉しい", "ureshii", "vui mừng", "tính từ い", "合格してうれしいです。", "ごうかくしてうれしいです。", "Tôi vui vì đã thi đỗ."],
    ["かなしい", "悲しい", "kanashii", "buồn", "tính từ い", "悲しい映画を見ました。", "かなしいえいがをみました。", "Tôi đã xem một bộ phim buồn."],
    ["さびしい", "寂しい", "sabishii", "cô đơn, buồn tẻ", "tính từ い", "一人で寂しいです。", "ひとりでさびしいです。", "Ở một mình tôi thấy cô đơn."],
    ["はずかしい", "恥ずかしい", "hazukashii", "xấu hổ, ngượng", "tính từ い", "間違えて恥ずかしかったです。", "まちがえてはずかしかったです。", "Nhầm nên tôi thấy ngượng."],
    ["こわい", "怖い", "kowai", "sợ, đáng sợ", "tính từ い", "犬が怖いです。", "いぬがこわいです。", "Tôi sợ chó."],
    ["びっくり", null, "bikkuri", "giật mình, ngạc nhiên (びっくりする)", "trạng từ / động từ する", "大きい音にびっくりしました。", "おおきいおとにびっくりしました。", "Tôi giật mình vì tiếng động lớn."],
    ["あんしん", "安心", "anshin", "yên tâm", "danh từ / động từ する", "声を聞いて安心しました。", "こえをきいてあんしんしました。", "Nghe giọng bạn tôi yên tâm rồi."],
    ["しんぱい", "心配", "shinpai", "lo lắng", "danh từ / động từ する", "母が心配しています。", "ははがしんぱいしています。", "Mẹ đang lo lắng."],
    ["きもち", "気持ち", "kimochi", "cảm giác, tâm trạng", "danh từ", "気持ちがいいです。", "きもちがいいです。", "Cảm giác thật dễ chịu."],
    ["おもいだす", "思い出す", "omoidasu", "nhớ ra", "động từ nhóm 1", "名前を思い出しました。", "なまえをおもいだしました。", "Tôi đã nhớ ra tên."],
    ["よろこぶ", "喜ぶ", "yorokobu", "vui mừng, hân hoan", "động từ nhóm 1", "子どもがとても喜びました。", "こどもがとてもよろこびました。", "Bọn trẻ rất vui."],
    ["おどろく", "驚く", "odoroku", "ngạc nhiên", "động từ nhóm 1", "そのニュースに驚きました。", "そのにゅーすにおどろきました。", "Tôi ngạc nhiên trước tin đó."],
  ],
  3: [
    ["こうつう", "交通", "kōtsū", "giao thông", "danh từ", "この町は交通が便利です。", "このまちはこうつうがべんりです。", "Thị trấn này giao thông thuận tiện."],
    ["ちかてつ", "地下鉄", "chikatetsu", "tàu điện ngầm", "danh từ", "地下鉄で会社へ行きます。", "ちかてつでかいしゃへいきます。", "Tôi đi làm bằng tàu điện ngầm."],
    ["のりかえる", "乗り換える", "norikaeru", "đổi tàu/xe", "động từ nhóm 2", "東京駅で乗り換えます。", "とうきょうえきでのりかえます。", "Tôi đổi tàu ở ga Tokyo."],
    ["とっきゅう", "特急", "tokkyū", "tàu tốc hành đặc biệt", "danh từ", "特急に乗りました。", "とっきゅうにのりました。", "Tôi đã đi tàu tốc hành đặc biệt."],
    ["きゅうこう", "急行", "kyūkō", "tàu nhanh", "danh từ", "急行はこの駅に止まりません。", "きゅうこうはこのえきにとまりません。", "Tàu nhanh không dừng ở ga này."],
    ["しんごう", "信号", "shingō", "đèn giao thông", "danh từ", "信号が赤です。", "しんごうがあかです。", "Đèn đang đỏ."],
    ["こうさてん", "交差点", "kōsaten", "ngã tư", "danh từ", "次の交差点を右に曲がってください。", "つぎのこうさてんをみぎにまがってください。", "Hãy rẽ phải ở ngã tư tiếp theo."],
    ["うんてん", "運転", "unten", "lái xe", "danh từ / động từ する", "車を運転します。", "くるまをうんてんします。", "Tôi lái ô tô."],
    ["ひっこす", "引っ越す", "hikkosu", "chuyển nhà", "động từ nhóm 1", "来月大阪に引っ越します。", "らいげつおおさかにひっこします。", "Tháng sau tôi chuyển đến Osaka."],
    ["おくれる", "遅れる", "okureru", "bị trễ, muộn", "động từ nhóm 2", "電車が遅れました。", "でんしゃがおくれました。", "Tàu điện đã bị trễ."],
    ["とまる", "止まる", "tomaru", "dừng lại", "động từ nhóm 1", "車が止まりました。", "くるまがとまりました。", "Xe đã dừng lại."],
    ["ちゅうしゃじょう", "駐車場", "chūshajō", "bãi đỗ xe", "danh từ", "駐車場はどこですか。", "ちゅうしゃじょうはどこですか。", "Bãi đỗ xe ở đâu?"],
  ],
  4: [
    ["ねつ", "熱", "netsu", "sốt", "danh từ", "熱があります。", "ねつがあります。", "Tôi bị sốt."],
    ["かぜ", "風邪", "kaze", "cảm lạnh", "danh từ", "風邪をひきました。", "かぜをひきました。", "Tôi bị cảm."],
    ["せき", "咳", "seki", "ho", "danh từ", "せきが出ます。", "せきがでます。", "Tôi bị ho."],
    ["けが", "怪我", "kega", "vết thương, bị thương", "danh từ / động từ する", "足にけがをしました。", "あしにけがをしました。", "Tôi bị thương ở chân."],
    ["ぐあい", "具合", "guai", "tình trạng (sức khỏe)", "danh từ", "具合はどうですか。", "ぐあいはどうですか。", "Bạn thấy trong người thế nào?"],
    ["きぶん", "気分", "kibun", "tâm trạng, cảm giác trong người", "danh từ", "気分が悪いです。", "きぶんがわるいです。", "Tôi thấy khó chịu trong người."],
    ["ちゅうしゃ", "注射", "chūsha", "tiêm", "danh từ", "注射は痛いです。", "ちゅうしゃはいたいです。", "Tiêm thì đau."],
    ["にゅういん", "入院", "nyūin", "nhập viện", "danh từ / động từ する", "父が入院しました。", "ちちがにゅういんしました。", "Bố tôi đã nhập viện."],
    ["たいいん", "退院", "taiin", "xuất viện", "danh từ / động từ する", "来週退院します。", "らいしゅうたいいんします。", "Tuần sau tôi xuất viện."],
    ["なおる", "治る", "naoru", "khỏi (bệnh)", "động từ nhóm 1", "風邪が治りました。", "かぜがなおりました。", "Tôi đã khỏi cảm."],
    ["けんこう", "健康", "kenkō", "sức khỏe", "danh từ / tính từ な", "健康のために歩きます。", "けんこうのためにあるきます。", "Tôi đi bộ vì sức khỏe."],
    ["かんごし", "看護師", "kangoshi", "y tá", "danh từ", "姉は看護師です。", "あねはかんごしです。", "Chị tôi là y tá."],
  ],
  5: [
    ["だいどころ", "台所", "daidokoro", "nhà bếp", "danh từ", "母は台所にいます。", "はははだいどころにいます。", "Mẹ đang ở trong bếp."],
    ["たたみ", "畳", "tatami", "chiếu tatami", "danh từ", "畳の部屋で寝ます。", "たたみのへやでねます。", "Tôi ngủ trong phòng trải chiếu tatami."],
    ["おしいれ", "押し入れ", "oshiire", "tủ âm tường (kiểu Nhật)", "danh từ", "布団を押し入れに入れます。", "ふとんをおしいれにいれます。", "Tôi cất chăn nệm vào tủ âm tường."],
    ["かべ", "壁", "kabe", "bức tường", "danh từ", "壁に絵を掛けます。", "かべにえをかけます。", "Tôi treo tranh lên tường."],
    ["やね", "屋根", "yane", "mái nhà", "danh từ", "屋根が赤い家です。", "やねがあかいいえです。", "Đó là ngôi nhà mái đỏ."],
    ["たな", "棚", "tana", "kệ, giá", "danh từ", "本を棚に置きます。", "ほんをたなにおきます。", "Tôi đặt sách lên kệ."],
    ["ひきだし", "引き出し", "hikidashi", "ngăn kéo", "danh từ", "はさみは引き出しの中です。", "はさみはひきだしのなかです。", "Cái kéo ở trong ngăn kéo."],
    ["れいぞうこ", "冷蔵庫", "reizōko", "tủ lạnh", "danh từ", "牛乳は冷蔵庫にあります。", "ぎゅうにゅうはれいぞうこにあります。", "Sữa ở trong tủ lạnh."],
    ["だんぼう", "暖房", "danbō", "máy sưởi, hệ thống sưởi", "danh từ", "暖房をつけてください。", "だんぼうをつけてください。", "Hãy bật máy sưởi lên."],
    ["れいぼう", "冷房", "reibō", "điều hòa (làm mát)", "danh từ", "冷房が強すぎます。", "れいぼうがつよすぎます。", "Điều hòa lạnh quá."],
    ["かぐ", "家具", "kagu", "đồ nội thất", "danh từ", "新しい家具を買いました。", "あたらしいかぐをかいました。", "Tôi đã mua đồ nội thất mới."],
    ["すいどう", "水道", "suidō", "nước máy, đường ống nước", "danh từ", "水道の水を飲みます。", "すいどうのみずをのみます。", "Tôi uống nước máy."],
  ],
  6: [
    ["しぜん", "自然", "shizen", "thiên nhiên", "danh từ", "この町は自然が多いです。", "このまちはしぜんがおおいです。", "Thị trấn này có nhiều thiên nhiên."],
    ["たいふう", "台風", "taifū", "bão", "danh từ", "台風が来ています。", "たいふうがきています。", "Bão đang đến."],
    ["じしん", "地震", "jishin", "động đất", "danh từ", "昨日地震がありました。", "きのうじしんがありました。", "Hôm qua có động đất."],
    ["かみなり", "雷", "kaminari", "sấm sét", "danh từ", "雷が鳴っています。", "かみなりがなっています。", "Sấm đang rền."],
    ["くも", "雲", "kumo", "mây", "danh từ", "空に雲がありません。", "そらにくもがありません。", "Trên trời không có mây."],
    ["ほし", "星", "hoshi", "ngôi sao", "danh từ", "星がきれいです。", "ほしがきれいです。", "Sao đẹp quá."],
    ["つき", "月", "tsuki", "mặt trăng", "danh từ", "今夜は月が明るいです。", "こんやはつきがあかるいです。", "Đêm nay trăng sáng."],
    ["しま", "島", "shima", "hòn đảo", "danh từ", "小さい島に行きました。", "ちいさいしまにいきました。", "Tôi đã đến một hòn đảo nhỏ."],
    ["みずうみ", "湖", "mizuumi", "hồ", "danh từ", "湖で泳ぎました。", "みずうみでおよぎました。", "Tôi đã bơi ở hồ."],
    ["はやし", "林", "hayashi", "rừng thưa, lùm cây", "danh từ", "林の中を歩きます。", "はやしのなかをあるきます。", "Tôi đi bộ trong rừng cây."],
    ["はれる", "晴れる", "hareru", "(trời) quang, nắng", "động từ nhóm 2", "明日は晴れるでしょう。", "あしたははれるでしょう。", "Ngày mai có lẽ trời sẽ nắng."],
    ["くもる", "曇る", "kumoru", "(trời) nhiều mây", "động từ nhóm 1", "午後から曇ります。", "ごごからくもります。", "Từ chiều trời sẽ nhiều mây."],
  ],
  7: [
    ["まい", "枚", "mai", "~ tờ, tấm (vật mỏng)", "lượng từ", "切手を三枚ください。", "きってをさんまいください。", "Cho tôi ba con tem."],
    ["ほん", "本", "hon", "~ cây, chiếc (vật dài)", "lượng từ", "鉛筆が二本あります。", "えんぴつがにほんあります。", "Có hai cây bút chì."],
    ["ひき", "匹", "hiki", "~ con (động vật nhỏ)", "lượng từ", "猫が三匹います。", "ねこがさんびきいます。", "Có ba con mèo."],
    ["さつ", "冊", "satsu", "~ quyển", "lượng từ", "本を二冊買いました。", "ほんをにさつかいました。", "Tôi đã mua hai quyển sách."],
    ["だい", "台", "dai", "~ chiếc (máy móc, xe)", "lượng từ", "車が一台あります。", "くるまがいちだいあります。", "Có một chiếc ô tô."],
    ["はい", "杯", "hai", "~ cốc, chén, bát", "lượng từ", "お茶を一杯ください。", "おちゃをいっぱいください。", "Cho tôi một chén trà."],
    ["こ", "個", "ko", "~ cái, quả (vật nhỏ)", "lượng từ", "りんごを五個買いました。", "りんごをごこかいました。", "Tôi đã mua năm quả táo."],
    ["にん", "人", "nin", "~ người", "lượng từ", "家族は四人です。", "かぞくはよにんです。", "Gia đình tôi có bốn người."],
    ["かい", "回", "kai", "~ lần", "lượng từ", "週に二回泳ぎます。", "しゅうににかいおよぎます。", "Tôi bơi hai lần một tuần."],
    ["かい", "階", "kai", "tầng ~", "lượng từ", "事務所は五階です。", "じむしょはごかいです。", "Văn phòng ở tầng năm."],
    ["ばんめ", "番目", "banme", "thứ ~ (số thứ tự)", "hậu tố", "二番目の駅で降ります。", "にばんめのえきでおります。", "Tôi xuống ở ga thứ hai."],
    ["ど", "度", "do", "~ độ; ~ lần", "lượng từ", "熱が三十八度あります。", "ねつがさんじゅうはちどあります。", "Tôi sốt 38 độ."],
  ],
  8: [
    ["ひどい", null, "hidoi", "tồi tệ, khủng khiếp", "tính từ い", "ひどい雨ですね。", "ひどいあめですね。", "Mưa to khủng khiếp nhỉ."],
    ["すごい", null, "sugoi", "ghê, tuyệt vời", "tính từ い", "この景色はすごいです。", "このけしきはすごいです。", "Phong cảnh này tuyệt quá."],
    ["ふかい", "深い", "fukai", "sâu", "tính từ い", "この川は深いです。", "このかわはふかいです。", "Con sông này sâu."],
    ["あさい", "浅い", "asai", "nông", "tính từ い", "この川は浅いです。", "このかわはあさいです。", "Con sông này nông."],
    ["ねっしん", "熱心", "nesshin", "nhiệt tình, chăm chỉ", "tính từ な", "彼は熱心に勉強します。", "かれはねっしんにべんきょうします。", "Anh ấy học hành chăm chỉ."],
    ["ていねい", "丁寧", "teinei", "lịch sự; cẩn thận", "tính từ な", "丁寧に書いてください。", "ていねいにかいてください。", "Hãy viết cẩn thận."],
    ["ふくざつ", "複雑", "fukuzatsu", "phức tạp", "tính từ な", "この問題は複雑です。", "このもんだいはふくざつです。", "Vấn đề này phức tạp."],
    ["かならず", "必ず", "kanarazu", "nhất định, chắc chắn", "trạng từ", "必ず来てください。", "かならずきてください。", "Nhất định hãy đến nhé."],
    ["ぜひ", "是非", "zehi", "nhất định (mong muốn)", "trạng từ", "ぜひ遊びに来てください。", "ぜひあそびにきてください。", "Nhất định hãy đến chơi nhé."],
    ["なかなか", null, "nakanaka", "mãi mà (không); khá là", "trạng từ", "電車がなかなか来ません。", "でんしゃがなかなかきません。", "Tàu mãi chẳng thấy đến."],
    ["だんだん", null, "dandan", "dần dần", "trạng từ", "だんだん寒くなりました。", "だんだんさむくなりました。", "Trời dần lạnh đi."],
    ["きっと", null, "kitto", "chắc chắn (phỏng đoán)", "trạng từ", "明日はきっと晴れます。", "あしたはきっとはれます。", "Ngày mai chắc chắn trời nắng."],
  ],
};
const vocabFile = join(contentDir, "vocab-n4.json");
const vocabData = JSON.parse(readFileSync(vocabFile, "utf8"));
vocabData.words = Object.entries(vocab).flatMap(([u, rows]) =>
  rows.map(([kana, kanji, romaji, meaning_vi, pos, example_jp, example_reading, example_vi], i) => ({
    id: `n4v${u}-${String(i + 1).padStart(2, "0")}`,
    unit_id: `n4-v${u}`,
    level: "n4",
    kana,
    kanji,
    romaji,
    meaning_vi,
    pos,
    example_jp,
    example_reading,
    example_vi,
    source: kanji ? `JMdict (${kanji}); nghĩa chuẩn lớp học` : `JMdict (${kana}); nghĩa chuẩn lớp học`,
    verified: true,
  })),
);
writeFileSync(vocabFile, JSON.stringify(vocabData, null, 2) + "\n");

// "雨[あめ]が降[ふ]る" → segments furigana
const seg = (s) => {
  const out = [];
  let last = 0;
  for (const m of s.matchAll(/([一-鿿々]+)\[([^\]]+)\]/g)) {
    if (m.index > last) out.push({ t: s.slice(last, m.index) });
    out.push({ t: m[1], r: m[2] });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ t: s.slice(last) });
  return out;
};

const points = [
  ["gn4-1-3", "n4-u1", "～ようになる: trở nên (có thể / có thói quen)",
    "[Động từ nguyên mẫu / khả động] ようになりました",
    "Diễn tả sự thay đổi theo thời gian: trước không làm được (hoặc không có thói quen), nay đã làm được / đã thành thói quen. Hay đi với khả động: 泳げるようになりました.",
    ["Dùng với tính từ/danh từ: 「元気ようになる」 sai — tính từ dùng ～く/～になる: 元気になる.", "Nhầm với ～ことになる (được quyết định) — ようになる là thay đổi năng lực, thói quen."],
    [["日本語[にほんご]が話[はな]せるようになりました。", "Tôi đã nói được tiếng Nhật."], ["毎朝[まいあさ]運動[うんどう]するようになりました。", "Tôi đã có thói quen tập thể dục mỗi sáng."]],
    "Minna II bài 36"],
  ["gn4-2-4", "n4-u2", "～と: hễ … thì (kết quả tất yếu)",
    "[Động từ / tính từ thể thường hiện tại] と、～",
    "と dùng khi vế sau là kết quả tự nhiên, luôn xảy ra: chỉ đường, cách dùng máy móc, quy luật. Vế sau KHÔNG dùng ý chí, nhờ vả, mời rủ.",
    ["Vế sau là nhờ vả: 「駅に着くと、電話してください」 sai — dùng たら: 着いたら、電話してください.", "Chia quá khứ trước と: 「押したと」 sai — luôn dùng thể hiện tại: 押すと."],
    [["このボタンを押[お]すと、お釣[つ]りが出[で]ます。", "Bấm nút này thì tiền thừa sẽ ra."], ["右[みぎ]へ曲[ま]がると、駅[えき]があります。", "Rẽ phải là sẽ thấy nhà ga."]],
    "Minna II bài 23"],
  ["gn4-3-4", "n4-u3", "～てあります: đã được làm sẵn (trạng thái có chủ ý)",
    "N が [Tha động từ て-form] あります",
    "Diễn tả trạng thái còn lại sau khi ai đó cố ý làm việc gì (thường để chuẩn bị). Dùng tha động từ, đối tượng chuyển sang が. Khác với tự động từ + ています chỉ đơn thuần tả trạng thái: 窓が開いています.",
    ["Dùng tự động từ: 「窓が開いてあります」 sai — tha động từ: 窓が開けてあります; tự động từ: 窓が開いています.", "Nhầm với ～ておきます: ておきます là hành động làm trước, てあります là trạng thái kết quả."],
    [["壁[かべ]にカレンダーが掛[か]けてあります。", "Trên tường có treo sẵn tấm lịch."], ["ホテルはもう予約[よやく]してあります。", "Khách sạn đã được đặt sẵn rồi."]],
    "Minna II bài 30"],
  ["gn4-3-5", "n4-u3", "～てきます: đi làm gì rồi quay lại / dần dần đến nay",
    "[Động từ て-form] きます",
    "Nghĩa 1: đi đâu đó làm một việc rồi quay về chỗ cũ: ちょっと飲み物を買ってきます. Nghĩa 2: sự thay đổi tiến dần đến hiện tại: 寒くなってきました.",
    ["Dùng khi không quay lại: ～てきます luôn hàm ý trở về chỗ người nói.", "Nhầm với ～ていきます: ていきます hướng ra xa / tiếp diễn về sau."],
    [["ちょっと飲[の]み物[もの]を買[か]ってきます。", "Tôi đi mua đồ uống chút rồi về."], ["だんだん寒[さむ]くなってきました。", "Trời đã dần lạnh lên."]],
    "Minna no Nihongo II; Genki II"],
  ["gn4-4-2", "n4-u4", "Bị động gây phiền: ～に～られました",
    "[Người chịu ảnh hưởng] は [người gây ra] に [N を] Vられます",
    "Tiếng Nhật dùng bị động để nói mình bị ảnh hưởng (thường là phiền, thiệt) bởi hành động của người khác, kể cả với tự động từ: 雨に降られました (bị mắc mưa).",
    ["Lấy bộ phận cơ thể/đồ vật làm chủ ngữ: 「私の足が踏まれました」 không tự nhiên — nói 私は足を踏まれました.", "Quên に trước người gây ra: 「弟がケーキを食べられました」 sai nghĩa — 弟にケーキを食べられました."],
    [["電車[でんしゃ]で足[あし]を踏[ふ]まれました。", "Tôi bị giẫm vào chân trên tàu."], ["帰[かえ]りに雨[あめ]に降[ふ]られました。", "Trên đường về tôi bị mắc mưa."]],
    "Minna II bài 37; Genki II bài 21"],
  ["gn4-5-2", "n4-u5", "～させてください: xin cho phép tôi",
    "[Động từ thể sai khiến て-form] ください / いただけませんか",
    "Thể sai khiến + てください dùng để xin phép được làm việc gì: 少し休ませてください. Lịch sự hơn: ～させていただけませんか.",
    ["Chia sai nhóm 1: 「休まさせて」 sai — 休む → 休ませる → 休ませて.", "Với cấp trên trong tình huống trang trọng, ～てもいいですか kém lịch sự hơn ～させていただけませんか."],
    [["すみません、少[すこ]し休[やす]ませてください。", "Xin lỗi, cho tôi nghỉ một chút."], ["この仕事[しごと]は私[わたし]にやらせてください。", "Việc này xin hãy để tôi làm."]],
    "Minna II bài 48"],
  ["gn4-6-5", "n4-u6", "～そうです (様態): trông có vẻ",
    "[Vます bỏ ます] そうです · [Tính từ い bỏ い] そうです · [Tính từ な] そうです · いい → よさそう",
    "Nói ấn tượng từ những gì nhìn thấy, hoặc đoán điều sắp xảy ra: 雨が降りそうです, このケーキはおいしそうです. Khác ～そうです truyền đạt (gắn sau thể thường: 降るそうです = nghe nói sẽ mưa).",
    ["Gắn sau thể thường: 「おいしいそうです」 = nghe nói ngon, không phải \"trông ngon\" — phải là おいしそうです.", "いい → 「いそう」 sai — phải là よさそう; ない → なさそう."],
    [["雨[あめ]が降[ふ]りそうですね。", "Trời có vẻ sắp mưa nhỉ."], ["このケーキはおいしそうです。", "Cái bánh này trông ngon quá."]],
    "Minna II bài 43; Genki II bài 13"],
  ["gn4-6-6", "n4-u6", "～かもしれません: có lẽ, không chừng",
    "[Động từ / tính từ い thể thường] かもしれません · [Danh từ / tính từ な] かもしれません (bỏ だ)",
    "Phỏng đoán với độ chắc chắn thấp (khoảng một nửa). Danh từ và tính từ な bỏ だ: 病気かもしれません.",
    ["Giữ だ: 「病気だかもしれません」 sai — 病気かもしれません.", "Dùng ます trước: 「来ますかもしれません」 sai — 来るかもしれません."],
    [["午後[ごご]から雨[あめ]が降[ふ]るかもしれません。", "Từ chiều có lẽ trời sẽ mưa."], ["田中[たなか]さんは今日[きょう]来[こ]ないかもしれません。", "Anh Tanaka có lẽ hôm nay không đến."]],
    "Minna I bài 32"],
  ["gn4-7-3", "n4-u7", "～し、～し: vừa … lại vừa (liệt kê lý do)",
    "[Thể thường] し、[thể thường] し、～",
    "Liệt kê nhiều lý do hoặc đặc điểm cùng chiều, ngụ ý \"còn nữa\": この店は安いし、おいしいし、よく来ます. Danh từ / tính từ な thêm だ: 静かだし.",
    ["Quên だ với danh từ / tính từ な: 「静かし」 sai — 静かだし.", "Liệt kê ý trái chiều: し dùng cho các ý cùng hướng (cùng tốt hoặc cùng xấu)."],
    [["この店[みせ]は安[やす]いし、おいしいし、よく来[き]ます。", "Quán này vừa rẻ lại ngon nên tôi hay đến."], ["今日[きょう]は雨[あめ]だし、寒[さむ]いし、出[で]かけたくないです。", "Hôm nay mưa, lại lạnh, nên tôi không muốn ra ngoài."]],
    "Minna II bài 28"],
  ["gn4-8-5", "n4-u8", "～ために: để (mục đích)",
    "[Động từ nguyên mẫu (ý chí)] ために · [N] のために",
    "Nêu mục đích có chủ ý; động từ phải là hành động người nói kiểm soát được. N + のために còn có nghĩa \"vì (lợi ích của) N\".",
    ["Dùng với khả động / động từ không ý chí: 「話せるために」 sai — dùng ように: 話せるように.", "Quên の: 「健康ために」 sai — 健康のために."],
    [["家[いえ]を買[か]うために、貯金[ちょきん]しています。", "Tôi đang tiết kiệm để mua nhà."], ["健康[けんこう]のために、毎日[まいにち]歩[ある]きます。", "Vì sức khỏe, tôi đi bộ mỗi ngày."]],
    "Minna II bài 42"],
  ["gn4-8-6", "n4-u8", "～のに: vậy mà, thế mà",
    "[Thể thường] のに · [Danh từ / tính từ な] なのに",
    "Diễn tả kết quả trái với mong đợi, thường kèm cảm xúc bất mãn hoặc tiếc nuối: 約束したのに、来ませんでした.",
    ["Danh từ / tính từ な dùng 「だのに」 sai — phải là なのに: 日曜日なのに.", "Vế sau dùng mệnh lệnh / ý chí: のに chỉ nêu sự thật trái ý mong đợi."],
    [["約束[やくそく]したのに、彼[かれ]は来[き]ませんでした。", "Đã hẹn rồi vậy mà anh ấy không đến."], ["日曜日[にちようび]なのに、仕事[しごと]があります。", "Chủ nhật vậy mà vẫn phải làm việc."]],
    "Minna II bài 45"],
  ["gn4-8-7", "n4-u8", "Thể ý chí ～(よ)う: nào / định làm",
    "Nhóm 1: う → おう (行く → 行こう) · Nhóm 2: る → よう (食べる → 食べよう) · する → しよう, 来る → 来よう · ～(よ)うと思っています",
    "Thể ý chí là dạng thân mật của ～ましょう (行こう = đi thôi). Kết hợp ～と思っています để nói dự định của bản thân: 来年日本へ行こうと思っています.",
    ["Nhóm 1 chia sai: 「行きよう」 sai — 行こう.", "Dự định đã có từ trước nên dùng ～と思っています; ～と思います thường là quyết định ngay lúc nói."],
    [["来年[らいねん]日本[にほん]へ行[い]こうと思[おも]っています。", "Tôi định năm sau sang Nhật."], ["疲[つか]れたから、少[すこ]し休[やす]もう。", "Mệt rồi, nghỉ chút thôi."]],
    "Minna II bài 31"],
  ["gn4-8-8", "n4-u8", "～ことにします / ～ことになります: quyết định / được quyết định",
    "[Vる / Vない] ことにします (tự quyết) · ことになります (được quyết định)",
    "ことにする: chính mình quyết định. ことになる: quyết định do tổ chức, hoàn cảnh, không phải chủ ý mình. ことにしている: thói quen mình tự đặt ra.",
    ["Dùng ます trước こと: 「行きますことにします」 sai — 行くことにします.", "Nhầm với ようになる (thay đổi năng lực / thói quen)."],
    [["明日[あした]から甘[あま]い物[もの]を食[た]べないことにします。", "Từ mai tôi quyết định không ăn đồ ngọt."], ["来月[らいげつ]大阪[おおさか]へ転勤[てんきん]することになりました。", "Tháng sau tôi được điều chuyển công tác sang Osaka."]],
    "Genki II bài 23; Minna no Nihongo II"],
];

const choice = (question, options, answerIndex) => ({ type: "choice", payload: { question, options, answerIndex } });
const fill = (before, after, accepted, translation) => ({
  type: "fill",
  payload: { before, after, accepted, full: before + accepted[0] + after, translation },
});
const exercises = [
  ["gn4-1-3", choice("練習して、ピアノが弾け＿＿＿。(Nhờ luyện tập, tôi đã chơi được piano.)", ["るようになりました", "ることになりました", "させました"], 0), "Khả động 弾ける + ようになりました: thay đổi năng lực."],
  ["gn4-2-4", fill("このボタンを押", "、ドアが開きます。", ["すと"], "Bấm nút này thì cửa sẽ mở."), "Kết quả tất yếu → thể hiện tại + と."],
  ["gn4-3-4", choice("\"Trên bàn có đặt sẵn hoa (ai đó đã đặt)\" là câu nào?", ["机の上に花が置いてあります。", "机の上に花が置いています。", "机の上に花を置きてあります。"], 0), "置く là tha động từ → 置いてあります, đối tượng dùng が."],
  ["gn4-3-5", fill("ちょっとコンビニへ行って", "。", ["きます"], "Tôi đi cửa hàng tiện lợi chút rồi về."), "～てきます: đi làm gì rồi quay lại."],
  ["gn4-4-2", choice("\"Tôi bị mắc mưa\" là:", ["雨に降られました。", "雨が降らせました。", "雨を降りました。"], 0), "Bị động gây phiền với tự động từ: 雨に降られる."],
  ["gn4-5-2", fill("すみません、少し休", "ください。", ["ませて"], "Xin lỗi, cho tôi nghỉ một chút."), "休む → sai khiến 休ませる → 休ませてください."],
  ["gn4-6-5", choice("\"Cái bánh này trông ngon\" là:", ["このケーキはおいしそうです。", "このケーキはおいしいそうです。", "このケーキはおいしくそうです。"], 0), "様態: tính từ い bỏ い + そうです. おいしいそうです là \"nghe nói ngon\"."],
  ["gn4-6-6", fill("田中さんは病気", "。", ["かもしれません"], "Anh Tanaka có lẽ bị ốm."), "Danh từ + かもしれません (không có だ)."],
  ["gn4-7-3", choice("この部屋は広い＿＿、明るい＿＿、気に入りました。", ["し／し", "て／て", "が／が"], 0), "Liệt kê lý do cùng chiều: ～し、～し."],
  ["gn4-8-5", choice("日本語が話せる＿＿、毎日練習します。", ["ように", "ために", "のに"], 0), "話せる là khả động (không ý chí) → dùng ように, không dùng ために."],
  ["gn4-8-6", fill("日曜日", "、会社へ行きました。", ["なのに"], "Chủ nhật vậy mà tôi vẫn đến công ty."), "Danh từ + なのに."],
  ["gn4-8-7", choice("Thể ý chí của 飲む là:", ["飲もう", "飲みよう", "飲まう"], 0), "Nhóm 1: う-hàng → お-hàng + う: 飲む → 飲もう."],
  ["gn4-8-8", fill("来月から毎朝走る", "。", ["ことにします", "ことにしました"], "Tôi quyết định từ tháng sau sáng nào cũng chạy bộ."), "Tự mình quyết định → ことにします."],
];

const grammarFile = join(contentDir, "grammar-n4.json");
const grammar = JSON.parse(readFileSync(grammarFile, "utf8"));
const g11 = grammar.points.find((p) => p.id === "gn4-1-1");
g11.mistakes_vi[0] = "Dùng ます-form trước こと: 「話しますことが」 sai — phải là nguyên mẫu 話すこと.";

const have = new Set(grammar.points.map((p) => p.id));
for (const [id, unit_id, title, structure, explanation_vi, mistakes_vi, examples, source] of points) {
  if (have.has(id)) continue;
  grammar.points.push({
    id, unit_id, title, structure, explanation_vi, mistakes_vi,
    examples: examples.map(([s, vi]) => ({ segments: seg(s), vi })),
    source, verified: true,
  });
}
// giữ thứ tự theo unit để trang bài học hiển thị liền mạch
const key = (id) => id.split("-").slice(1).map(Number);
grammar.points.sort((a, b) => { const [a1, a2] = key(a.id), [b1, b2] = key(b.id); return a1 - b1 || a2 - b2; });
grammar.points.forEach((p, i) => (p.order_index = 200 + i));

let order = Math.max(...grammar.exercises.map((x) => x.order_index));
const haveX = new Set(grammar.exercises.map((x) => x.id));
for (const [grammar_id, ex, explanation_vi] of exercises) {
  const id = `x-n4b-${grammar_id.slice(4)}`;
  if (haveX.has(id)) continue;
  grammar.exercises.push({
    id, grammar_id, unit_id: `n4-u${grammar_id.split("-")[1]}`, ...ex,
    explanation_vi, source: "kotori — soạn theo Minna II / Genki II", verified: true, order_index: ++order,
  });
}
writeFileSync(grammarFile, JSON.stringify(grammar, null, 2) + "\n");
console.log(`vocab-n4: ${vocabData.words.length} từ · grammar-n4: ${grammar.points.length} điểm, ${grammar.exercises.length} bài tập`);
