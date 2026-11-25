#!/usr/bin/env node
/**
 * Zenn記事の品質を決定論的に検証するリンター
 *
 * 使い方:
 *   node scripts/lint-article.mjs articles/voice-agent-exhibitions-2026.md
 */
import fs from "node:fs";
import path from "node:path";

const RULES = {
  maxParagraphChars: 144,
  maxSectionChars: 500,
  maxHeadingChars: 20,
  maxHtmlEmbedTextChars: 100,
  maxCharsWithoutVisual: 1100,
  minCharsBetweenVisuals: 60,
  maxAvgCharsPerVisual: 1200,
  minAvgCharsPerVisual: 180,
  maxImageBytes: 3 * 1024 * 1024, // Zenn limit: 3MB
};

const NUMBERED_HEADING_RE =
  /^(?:[0-9０-９]+[\.．、\)\）\s：:]|[①-⑳]|第[0-9０-９一二三四五六七八九十]+[章節項])/;

const PUNCT_RE = /[\p{P}\p{S}]/u;
const SPACE_RE = /\s/u;

function isSpace(ch) {
  return !ch || SPACE_RE.test(ch);
}

function isPunct(ch) {
  return Boolean(ch) && PUNCT_RE.test(ch);
}

/**
 * 表示上の文字数を計算する（MarkdownリンクURLやインライン装飾記号を除外）
 */
function visibleTextLength(text) {
  let s = text;
  // インラインコードの中身は文字数に含め、バッククォートは除く
  s = s.replace(/`([^`]+)`/g, "$1");
  // リンク [label](url) -> label
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  // 太字・斜体記号を除く
  s = s.replace(/\*\*|__/g, "");
  // 前後空白を除く
  s = s.trim();
  return Array.from(s).length;
}

/**
 * CommonMark の flanking delimiter 規則に基づいて、
 * Zenn (markdown-it) で太字 (**) が効かずに生表示される箇所を検出する
 */
function checkBoldSyntax(line, lineNo, issues) {
  // インラインコード内をマスクして誤検知を防ぐ
  const masked = line.replace(/`[^`]*`/g, (m) => "x".repeat(m.length));

  const positions = [];
  for (let i = 0; i < masked.length - 1; i++) {
    if (masked[i] === "*" && masked[i + 1] === "*") {
      // *** (3連以上) は一旦スキップせず2文字ずつ進める
      const before = i > 0 ? masked[i - 1] : "";
      const after = i + 2 < masked.length ? masked[i + 2] : "";
      const leftFlanking =
        !isSpace(after) && (!isPunct(after) || isSpace(before) || isPunct(before));
      const rightFlanking =
        !isSpace(before) && (!isPunct(before) || isSpace(after) || isPunct(after));
      positions.push({ index: i, before, after, leftFlanking, rightFlanking });
      i += 1;
    }
  }

  if (positions.length === 0) return;

  if (positions.length % 2 !== 0) {
    issues.push({
      level: "error",
      rule: "markdown-bold-unclosed",
      line: lineNo,
      message: `太字の ** が奇数個（${positions.length}個）で閉じていません: ${line.trim().slice(0, 60)}`,
    });
    return;
  }

  for (let k = 0; k < positions.length; k += 2) {
    const open = positions[k];
    const close = positions[k + 1];
    const snippet = line.slice(Math.max(0, open.index - 4), Math.min(line.length, close.index + 6));

    if (!open.leftFlanking) {
      issues.push({
        level: "error",
        rule: "markdown-bold-broken-open",
        line: lineNo,
        message: `開き ** がCommonMark規則で太字になりません（直前「${open.before || "行頭"}」・直後「${open.after || "行末"}」）。括弧を ** の外に出すか半角スペースを入れてください: ${snippet}`,
      });
    }
    if (!close.rightFlanking) {
      issues.push({
        level: "error",
        rule: "markdown-bold-broken-close",
        line: lineNo,
        message: `閉じ ** がCommonMark規則で太字になりません（直前「${close.before || "行頭"}」・直後「${close.after || "行末"}」）。括弧を ** の外に出すか半角スペースを入れてください: ${snippet}`,
      });
    }
  }
}

