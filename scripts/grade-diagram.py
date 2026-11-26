# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow", "numpy"]
# ///
"""手描き図解画像の後処理スクリプト（math_4.png トーン＆コントラスト合わせ）。

画像生成モデルが出力する「紙っぽい黄ばみ」「低彩度・くすみ」「わずかなボケ」を取り除き、
リファレンス画像（images/books/tar/math_4.png）のような純白背景・高彩度・明快なデジタルペン風へ整えます。

使い方:
    # 1枚または複数ファイルを上書き補正（PNG出力、JPG入力なら自動で同名PNGへ変換可能）
    uv run scripts/grade-diagram.py images/articles/arch_usd_01_pipeline.png

    # 出力先ディレクトリを指定して一括処理
    uv run scripts/grade-diagram.py --out-dir images/articles/graded images/articles/arch_usd_*.png

    # 強度を調整して試す（既定: 1.0）
    uv run scripts/grade-diagram.py --strength 0.85 images/articles/arch_usd_01_pipeline.png
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


def smoothstep(edge0: float, edge1: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def rgb_to_hsv(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """rgb: float32 [..., 3] in [0, 1] -> (h_deg [0, 360), s [0, 1], v [0, 1])"""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    cmax = np.maximum(np.maximum(r, g), b)
    cmin = np.minimum(np.minimum(r, g), b)
    delta = cmax - cmin

    h = np.zeros_like(cmax)
    nz = delta > 1e-6
    rm = nz & (cmax == r)
    gm = nz & (cmax == g) & ~rm
    bm = nz & ~rm & ~gm
    h[rm] = (((g[rm] - b[rm]) / delta[rm]) % 6.0) * 60.0
    h[gm] = (((b[gm] - r[gm]) / delta[gm]) + 2.0) * 60.0
    h[bm] = (((r[bm] - g[bm]) / delta[bm]) + 4.0) * 60.0

    s = np.where(cmax > 1e-6, delta / np.maximum(cmax, 1e-6), 0.0)
    return h, s, cmax


def hsv_to_rgb(h: np.ndarray, s: np.ndarray, v: np.ndarray) -> np.ndarray:
    """h_deg [0, 360), s [0, 1], v [0, 1] -> float32 [..., 3] in [0, 1]"""
    h6 = (h % 360.0) / 60.0
    c = v * s
    x = c * (1.0 - np.abs((h6 % 2.0) - 1.0))
    m = v - c

    z = np.zeros_like(h6)
    i = np.floor(h6).astype(np.int32) % 6
    r = np.select([i == 0, i == 1, i == 2, i == 3, i == 4, i == 5], [c, x, z, z, x, c])
    g = np.select([i == 0, i == 1, i == 2, i == 3, i == 4, i == 5], [x, c, c, x, z, z])
    b = np.select([i == 0, i == 1, i == 2, i == 3, i == 4, i == 5], [z, z, x, c, c, x])
    return np.clip(np.stack([r + m, g + m, b + m], axis=-1), 0.0, 1.0)


def hue_weight(h: np.ndarray, center: float, half_width: float, feather: float = 15.0) -> np.ndarray:
    """循環色相に対する滑らかな帯域マスク [0, 1]"""
    dist = np.abs(((h - center + 180.0) % 360.0) - 180.0)
    return 1.0 - smoothstep(half_width - feather, half_width + feather, dist)


def grade_array(rgb_u8: np.ndarray, strength: float = 1.0) -> np.ndarray:
    """math_4.png 基準の純白化・彩度補正・コントラスト調整を適用する。"""
    orig = rgb_u8.astype(np.float32) / 255.0
    rgb = orig.copy()

    # 1. 背景の黄ばみ・紙ノイズ除去（無彩色かつ白に近い領域のみ純白へ引き上げ）
    h, s, v = rgb_to_hsv(rgb)
    lum = 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]
    # 薄い黄色マーカー（s >= 0.10）は保護し、背景のクリーム色ノイズ（s < 0.08, lum > 0.91）だけ純白化
    bg_neutral = 1.0 - smoothstep(0.035, 0.095, s)
    bg_bright = smoothstep(0.90, 0.965, lum)
    bg_mask = bg_neutral * bg_bright
    rgb = rgb * (1.0 - bg_mask[..., None]) + 1.0 * bg_mask[..., None]

    # ごくわずかな紙の白点シフトを全体でも補正（RGB個別ではなくニュートラル白点251/255で軽く締める）
    white_pt = 252.0 / 255.0
    rgb = np.clip(rgb / white_pt, 0.0, 1.0)

    # 2. HSV空間で色相別の彩度・明度・インクコントラストを math_4.png へ寄せる
    h, s, v = rgb_to_hsv(rgb)
    lum = 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]

    # 色相帯域マスク（有彩色インクのみに効かせる）
    chroma_soft = smoothstep(0.08, 0.22, s)
    chroma_strong = smoothstep(0.22, 0.40, s)

    w_red = hue_weight(h, 4.0, 22.0, 12.0) * chroma_strong
    w_yellow = hue_weight(h, 47.0, 16.0, 10.0) * chroma_soft
    w_green = hue_weight(h, 85.0, 28.0, 14.0) * chroma_soft
    w_blue = hue_weight(h, 212.0, 26.0, 14.0) * chroma_soft

    # (a) 全体的な有彩色彩度リフト（紙っぽい低彩度 -> クリアなデジタルインク）
    s_new = s * (1.0 + 0.16 * chroma_soft)

    # (b) 赤：くすんだエンジ色 -> math_4.png の鮮やかな赤（RGB [234, 24, 2] 寄り）
    s_new = s_new + w_red * (np.minimum(1.0, s_new * 1.28 + 0.10) - s_new)
    v_new = v + w_red * (np.minimum(0.95, v * 1.22 + 0.04) - v)
    # 赤のわずかなピンク・茶寄りを純赤〜朱赤（H≈4°）へごく軽く寄せる
    h_err_red = ((h - 4.0 + 180.0) % 360.0) - 180.0
    h_new = (h - 0.25 * w_red * h_err_red) % 360.0

    # (c) 緑（ライムグリーン斜線）：くすんだ抹茶 -> 明るく爽やかなライムグリーン（RGB [173, 203, 85] 寄り）
    s_new = s_new + w_green * (np.minimum(0.72, s_new * 1.38 + 0.04) - s_new)
    v_new = v_new + w_green * (np.minimum(0.86, v_new * 1.07 + 0.02) - v_new)

    # (d) 黄（蛍光マーカー & ゴールデンイエロー）：くすみを取って明るく発色
    # マーカー（v > 0.85）は白飛びさせず彩度だけ上げ、濃い黄線（v <= 0.85）は彩度・明度とも鮮やかに
    w_yellow_line = w_yellow * (1.0 - smoothstep(0.80, 0.92, v))
    w_yellow_hl = w_yellow * smoothstep(0.80, 0.92, v)
    s_new = s_new + w_yellow_hl * (np.minimum(0.66, s_new * 1.20) - s_new)
    s_new = s_new + w_yellow_line * (np.minimum(0.96, s_new * 1.30 + 0.05) - s_new)
    v_new = v_new + w_yellow_line * (np.minimum(0.92, v_new * 1.08 + 0.02) - v_new)

    # (e) 青（コバルトブルーの矢印・枠）：暗すぎない爽やかな青へ（暗いネイビー文字 v < 0.35 は除外）
    w_blue_mid = w_blue * smoothstep(0.32, 0.50, v)
    s_new = s_new + w_blue_mid * (np.minimum(0.82, s_new * 1.15) - s_new)
    v_new = v_new + w_blue_mid * (np.minimum(0.88, v_new * 1.07) - v_new)

    # (f) 濃いネイビー主線・文字のコントラスト引き締め（ボヤけた暗灰色を深いネイビーインクに）
    dark_ink = (1.0 - smoothstep(0.28, 0.55, lum)) * (1.0 - w_red)
    v_new = v_new * (1.0 - 0.14 * dark_ink)

    graded = hsv_to_rgb(h_new, np.clip(s_new, 0.0, 1.0), np.clip(v_new, 0.0, 1.0))

    # 3. 強度ブレンド
    if strength < 1.0:
        graded = orig * (1.0 - strength) + graded * strength

    # 4. 最終背景クリップ（丸め誤差で 254 に残る純白背景を確実に 255 へ）
    out_u8 = np.clip(np.round(graded * 255.0), 0, 255).astype(np.uint8)
    pure_bg = (out_u8[..., 0] >= 252) & (out_u8[..., 1] >= 252) & (out_u8[..., 2] >= 252)
    out_u8[pure_bg] = 255
    return out_u8


def stats_summary(rgb_u8: np.ndarray) -> str:
    a = rgb_u8.astype(np.float32)
    pure_w = ((a[..., 0] == 255) & (a[..., 1] == 255) & (a[..., 2] == 255)).mean()
    lum = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
    ink = a[lum < 230]
    if len(ink) == 0:
        return f"pure_white={pure_w:.3f}"
    mx = ink.max(axis=1)
    mn = ink.min(axis=1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0.0)
    cs = sat[sat > 0.25]
    p75 = float(np.percentile(cs, 75)) if len(cs) else 0.0
    p90 = float(np.percentile(cs, 90)) if len(cs) else 0.0
    return f"pure_white={pure_w:.3f} sat_p75={p75:.3f} sat_p90={p90:.3f}"


def process_file(src: Path, dst: Path, strength: float, sharpen: bool) -> None:
    im = Image.open(src).convert("RGB")
    before = np.asarray(im)
    after = grade_array(before, strength=strength)
    out_im = Image.fromarray(after, mode="RGB")
    if sharpen and strength > 0.0:
        # デジタルペンのエッジを軽く整える（過補正にならない弱めのアンシャープ）
        out_im = out_im.filter(ImageFilter.UnsharpMask(radius=0.8, percent=30, threshold=4))
        arr = np.asarray(out_im).copy()
        pure_bg = (arr[..., 0] >= 252) & (arr[..., 1] >= 252) & (arr[..., 2] >= 252)
        arr[pure_bg] = 255
        out_im = Image.fromarray(arr, mode="RGB")
        after = arr

    dst.parent.mkdir(parents=True, exist_ok=True)
    out_im.save(dst, format="PNG", optimize=True)
    kb = dst.stat().st_size / 1024.0
    print(f"[OK] {src.name} -> {dst.name} ({kb:.1f} KB)")
    print(f"     before: {stats_summary(before)}")
    print(f"     after : {stats_summary(after)}")


def main() -> None:
    ap = argparse.ArgumentParser(description="手描き図解を math_4.png の純白・高彩度トーンへ後処理する")
    ap.add_argument("inputs", nargs="+", type=Path, help="入力画像（PNG / JPG）")
    ap.add_argument("--out-dir", type=Path, default=None, help="出力ディレクトリ（省略時は入力と同じ場所に .png で保存）")
    ap.add_argument("--strength", type=float, default=1.0, help="補正強度 0.0〜1.0（既定: 1.0）")
    ap.add_argument("--no-sharpen", action="store_true", help="仕上げの弱アンシャープを無効化")
    args = ap.parse_args()

    for src in args.inputs:
        if not src.exists():
            raise SystemExit(f"ファイルが見つかりません: {src}")
        dst = (args.out_dir / f"{src.stem}.png") if args.out_dir else src.with_suffix(".png")
        process_file(src, dst, strength=args.strength, sharpen=not args.no_sharpen)


if __name__ == "__main__":
    main()
