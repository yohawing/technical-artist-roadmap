const { Client, LogLevel } = require("@notionhq/client")
const { NotionToMarkdown } = require("notion-to-md");
const fs = require('fs');
const https = require('https');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');

let NOTION_TOKEN = fs.readFileSync(".notion_token", "utf-8");
let SLUG = "tar"

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

async　function downloadImage(url, filename) {
    const file = fs.createWriteStream(filename);

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer'
    });

    // ダウンロードしたデータをsharpに渡してリサイズ
    const resizedImage = await sharp(response.data)
        .resize(1000)
        .toBuffer();

    // リサイズした画像をファイルに書き込む
    fs.writeFileSync(filename, resizedImage);
    console.log(`Image downloaded as ${filename}`);

    // https.get(url, response => {
    //     response.pipe(file);

    //     file.on('finish', () => {
    //         file.close();
    //         console.log(`Image downloaded as ${filename}`);
    //     });
    // }).on('error', err => {
    //     fs.unlink(filename);
    //     console.error(`Error downloading image: ${err.message}`);
    // });
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


let counter = 1;

// 画像をダウンロードして連番で保存する
// 画像のサイズを取得して、サイズを変更する
n2m.setCustomTransformer("image", async (block) => {
    const { parent } = block;
    if (!parent) return "";

    // console.log(block);

    let caption = "";
    block.image.caption.forEach((element) => {
        caption += element.plain_text + "";
    });

    const url = block.image.file.url;
    //urlからpngかjpgかgifかを取得する
    const ext = url.match(/\.([0-9a-z]+)(?:[\?#]|$)/i)[1];
    const filename = `images/books/tar/${SLUG}_${counter}.${ext}`;
    downloadImage(url, path.join(process.cwd(), filename));

    counter++;
    if (caption === "") {
        return `![image.${ext}](/${filename})\n`;
    }
    return `![image.${ext}](/${filename})\n*${caption}*\n`;
});


n2m.setCustomTransformer("divider", async (block) => {
    console.log("divider", block);
    return "---\n";
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

    const response = await notion.pages.retrieve({
        page_id: data.pageId
    })
    // console.log(response)

    const mdblocks = await n2m.pageToMarkdown(data.pageId);
    // console.log(mdblocks);
    const mdString = n2m.toMarkdownString(mdblocks);
 
    //overwrite to file
    // joint path
    const filePath = BASE_PATH + data.file;
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

  }

  ;(async()=>{
    const data = [
        // {
        //     slug: "computer_scicence",
        //     pageId: "33c1985b367242f783cfe0ff20b079dc",
        //     file: "05_computer_science.md"
        // },
        {
            slug: "computer_graphics",
            pageId: "a8ff5118073d4a47927979597385558f",
            file: "06_computer_graphics.md"
        }
    ];

    data.forEach((obj) => {
        SLUG = obj.slug;
        fetch_and_convert_notion(obj);
    });


  })();