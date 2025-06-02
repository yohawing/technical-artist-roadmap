const { Client, LogLevel } = require("@notionhq/client")
const { NotionToMarkdown } = require("notion-to-md");
const fs = require('fs');
const { parseArgs } = require('node:util');
const NotionZennConverter = require('./notion-zenn-converter');

const NOTION_TOKEN = fs.readFileSync(".notion_token", "utf-8");
const BASE_PATH = "articles/"

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

    if (!values.id) {
        console.log("id is required");
        process.exit(1);
    }

    const converter = new NotionZennConverter(NOTION_TOKEN, {
        imageSavePath: 'images/articles/',
    });

    const response =  await converter.fetch(values.id)

    const mdString = await converter.convert(values.id,{
        title: response.properties.Pages.title[0].text.content,
        type: response.properties.Type.select.name || 'tech',
        emoji: response.icon.emoji || '📝',
        topics: converter.getTopics(response.properties.Topics.multi_select),
        published_at:response.created_time.replace("T", " ").replace("Z", ""),
    });

    // joint path
    const filePath = BASE_PATH + values.id + ".md";
    if (!fs.existsSync(BASE_PATH)) {
        fs.mkdirSync(BASE_PATH, { recursive: true });
    }

    fs.writeFileSync(filePath, mdString, { encoding: "utf-8" });
    console.log("write to file: " + filePath);

})();