const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');
const NotionZennConverter = require('../scripts/notion-zenn-converter');

// モック化が必要な外部依存
jest.mock('axios');
jest.mock('sharp');
jest.mock('fs');
jest.mock('@notionhq/client');
jest.mock('notion-to-md');

// const NOTION_TOKEN = fs.readFileSync(".notion_token", "utf-8");
const NOTION_TOKEN = "secret_9Q7CVsiyAmQ3Zcu1MOEtRQDm3OzKJHay6U4n41AFiUP"
var BASE_PATH = "articles/"

describe('NotionMarkdownConverter', () => {
  let converter;

  beforeEach(() => {
    // 各テスト前にクリーンな状態でインスタンスを作成
    converter = new NotionZennConverter(NOTION_TOKEN);
  });

  describe('コンストラクタ', () => {
    it('デフォルトオプションでインスタンスを作成できる', () => {
      expect(converter).toBeTruthy();
      expect(converter.notion).toBeTruthy();
      expect(converter.n2m).toBeTruthy();
    });

    it('カスタムオプションでインスタンスを作成できる', () => {
      const customConverter = new NotionZennConverter(NOTION_TOKEN, {
        imageSavePath: 'custom/path/',
        parseChildPages: true
      });

      expect(customConverter.imageSavePath).toBe('custom/path/');
    });
  });

  describe('convertPage', () => {
    // it('Notionページを正しく変換できる', async () => {
    //   // モックデータの設定
    //   const mockPageId = '1c448e5455a08043b409c547342ade14';

    //   const converter = new NotionZennConverter(NOTION_TOKEN, {
    //     imageSavePath: 'images/articles/',
    //     isDownloadImages: false,
    //   });

    //   const mdString = await converter.convert(mockPageId);

    //   // load local md file
    //   const filePath = `test/data/${mockPageId}.md`;
    //   const fileData = fs.readFileSync(filePath, 'utf-8');

    //   expect(mdString).toBe(fileData);
    // });

    it('デフォルト絵文字が設定される', async () => {
      const mockPageId = '1c448e5455a08043b409c547342ade14';
      const mockPageResponse = {
        properties: {
          title: {
            title: [{ plain_text: 'Test Page Title' }]
          }
        },
        icon: null
      };

      const mockMdBlocks = [];
      const mockMdString = { parent: '' };

      converter.notion.pages.retrieve = jest.fn().mockResolvedValue(mockPageResponse);
      converter.n2m.pageToMarkdown = jest.fn().mockResolvedValue(mockMdBlocks);
      converter.n2m.toMarkdownString = jest.fn().mockReturnValue(mockMdString);

      const result = await converter.convertPage(mockPageId);

      expect(result.emoji).toBe('🚀');
    });
  });

  // describe('downloadImage', () => {
  //   it('画像をダウンロードしてリサイズできる', async () => {
  //     // モックデータの設定
  //     const mockImageBuffer = Buffer.from('mock-image-data');
  //     const mockMetadata = { width: 1500 };
  //     const mockResizedBuffer = Buffer.from('resized-image-data');

  //     axios.mockResolvedValue({
  //       data: mockImageBuffer
  //     });

  //     sharp.mockReturnValue({
  //       metadata: jest.fn().mockResolvedValue(mockMetadata),
  //       resize: jest.fn().mockReturnThis(),
  //       toBuffer: jest.fn().mockResolvedValue(mockResizedBuffer)
  //     });

  //     const result = await converter.downloadImage('http://example.com/image.jpg', '/path/to/save/image.jpg');

  //     expect(result).toBe(1500);
  //     expect(fs.writeFileSync).toHaveBeenCalledWith('/path/to/save/image.jpg', mockResizedBuffer);
  //   });

  //   it('1000px未満の画像は縮小しない', async () => {
  //     const mockImageBuffer = Buffer.from('mock-image-data');
  //     const mockMetadata = { width: 800 };
  //     const mockOriginalBuffer = Buffer.from('original-image-data');

  //     axios.mockResolvedValue({
  //       data: mockImageBuffer
  //     });

  //     sharp.mockReturnValue({
  //       metadata: jest.fn().mockResolvedValue(mockMetadata),
  //       toBuffer: jest.fn().mockResolvedValue(mockOriginalBuffer)
  //     });

  //     const result = await converter.downloadImage('http://example.com/image.jpg', '/path/to/save/image.jpg');

  //     expect(result).toBe(800);
  //     expect(fs.writeFileSync).toHaveBeenCalledWith('/path/to/save/image.jpg', mockOriginalBuffer);
  //   });
  // });

  
});