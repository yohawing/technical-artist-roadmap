const { Client, LogLevel } = require("@notionhq/client")
const { NotionToMarkdown } = require("notion-to-md");
const fs = require('fs');
const https = require('https');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');
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

    const mdString = await converter.convert(values.id);

    // joint path
    const filePath = BASE_PATH + values.id + ".md";
    if (!fs.existsSync(BASE_PATH)) {
        fs.mkdirSync(BASE_PATH, { recursive: true });
    }

    fs.writeFileSync(filePath, mdString, { encoding: "utf-8" });
    console.log("write to file: " + filePath);

})();