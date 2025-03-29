const fs = require('fs');
const { parseArgs } = require('node:util');
const NotionZennConverter = require('./notion-zenn-converter');
const { SlowBuffer } = require('node:buffer');

const NOTION_TOKEN = fs.readFileSync(".notion_token", "utf-8");
const BASE_PATH = "books/technical-artist-roadmap/";
const IMAGE_BASE_PATH = "images/books/tar/";

; (async () => {

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
            },
            slug: {
                type: 'string'
            }
        }
    });

    if (!values.id && !values.slug) {
        console.log("id slug is required");
        process.exit(1);
    }

    const converter = new NotionZennConverter(NOTION_TOKEN, {
        imageSavePath: IMAGE_BASE_PATH,
        slug: values.slug,
    });

    const response = await converter.fetch(values.id);

    const mdString = await converter.convert(values.id, {
        title: response.properties.title.title[0].text.content,
        emoji: response.icon.emoji || '📝',
    });

    // joint path
    const filePath = BASE_PATH + values.slug + ".md";
    if (!fs.existsSync(BASE_PATH)) {
        fs.mkdirSync(BASE_PATH, { recursive: true });
    }

    fs.writeFileSync(filePath, mdString, { encoding: "utf-8" });
    console.log("write to file: " + filePath);

})();