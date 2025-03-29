const { Client, LogLevel } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');

// export type BlockType =
  //   | "image"
  //   | "video"
  //   | "file"
  //   | "pdf"
  //   | "table"
  //   | "bookmark"
  //   | "embed"
  //   | "equation"
  //   | "divider"
  //   | "toggle"
  //   | "to_do"
  //   | "bulleted_list_item"
  //   | "numbered_list_item"
  //   | "synced_block"
  //   | "column_list"
  //   | "column"
  //   | "link_preview"
  //   | "link_to_page"
  //   | "paragraph"
  //   | "heading_1"
  //   | "heading_2"
  //   | "heading_3"
  //   | "bulleted_list_item"
  //   | "numbered_list_item"
  //   | "quote"
  //   | "to_do"
  //   | "template"
  //   | "synced_block"
  //   | "child_page"
  //   | "child_database"
  //   | "code"
  //   | "callout"
  //   | "breadcrumb"
  //   | "table_of_contents"
  //   | "link_to_page"
  //   | "audio"
  //   | "unsupported"
  //   | (string & {});

class NotionZennConverter {
  constructor(notionToken, options = {}) {
    // Notionクライアントの初期化
    this.notion = new Client({
      auth: notionToken,
      logLevel: options.logLevel || LogLevel.ERROR,
    });

    // Notion to Markdown コンバーターの設定
    this.n2m = new NotionToMarkdown({
      notionClient: this.notion,
      config: {
        parseChildPages: options.parseChildPages || false,
      }
    });

    // デフォルトの画像保存パス
    this.imageSavePath = options.imageSavePath || 'images/';
    this.isDownloadImages = options.saveImages || true;
    this.counter = 1;
    this.slug = options.slug || None;

    // カスタムトランスフォーマーの初期設定
    this.setupCustomTransformers();
  }

  setupCustomTransformers() {
    // 画像トランスフォーマー
    this.n2m.setCustomTransformer("image", async (block) => {
      const { parent } = block;
      if (!parent) return "";

      let caption = block.image.caption.map(element => element.plain_text).join('');
      caption = caption ? `*${caption}*` : '';

      const url = block.image.file.url;
      const ext = url.match(/\.([0-9a-z]+)(?:[\?#]|$)/i)[1];
      const filename = `${this.imageSavePath}${this.slug}_${this.counter}.${ext}`;
      const width = await this.downloadImage(url, path.join(process.cwd(), filename));

      this.counter++;

      if (width >= 1000) {
        return `![image.${ext}](/${filename})\n${caption}\n`;
      } else {
        return `![image.${ext}](/${filename} =${width}x)\n${caption}\n`;
      }
    });

    // その他の共通トランスフォーマー
    this.n2m.setCustomTransformer("divider", async () => "-----\n");

    this.n2m.setCustomTransformer("video", async (block) => {
      if (block.video.type === "external") {
        return block.video.external.url + "\n";
      }
      return `[video](${block.video.file.url})\n`;
    });

    this.n2m.setCustomTransformer("bookmark", async (block) => {
      const { parent } = block;
      if (!parent || typeof parent !== "string") return "";
      const url = parent.match(/\(([^)]+)\)/)[1];
      return `${url}\n`;
    });

    // codeトランスフォーマー
    // C#をcsharpに変換
    this.n2m.setCustomTransformer("code", async (block) => {
      const { code } = block;
      const language = code.language.replace("c#", 'csharp');

      // Special handling for diff blocks
      if (language === "diff") {
        const captionLang = code.caption.length > 0 
          ? code.caption[0].plain_text.replace("c#", 'csharp')
          : '';
        return `\`\`\`diff ${captionLang}\n${code.rich_text[0].plain_text}\n\`\`\``;
      }
      
      // Standard code blocks 
      const caption = code.caption.length > 0 ? `:${code.caption[0].plain_text}` : '';
      return `\`\`\`${language}${caption}\n${code.rich_text[0].plain_text}\n\`\`\``;
    });

    //toggle
    this.n2m.setCustomTransformer("toggle", async (block) => {
      const { toggle } = block;
      // const caption = toggle.rich_text.map(element => element.plain_text).join('');
      // const children = await this.n2m.block.children.list(block.id);
      // const childMarkdown = await this.n2m.toMarkdownString(children);
      return `\n:::details ${toggle.rich_text[0].plain_text}\n`;
    });

    // bookmark
    this.n2m.setCustomTransformer("bookmark", async (block) => {
      const { parent, bookmark } = block;
      if (!parent) return "";
      if (typeof bookmark.url === "string") {
        const url = bookmark.url;
        return `${url}\n`;
      }
    });

    //callout
    this.n2m.setCustomTransformer("callout", async (block) => {
      const { callout } = block;
      const caption = callout.rich_text.map(element => element.text.content).join('\n');
      return `\n:::message\n ${caption}\n:::\n`;
    });



  }

  async downloadImage(url, filename) {
    if (this.isDownloadImages === false) {
      const image = fs.readFileSync(filename);
      const metadata = await sharp(image).metadata();
      console.log(`Image already exists: ${filename}`);
      return metadata.width;
    }
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer'
    });

    const image = sharp(response.data);
    const metadata = await image.metadata();
    
    if (metadata.width > 1000) {
      const resizedImage = await image.resize(1000).toBuffer();
      fs.writeFileSync(filename, resizedImage);
    } else {
      const resizedImage = await image.toBuffer();
      fs.writeFileSync(filename, resizedImage);
    }

    console.log(`Image downloaded as ${filename}`);
    return metadata.width;
  }

  getTopics(topics) {
    if (!topics || topics.length === 0) {
      return [];
    }
    return topics.map(topic => {
      return topic.name.replace("C#", 'csharp')
    });
  }

  formatZenn(mdString, options) {
    const { title, type, topics, emoji } = options;
    const formattedString = `---
title: ${title}
type: ${type || 'tech'}
topics: ${JSON.stringify(topics)}
emoji: ${emoji || '📝'}
published: true
---
    ${mdString}
    `;
    return formattedString;
  }

  async fetch(pageId) {
    const response = await this.notion.pages.retrieve({ page_id: pageId });
    return response;
  }

  async convert(pageId, options = {}) {
    // リセット
    this.counter = 1;
    this.slug = this.slug || pageId;

    // Markdownへの変換
    const mdblocks = await this.n2m.pageToMarkdown(pageId);
    const mdString = this.n2m.toMarkdownString(mdblocks);
    
    const zennFormattedString = this.formatZenn(mdString.parent, options);
    return zennFormattedString;
  }
}

module.exports = NotionZennConverter;