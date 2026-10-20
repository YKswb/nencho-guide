# 様式画像の作り方（翌年分の更新用）

`index.html`（年末調整ガイド本体）の「実物の様式＋タップで記載例」は、国税庁の様式PDFを画像化した
`forms/f1.webp`〜`f4.webp` と、HTML内の `FORMS` データ（欄ごとの位置％と記載例）で動いています。

## 1. 様式PDFを取得（令和8年分の例）
- ① 扶養控除等申告書: https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/gensen/pdf/2027bun_01.pdf
  ※年末調整の時期に提出を受けるのは**翌年分**（令和8年の年末調整なら令和9年分）なので、①だけ年が1つ先。欄の位置は令和8年分と同じ
- ② 基礎・配偶者・特定親族・所得金額調整: 同 `2026bun_06.pdf`
- ③ 保険料控除申告書: 同 `2026bun_04.pdf`
- ④ 住宅ローン: 国税庁「年末調整で住宅借入金等特別控除を受ける方へ」の記載例 https://www.nta.go.jp/publication/pamph/shotoku/jukari/01.pdf の右側（申告書＋証明書）を切り抜き
  （`node render.mjs ../src/jukari_01.pdf ../src/jk1x 2.6 1` → `node img.mjs ../src/jk1x-1.png ../f4.webp 80 1470 190 1420 1810`）

翌年分は `2027bun_xx.pdf` / `nencho2027/...` のように年が変わるので、
国税庁「年末調整がよくわかるページ」からリンクをたどって確認してください。

## 2. 画像化（Node 18+）
```bash
npm i pdfjs-dist@4.10.38 @napi-rs/canvas@0.1.65   # このフォルダで一度だけ
node render.mjs ../src/2026bun_01.pdf ../src/f1 2.2 1   # → f1-1.png（1853×1310）
node img.mjs ../src/f1-1.png ../f1.webp 82               # WebPに変換（約200KB）
node img.mjs in.png out.webp 82 x y w h                  # 切り抜きたいとき（元画像のpx）
```

## 3. 枠位置の確認
```bash
node overlay.mjs ../../index.html .. ./check
```
HTML内の `FORMS` の枠（`box:[左%,上%,幅%,高さ%]`）を画像に重ね描きした
`check/form1-overlay.png` などができるので、ずれを見て `box` を直します。

## 4. 保険料控除ツール（hoken.html）の欄位置の確認
`hoken.html` は計算結果を `forms/f3.webp` の上に直接描きます。欄の座標は HTML 内の `const F`（様式画像 1853×1310px 上の px）。
```bash
node fields-check.mjs ../../hoken.html ../src/png/f3-1.png ./check/f3-fields.png
```
で全欄に枠と名前を描いた画像ができるので、様式が変わった年はこれでずれを確認して `F` を直します。

## 注意
- 様式が変わると欄の位置が動くので、翌年分は必ず overlay で確認すること。
- 記載例の人物設定（記入 太郎／花子／一郎／次郎）と金額は HTML の `FORMS` コメント参照。