function lintArticle(filePath) {
  const absPath = path.resolve(filePath);
  const repoRoot = process.cwd();
  const raw = fs.readFileSync(absPath, "utf8");
  const lines = raw.split(/\r?\n/);

  const issues = [];
  const stats = {
    totalVisibleChars: 0,
    visualCount: 0,
    sections: [],
    maxParagraphChars: 0,
    maxGapBetweenVisuals: 0,
  };

  // Frontmatter チェック
  let i = 0;
  if (lines[0]?.trim() !== "---") {
    issues.push({ level: "error", rule: "frontmatter", line: 1, message: "Frontmatter (---) が先頭にありません" });
  } else {
    i = 1;
    const fmLines = [];
    while (i < lines.length && lines[i].trim() !== "---") {
      fmLines.push(lines[i]);
      i++;
    }
    if (i >= lines.length) {
      issues.push({ level: "error", rule: "frontmatter", line: 1, message: "Frontmatter が閉じていません" });
    } else {
      const fmText = fmLines.join("\n");
      for (const key of ["title:", "type:", "topics:", "emoji:", "published:"]) {
        if (!fmText.includes(key)) {
          issues.push({ level: "error", rule: "frontmatter", line: 1, message: `Frontmatter に ${key} がありません` });
        }
      }
      i++; // skip closing ---
    }
  }

  let inCodeFence = false;
  let codeFenceLine = 0;
  let codeFenceType = "";
  let htmlEmbedBuf = [];
  const containerStack = []; // { type: 'details' | 'message', line }

  let currentSection = { heading: "(導入)", line: i + 1, chars: 0, hasVisual: false, isReference: false };
  let paragraphBuf = [];
  let paragraphStartLine = 0;
  let charsSinceLastVisual = 0;
  let seenAnyVisual = false;
  let lastLineWasImage = false;
  let prevNonEmptyWasImage = false;

  const isInsideDetails = () => containerStack.some((c) => c.type === "details");

  const flushParagraph = () => {
    if (paragraphBuf.length === 0) return;
    const joined = paragraphBuf.join("");
    const len = visibleTextLength(joined);
    if (!isInsideDetails() && !currentSection.isReference) {
      stats.totalVisibleChars += len;
      currentSection.chars += len;
      charsSinceLastVisual += len;
      if (len > stats.maxParagraphChars) stats.maxParagraphChars = len;
      if (len > RULES.maxParagraphChars) {
        issues.push({
          level: "error",
          rule: "paragraph-length",
          line: paragraphStartLine,
          message: `1パラグラフが${len}文字です（上限${RULES.maxParagraphChars}文字）: 「${joined.trim().slice(0, 35)}…」`,
        });
      }
    }
    paragraphBuf = [];
    paragraphStartLine = 0;
  };

  const flushSection = () => {
    flushParagraph();
    if (currentSection.chars > 0 || currentSection.heading !== "(導入)") {
      stats.sections.push({ ...currentSection });
      if (!currentSection.isReference && currentSection.chars > RULES.maxSectionChars) {
        issues.push({
          level: "error",
          rule: "section-length",
          line: currentSection.line,
          message: `章「${currentSection.heading}」の本文が${currentSection.chars}文字です（上限${RULES.maxSectionChars}文字）。分割するか詳細を :::details へ折りたたんでください`,
        });
      }
    }
  };

  const recordVisual = (lineNo, label) => {
    if (isInsideDetails()) return;
    stats.visualCount++;
    currentSection.hasVisual = true;
    if (charsSinceLastVisual > stats.maxGapBetweenVisuals) {
      stats.maxGapBetweenVisuals = charsSinceLastVisual;
    }
    if (charsSinceLastVisual > RULES.maxCharsWithoutVisual) {
      issues.push({
        level: "error",
        rule: "visual-gap-too-long",
        line: lineNo,
        message: `前の画像/図から「${label}」まで本文が${charsSinceLastVisual}文字連続しています（上限${RULES.maxCharsWithoutVisual}文字）`,
      });
    }
    if (seenAnyVisual && charsSinceLastVisual < RULES.minCharsBetweenVisuals) {
      issues.push({
        level: "warn",
        rule: "visual-gap-too-short",
        line: lineNo,
        message: `画像/図が連続気味です（前の画像/図から${charsSinceLastVisual}文字。推奨${RULES.minCharsBetweenVisuals}文字以上）`,
      });
    }
    seenAnyVisual = true;
    charsSinceLastVisual = 0;
  };

  for (; i < lines.length; i++) {
    const lineNo = i + 1;
    const line = lines[i];
    const trimmed = line.trim();

    // コードフェンスの開閉
    if (/^```/.test(trimmed)) {
      flushParagraph();
      lastLineWasImage = false;
      prevNonEmptyWasImage = false;
      if (!inCodeFence) {
        inCodeFence = true;
        codeFenceLine = lineNo;
        if (/^```mermaid\b/.test(trimmed)) {
          codeFenceType = "mermaid";
        } else if (/^```html-embed\b/.test(trimmed)) {
          codeFenceType = "html-embed";
          htmlEmbedBuf = [];
        } else {
          codeFenceType = "code";
        }
      } else {
        inCodeFence = false;
        if (codeFenceType === "mermaid") {
          recordVisual(codeFenceLine, "Mermaid図");
        } else if (codeFenceType === "html-embed") {
          const embedHtml = htmlEmbedBuf.join("\n");
          const bytes = Buffer.byteLength(embedHtml, "utf8");
          if (bytes > 50 * 1024) {
            issues.push({
              level: "error",
              rule: "html-embed-size",
              line: codeFenceLine,
              message: `html-embed が50KB上限を超えています (${(bytes / 1024).toFixed(1)}KB)`,
            });
          }
          if (/<script\b|\bon[a-z]+\s*=/i.test(embedHtml)) {
            issues.push({
              level: "error",
              rule: "html-embed-js",
              line: codeFenceLine,
              message: "html-embed 内では JavaScript (<script> や on* 属性) は使用できません",
            });
          }
          if (/<(html|head|body|iframe|form|button|textarea|select)\b/i.test(embedHtml)) {
            issues.push({
              level: "error",
              rule: "html-embed-forbidden-tag",
              line: codeFenceLine,
              message: "html-embed 内で禁止されているHTMLタグが含まれています (html/head/body/iframe/form/button/textarea/select)",
            });
          }
          if (!/data-theme\s*=\s*["']dark["']|light-dark\(/i.test(embedHtml)) {
            issues.push({
              level: "warn",
              rule: "html-embed-dark-mode",
              line: codeFenceLine,
              message: "html-embed にダークモード対応 ([data-theme=\"dark\"] または light-dark()) が見つかりません",
            });
          }
          const visibleEmbedText = embedHtml
            .replace(/<style\b[\s\S]*?<\/style>/gi, "")
            .replace(/<!--[\s\S]*?-->/g, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, "")
            .trim();
          const embedTextLen = Array.from(visibleEmbedText).length;
          if (embedTextLen > RULES.maxHtmlEmbedTextChars) {
            issues.push({
              level: "error",
              rule: "html-embed-too-much-text",
              line: codeFenceLine,
              message: `html-embed 内の表示文字数が${embedTextLen}文字あります（上限${RULES.maxHtmlEmbedTextChars}文字）。図は思考の休憩所として文字を減らし、形やアイコンで直感的に伝えてください`,
            });
          }
          recordVisual(codeFenceLine, "html-embed図");
        }
        codeFenceType = "";
        htmlEmbedBuf = [];
      }
      continue;
    }
    if (inCodeFence) {
      if (codeFenceType === "html-embed") htmlEmbedBuf.push(line);
      continue;
    }

    // Zenn コンテナ (:::details / :::message / :::)
    if (/^:::(details|message)\b/.test(trimmed)) {
      flushParagraph();
      lastLineWasImage = false;
      prevNonEmptyWasImage = false;
      const type = trimmed.startsWith(":::details") ? "details" : "message";
      containerStack.push({ type, line: lineNo });
      continue;
    }
    if (trimmed === ":::") {
      flushParagraph();
      lastLineWasImage = false;
      prevNonEmptyWasImage = false;
      if (containerStack.length === 0) {
        issues.push({ level: "error", rule: "container-unmatched", line: lineNo, message: "対応する開始のない ::: があります" });
      } else {
        containerStack.pop();
      }
      continue;
    }

    // 空行
    if (trimmed === "") {
      flushParagraph();
      lastLineWasImage = false;
      continue;
    }

    // 水平線
    if (/^---+$/.test(trimmed)) {
      flushParagraph();
      lastLineWasImage = false;
      prevNonEmptyWasImage = false;
      continue;
    }

    // 見出し (#, ##, ###)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushSection();
      lastLineWasImage = false;
      prevNonEmptyWasImage = false;
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();
      const titleLen = visibleTextLength(title);
      if (level === 1) {
        issues.push({ level: "warn", rule: "heading-level", line: lineNo, message: `記事本文では # ではなく ## / ### を使ってください: ${title}` });
      }
      if (titleLen > RULES.maxHeadingChars) {
        issues.push({
          level: "error",
          rule: "heading-length",
          line: lineNo,
          message: `見出しが${titleLen}文字です（上限${RULES.maxHeadingChars}文字）: 「${title}」`,
        });
      }
      if (NUMBERED_HEADING_RE.test(title)) {
        issues.push({
          level: "error",
          rule: "heading-numbered",
          line: lineNo,
          message: `見出しに先頭の連番・数字を使わないでください: 「${title}」`,
        });
      }
      checkBoldSyntax(line, lineNo, issues);
      currentSection = {
        heading: title,
        line: lineNo,
        chars: 0,
        hasVisual: false,
        isReference: /^参考/.test(title),
      };
      continue;
    }

    // 画像行 ![alt](src)
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]*)\)$/);
    if (imgMatch) {
      flushParagraph();
      const alt = imgMatch[1];
      const src = imgMatch[2].trim();
      if (!src || src === "TODO") {
        issues.push({ level: "error", rule: "image-missing", line: lineNo, message: `画像パスが未設定です: ![${alt}](${src})` });
      } else if (src.startsWith("/images/")) {
        const diskPath = path.join(repoRoot, src.slice(1));
        if (!fs.existsSync(diskPath)) {
          issues.push({ level: "error", rule: "image-not-found", line: lineNo, message: `画像ファイルが存在しません: ${src}` });
        } else {
          const size = fs.statSync(diskPath).size;
          if (size > RULES.maxImageBytes) {
            issues.push({
              level: "error",
              rule: "image-too-large",
              line: lineNo,
              message: `画像サイズがZenn上限(3MB)を超えています (${(size / 1024 / 1024).toFixed(2)}MB): ${src}`,
            });
          }
        }
      }
      recordVisual(lineNo, alt || src);
      lastLineWasImage = true;
      prevNonEmptyWasImage = true;
      continue;
    }

    // 画像直下のキャプションテキストを禁止（空行なしテキスト、または直後の単独斜体行 *...* / _..._）
    const isStandaloneItalic =
      /^\*[^*].*[^*]\*$/.test(trimmed) || /^_[^_].*[^_]_$/.test(trimmed);
    if (lastLineWasImage || (prevNonEmptyWasImage && isStandaloneItalic)) {
      flushParagraph();
      issues.push({
        level: "error",
        rule: "image-caption-disallowed",
        line: lineNo,
        message: `画像の下にキャプションテキストは付けないでください: 「${trimmed.slice(0, 40)}」`,
      });
      lastLineWasImage = false;
      prevNonEmptyWasImage = false;
      continue;
    }
    lastLineWasImage = false;
    prevNonEmptyWasImage = false;

    // Markdown 太字構文チェック（折りたたみ内外問わず全本文で検査）
    checkBoldSyntax(line, lineNo, issues);

    // 箇条書き (- item / 1. item)
    const listMatch = trimmed.match(/^([-*]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      flushParagraph();
      const marker = listMatch[1];
      const body = listMatch[2];
      if (marker === "*") {
        issues.push({ level: "error", rule: "list-marker", line: lineNo, message: "箇条書きは * ではなく - を使用してください (YOHA_FORMAT)" });
      }
      if (/^\*\*[^*]+\*\*/.test(body)) {
        issues.push({ level: "error", rule: "list-bold-label", line: lineNo, message: "箇条書きの先頭に太字ラベルは付けないでください (YOHA_FORMAT)" });
      }
      if (!isInsideDetails() && !currentSection.isReference) {
        const len = visibleTextLength(body);
        stats.totalVisibleChars += len;
        currentSection.chars += len;
        charsSinceLastVisual += len;
        if (len > stats.maxParagraphChars) stats.maxParagraphChars = len;
        if (len > RULES.maxParagraphChars) {
          issues.push({
            level: "error",
            rule: "paragraph-length",
            line: lineNo,
            message: `箇条書き1項目が${len}文字です（上限${RULES.maxParagraphChars}文字）: 「${body.slice(0, 35)}…」`,
          });
        }
      }
      continue;
    }

    // 通常パラグラフ行
    if (paragraphBuf.length === 0) paragraphStartLine = lineNo;
    paragraphBuf.push(trimmed);
  }

  flushSection();

  if (inCodeFence) {
    issues.push({ level: "error", rule: "code-fence-unclosed", line: codeFenceLine, message: "コードブロック (```) が閉じていません" });
  }
  for (const c of containerStack) {
    issues.push({ level: "error", rule: "container-unclosed", line: c.line, message: `:::${c.type} が閉じていません` });
  }

  // 末尾から最後の画像までの距離チェック
  if (charsSinceLastVisual > stats.maxGapBetweenVisuals) {
    stats.maxGapBetweenVisuals = charsSinceLastVisual;
  }
  if (charsSinceLastVisual > RULES.maxCharsWithoutVisual) {
    issues.push({
      level: "error",
      rule: "visual-gap-too-long",
      line: lines.length,
      message: `最後の画像/図から記事末尾まで本文が${charsSinceLastVisual}文字連続しています（上限${RULES.maxCharsWithoutVisual}文字）`,
    });
  }

  // 全体の文章・画像バランスチェック
  if (stats.visualCount === 0) {
    issues.push({ level: "error", rule: "visual-balance", line: 1, message: "画像・図が1つもありません" });
  } else {
    const avg = Math.round(stats.totalVisibleChars / stats.visualCount);
    stats.avgCharsPerVisual = avg;
    if (avg > RULES.maxAvgCharsPerVisual) {
      issues.push({
        level: "error",
        rule: "visual-balance",
        line: 1,
        message: `画像が少なすぎます（画像/図1つあたり平均${avg}文字。上限${RULES.maxAvgCharsPerVisual}文字）`,
      });
    } else if (avg < RULES.minAvgCharsPerVisual) {
      issues.push({
        level: "warn",
        rule: "visual-balance",
        line: 1,
        message: `画像が多すぎます（画像/図1つあたり平均${avg}文字。推奨${RULES.minAvgCharsPerVisual}文字以上）`,
      });
    }
  }

  return { issues, stats };
}

