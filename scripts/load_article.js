const { Client, LogLevel } = require("@notionhq/client")
const { NotionToMarkdown } = require("notion-to-md");
const fs = require('fs');
const https = require('https');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');
const { parseArgs } = require('node:util')

const NOTION_TOKEN = fs.readFileSync(".notion_token", "utf-8");
let SLUG = "yohawing"
let counter = 1;

// Initializing a client
const notion = new Client({
  auth: NOTION_TOKEN,
  logLevel: LogLevel.ERROR,
})

// passing notion client to the option
const n2m = new NotionToMarkdown({
    notionClient: notion,
    config:{
        parseChildPages:false, // default: parseChildPages
    }
});

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

// 画像をダウンロードして連番で保存する
// 画像のサイズを取得して、サイズを変更する

n2m.setCustomTransformer("image", async (block) => {
    const { parent } = block;
    if (!parent) return "";

    // console.log("image", SLUG, counter);

    // console.log(block);

    let caption = "";
    block.image.caption.forEach((element) => {
        caption += element.plain_text + "";
    });

    const url = block.image.file.url;
    //urlからpngかjpgかgifかを取得する
    const ext = url.match(/\.([0-9a-z]+)(?:[\?#]|$)/i)[1];
    const filename = `images/articles/${SLUG}_${counter}.${ext}`;
    const width = await downloadImage(url, path.join(process.cwd(), filename));

    counter++;

    if( width >= 1000){
        return `![image.${ext}](/${filename})\n${caption}\n`;
    }else{
        return `![image.${ext}](/${filename} =${width}x)\n${caption}\n`;
    }
});

async　function downloadImage(url, filename) {
    const file = fs.createWriteStream(filename);

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer'
    });

    // ダウンロードしたデータをsharpに渡してリサイズ
    //画像のサイズを取得して、Width1000px以上の場合は1000pxにリサイズする
    //それ以下は横幅を変数に保持

    const image = sharp(response.data);
    const metadata = await image.metadata();
    if (metadata.width > 1000) {
        const resizedImage = await image.resize(1000).toBuffer();
        fs.writeFileSync(filename, resizedImage);
        console.log(`Image downloaded as ${filename}`);
    } else {
        const resizedImage = await image.toBuffer();
        fs.writeFileSync(filename, resizedImage);
        console.log(`Image downloaded as ${filename}`);
    }
    // console.log(metadata.width)
    return metadata.width;


}

n2m.setCustomTransformer("bookmark", async (block) => {
    const { parent, bookmark } = block;
    console.log("bookmark", block);
    if (!parent) return "";
    //typeの型チェック
    // console.log("bookmark", parent);
    if (typeof bookmark.url == "string") {
        const url = bookmark.url;
        return `${url}\n`;
    };
});

// n2m.setCustomTransformer("link_preview", async (block) => {
//     console.log("link_preview", block);
//     return `${block.link}\n`;
// });


n2m.setCustomTransformer("divider", async (block) => {
    console.log("divider", block);
    return "---\n";
});

n2m.setCustomTransformer("video", async (block) => {
    console.log("video", block);
    // youtubeリンクの場合URLを取得
    if (block.video.type === "external") {
        return block.video.external.url+"\n";
    }
    return `[video](${block.video.file.url})\n`;
});


const BASE_PATH = "articles/"

const FormatZennPage = (obj) => {
    const ZennFormat = `---
title: "${obj.title}"
type: "tech"
topics: [${obj.topics || ''}]
emoji: "${obj.emoji || ''}"
published: true
---
    ${obj.markdown}
    `
    return ZennFormat;
}

const fetch_and_convert_notion = async (data) => {

    counter = 1;
    SLUG = data.pageId
    console.log("fetching ", data.pageId)

    const response = await notion.pages.retrieve({
        page_id: data.pageId
    })
    console.log(response.properties.title.title[0].plain_text)

    const mdblocks = await n2m.pageToMarkdown(data.pageId);
    console.log(mdblocks);
    const mdString = n2m.toMarkdownString(mdblocks);

    // joint path
    const filePath = BASE_PATH + data.pageId + ".md";
    if (!fs.existsSync(BASE_PATH)) {
        fs.mkdirSync(BASE_PATH, { recursive: true });
    }

    const md = FormatZennPage({
        title: response.properties.title.title[0].plain_text,
        topics: '"'+data.topics.replace(",",'","') + '"',
        emoji: response.icon.emoji,
        markdown: mdString.parent
    });

    fs.writeFileSync(filePath, md, { encoding: "utf-8" });
    console.log("write to file: " + filePath);

  }

  ;(async()=>{

    // 引数 slug id index から生成
    const { values, positions } = parseArgs({
        args: process.args,
        allowPositionals: true, // コマンド引数を取得できるようにする設定
        options: {
            id: {
                type: 'string'
            },
            topics: {
                type: 'string'
            }
        }
    });
      
    console.log(values);

    if (!values.id) {
        console.log("id is required");
        process.exit(1);
    }

    var data = {
        pageId: values.id,
        topics: values.topics,
    }
    await fetch_and_convert_notion(data);

  })();