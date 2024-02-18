const { Client, LogLevel } = require("@notionhq/client")
const { NotionToMarkdown } = require("notion-to-md");
const fs = require('fs');

let NOTION_TOKEN = fs.readFileSync(".notion_token", "utf-8");

// Initializing a client
const notion = new Client({
  auth: NOTION_TOKEN,
  logLevel: LogLevel.DEBUG,
})

// passing notion client to the option
const n2m = new NotionToMarkdown({
    notionClient: notion,
    config:{
        parseChildPages:false, // default: parseChildPages
    }
});

n2m.setCustomTransformer("bookmark", async (block) => {
    const { parent } = block;
    if (!parent) return "";
    //typeの型チェック
    console.log("bookmark", parent);
    if (typeof parent != "string") return "";
    const url = parent.match(/\(([^)]+)\)/)[1];
    return `${url}\n`;
});

// 画像をダウンロードして連番で保存する
// 画像のサイズを取得して、サイズを変更する
// n2m.setCustomTransformer("image", async (block) => {
//     const { parent } = block;
//     if (!parent) return "";
//     // extract url
//     const url = parent.match(/\(([^)]+)\)/)[1];
//     
//     return parent;
// });


const BASE_PATH = "books/technical-artist-roadmap/"

const FormatZennPage = (obj) => {
    const ZennFormat = `---
title: "${obj.title}"
emoji: "${obj.emoji}"
published: true
---
    ${obj.markdown}
    `
    return ZennFormat;
}

;(async () => {

    // fetch a notion page
    //https://www.notion.so/yohawing/Technical-Artist-Roadmap-f6bcfff7533640adbbc2bac09300fe30?pvs=4
    //https://www.notion.so/yohawing/33c1985b367242f783cfe0ff20b079dc?pvs=4
    let pageId = "f6bcfff7533640adbbc2bac09300fe30"
    pageId = "33c1985b367242f783cfe0ff20b079dc"
    const response = await notion.pages.retrieve({
        page_id: pageId
    })
    console.log(response)

    const mdblocks = await n2m.pageToMarkdown(pageId);
    console.log(mdblocks);
    const mdString = n2m.toMarkdownString(mdblocks);
 
    //overwrite to file
    // joint path
    const filePath = BASE_PATH + "05_computer_science.md";
    if (!fs.existsSync(BASE_PATH)) {
        fs.mkdirSync(BASE_PATH, { recursive: true });
    }
    console.log("write to file: " + filePath);
    const md = FormatZennPage({
        title: response.properties.title.title[0].plain_text,
        emoji: response.icon.emoji,
        markdown: mdString.parent
    });

    fs.writeFileSync(filePath, md, { encoding: "utf-8" });


  })()