// CLI エントリーポイント
const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error("Usage: node scripts/lint-article.mjs <article.md> [...]");
  process.exit(2);
}

let totalErrors = 0;
let totalWarns = 0;

for (const target of targets) {
  const { issues, stats } = lintArticle(target);
  const errors = issues.filter((x) => x.level === "error");
  const warns = issues.filter((x) => x.level === "warn");
  totalErrors += errors.length;
  totalWarns += warns.length;

  console.log(`\n=== ${target} ===`);
  console.log(
    `本文(折りたたみ除く): ${stats.totalVisibleChars}字 | 画像/図: ${stats.visualCount}個 | 平均間隔: ${stats.avgCharsPerVisual ?? "-"}字/図 | 最大パラグラフ: ${stats.maxParagraphChars}字 | 最大無画像区間: ${stats.maxGapBetweenVisuals}字`
  );
  console.log("\n[章ごとの文字数 (上限500字)]");
  for (const s of stats.sections) {
    const mark = s.isReference ? "REF" : s.chars <= RULES.maxSectionChars ? "OK " : "NG ";
    const vis = s.hasVisual ? " [図あり]" : "";
    console.log(`  ${mark} L${String(s.line).padStart(3)} ${String(s.chars).padStart(4)}字  ${s.heading}${vis}`);
  }

  if (issues.length === 0) {
    console.log("\nPASS: すべての品質チェックに合格しました！");
  } else {
    console.log(`\n[検出された問題: ERROR ${errors.length}件 / WARN ${warns.length}件]`);
    for (const iss of issues) {
      console.log(`  ${iss.level.toUpperCase().padEnd(5)} L${String(iss.line).padStart(3)} [${iss.rule}] ${iss.message}`);
    }
  }
}

process.exit(totalErrors > 0 ? 1 : 0);
