const { Client, LogLevel } = require("@notionhq/client")
const { NotionToMarkdown } = require("notion-to-md");
const fs = require('fs');
const https = require('https');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');

const NOTION_TOKEN = fs.readFileSync(".notion_token", "utf-8");
let SLUG = "tar"
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


// 画像をダウンロードして連番で保存する
// 画像のサイズを取得して、サイズを変更する
n2m.setCustomTransformer("image", async (block) => {
    const { parent } = block;
    if (!parent) return "";

    console.log("image", SLUG, counter);

    // console.log(block);

    let caption = "";
    block.image.caption.forEach((element) => {
        caption += element.plain_text + "";
    });

    const url = block.image.file.url;
    //urlからpngかjpgかgifかを取得する
    const ext = url.match(/\.([0-9a-z]+)(?:[\?#]|$)/i)[1];
    const filename = `images/books/tar/${SLUG}_${counter}.${ext}`;
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
    console.log(metadata.width)
    return metadata.width;


}

n2m.setCustomTransformer("bookmark", async (block) => {
    const { parent } = block;
    if (!parent) return "";
    //typeの型チェック
    // console.log("bookmark", parent);
    if (typeof parent != "string") return "";
    const url = parent.match(/\(([^)]+)\)/)[1];
    return `${url}\n`;
});




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

const fetch_and_convert_notion = async (data) => {

    counter = 1;
    SLUG = data.slug;
    console.log(SLUG)

    const response = await notion.pages.retrieve({
        page_id: data.pageId
    })
    // console.log(response)

    const mdblocks = await n2m.pageToMarkdown(data.pageId);
    // console.log(mdblocks);
    const mdString = n2m.toMarkdownString(mdblocks);

    // joint path
    const filePath = BASE_PATH + data.file;
    if (!fs.existsSync(BASE_PATH)) {
        fs.mkdirSync(BASE_PATH, { recursive: true });
    }

    const md = FormatZennPage({
        title: response.properties.title.title[0].plain_text,
        emoji: response.icon.emoji,
        markdown: mdString.parent
    });

    fs.writeFileSync(filePath, md, { encoding: "utf-8" });
    console.log("write to file: " + filePath);

  }

  ;(async()=>{
    const data = [
        {
            slug: "math",
            pageId: "b06a904c37174d62806d5a571b1347ea",
            file: "02_math.md"
        },
        // {
        //     slug: "computer_scicence",
        //     pageId: "33c1985b367242f783cfe0ff20b079dc",
        //     file: "05_computer_science.md"
        // },
        // {
        //     slug: "computer_graphics",
        //     pageId: "a8ff5118073d4a47927979597385558f",
        //     file: "06_computer_graphics.md"
        // },
    ];

    //逐次処理
    for (const d of data) {
        await fetch_and_convert_notion(d);
    }

  })();