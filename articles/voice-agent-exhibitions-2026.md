---
title: VoiceAgent展示をCodingAgentとフル制作した記録 ― 設計・検証・監視のやり方
type: tech
topics: ["VoiceAgent", "AI", "Cloudflare", "ElevenLabs", "TechnicalArtist"]
emoji: 🎙️
published: false
---

## はじめに

こんにちは、PYのテクニカルアーティストの与羽です。

昨年、大画面の没入体験としてAIと1対1で対話する展示を作りました。OpenAI Realtime APIを使い、画面の中の存在と喋るコンテンツでした。

今年はそこから一歩踏み込み、「もっと物理世界に出てきたAIと喋る体験」に挑戦しました。マネキンの頭にモニターを載せたり、パネルの顔にモニターを埋め込んだりして、人間側の空間へAIを出すイメージです。

10月と11月に立て続けに2本の展示を制作・運用しました。実装はほぼすべてCodingAgent（CodexやClaude Code）に任せ、自分はコードを読まずに設計・ディレクション・検証環境づくりに徹しています。

![AIと俺が協業しながら作品を作り上げる。w/ CodexとClaudeCode](/images/articles/voice_agent_01_collab.jpg)

展示内容や会場の様子は別記事でまとめる予定です。今回は技術面に絞り、「**CodingAgentと展示システムをどう設計・検証・監視したか**」という実践方法と、AIまわりの裏側を共有します。

---

## 今回作った2つの展示（ざっくり概要）

前提として、2つの展示がどういうものだったかだけ短く触れておきます。

1本目は10月の虎ノ門広告祭で展示した「ウワサの待合所」です。レトロテレビ型の頭部を載せた5体のマネキンが普段は掛け合い劇を流し、きっかけを与えるとVoiceAgent対話に切り替わります。制作ツールから配信基盤まで約1ヶ月で作りました。

![「ウワサの待合所」の展示イメージ](/images/articles/voice_agent_uwasa.gif)

2本目は11月展示の「ラブシャトル」です。体験者1人と、宇宙船の窓を背にしたキャラパネル3体（顔モニター＋個別スピーカー内蔵）が即興の恋愛リアリティ番組を繰り広げます。お土産動画ページまで含め約3週間で作りました。

![「ラブシャトル」の展示イメージ](/images/articles/voice_agent_loveshuttle.gif)

どちらもPoC・R&Dの色合いが強く、限られた期間で体験を盛り込み、展示中にもすぐ改善を回す必要がありました。

---

## コードを読まずに考えていたこと

今回の制作ではほとんどコードを読んでいません。やりたいことをひたすら言葉にしてエージェントへ伝え、動きを見ながら舵を切る進め方でした。

ただ丸投げすれば走り切れるわけではなく、人間側で意識して整えたポイントが大きく4つあります。

### 最新AIを追いかけてすぐ乗り換える

昨年の展示ではOpenAIのRealtime APIを使っていましたが、今年はElevenLabsへ移行しました。直近のクオリティの伸び方が大きく、自然な音声対話を作りやすくなっていたためです。

![新しく出たElevenLabsのv4とScribe v3どうなのよ？ え！めちゃすごいやん！](/images/articles/voice_agent_02_new_ai.jpg)

特に変化が速かったのが音声文字起こし（STT）です。10月時点ではKotoba-Whisperが最有力でしたが、すぐ後にローカルGPUで高速・高精度なHaas-ASRが登場しました。

さらにその直後、ElevenLabsのScribe v3が出てきて一気に本番採用へ切り替えました。本当に1〜2週間単位で別次元のモデルが出てくるため、毎日のように情報を追い、すぐ差し替えられる前提で組むのが一番効きました。

### AIが展示PCをさわれる環境と権限

展示では複数PCを連携させ、落ちないように監視し、改善をすぐデプロイする必要があります。そこで最初に、ネットワークと権限の土台をAIに作らせました。

自宅の開発PCから会場の全展示PCまでをTailscale（VPN）で繋ぎ、1台の司令塔PCからパスワードなしSSHと強い権限で操作できる構成です。これによりAI自身がリモートPCのログ確認・ビルド・再起動まで回せるようになりました。

![Tailscaleで複数PCを1つのエージェントが一括管理！便利！](/images/articles/voice_agent_03_tailscale.jpg)

あわせて、Cloudflare上に全台の状態監視や再起動ができる統合管理画面も置きました。人間が触りやすいだけでなく、「**AIがSSHなしでAPI経由から全台を見られる口**」として機能します。

いわば「展示用MCP」のような操作インターフェースができたことで、運用やトラブル調査をAIへ任せやすくなりました。展示中に異常がないかを定期ポーリングで監視する仕組みも、この上に載せています。

### 物理世界の音を検証データに落とす

展示制作が普通のWeb開発と違うのは、物理世界が絡む点です。会場の雑踏、スピーカーの回り込み、マイク特性、人の滑舌といった要素は、コードだけ見てもAIには検証できません。

1作目の「ウワサの待合所」では、そこがやり切れませんでした。現場の雑踏や会場内の音を含んだ実際のマイク収録データを持ち、機械的に聞き取りテストを回せる状態まで落とすべきでした。

![なるべく現場と近い状況を再現するデータを用意する！](/images/articles/voice_agent_04_field_data.jpg)

2作目の「ラブシャトル」ではその反省を活かし、マイクをダイナミックマイク（SM58）＋スイッチ式のPush-to-Talkへ変更しました。そのうえで、自分の滑舌の悪い読み方も含めた固有名詞入りの録音データセットを自作しています。

現場へ行くと音環境は変わるので1回録って終わりではありませんが、物理のボトルネックをデータ化してAIへ渡すだけで、検証精度と改善スピードは段違いに上がりました。

### チームとAIをまたぐ協力のしかた

複数人で協力して作るとき、Git共有を前提にそれぞれのメンバーが自分のCodingAgentと動く体制にできます。そのうえで「細かい開発用の便利ツールをクラウドのブラウザ上にどんどん作っておく」やり方がかなり効きました。

たとえば「ウワサの待合所」では、AI同士の会話データを作ってくれるメンバーが、CodingAgentで作ったデータをブラウザから転送してすぐ動作チェックできるツールを用意しました。また、複数人とAIが高速にコミットを重ねるため、最初にCIを組んでおけばよかったのは反省点です。

![人間同士で目的を話し合いながらそれぞれのAIがクラウドツール越しに協力するイメージ](/images/articles/voice_agent_08_team.jpg)

人との協力のしかたも変わります。相手もCodingAgentと一緒に動く前提なら、細かな手順を指示するより「**まずやりたいことの目的を共有し、細かい実装はそれぞれのAIに任せる**」ほうがうまく回ります。

その代わり、お互いが依存するデータ形式や境界の情報だけは、人間同士できちんとコミュニケーションを取りながら握っていく。そんな役割分担がちょうどよかったです。

---

## 技術トピック：システム設計の裏側

ここからは技術記事らしく、上の考え方を実際のシステムとしてどう組んだのか、アーキテクチャとAIまわりの工夫を整理します。

### 全体構成とマルチPC連携

2作目「ラブシャトル」の構成図です。自宅のCodingAgentが、Tailscale VPNとCloudflare API経由で会場の複数PCへデプロイ・監視・操作まで一気通貫で届きます。

```html-embed
<div class="va-arch">
  <input class="va-r" type="radio" name="va-m" id="va-ops" checked>
  <input class="va-r" type="radio" name="va-m" id="va-live">

  <div class="va-bar">
    <label class="va-t t-ops" for="va-ops">運用・監視</label>
    <label class="va-t t-live" for="va-live">本番の音声</label>
  </div>

  <svg class="va-svg" viewBox="0 0 680 280" role="img" aria-label="自宅の司令塔PCからTailscaleとCloudflareを経由して展示会場の2台のPCと外部AIにつながる構成図">
    <defs>
      <marker id="arr-t" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 1 2 L 8 5 L 1 8 z" class="mk-t"/>
      </marker>
      <marker id="arr-o" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 1 2 L 8 5 L 1 8 z" class="mk-o"/>
      </marker>
    </defs>

    <!-- 会場エリア枠 -->
    <rect x="330" y="18" width="212" height="244" rx="18" class="zone"/>
    <text x="436" y="39" text-anchor="middle" class="z-lbl">展示会場</text>

    <!-- 運用・監視ライン (Teal) -->
    <g class="g-ops">
      <path id="p-ssh" d="M 148 92 C 230 92, 260 104, 352 104" class="wire w-t"/>
      <path id="p-cf"  d="M 148 118 C 195 140, 200 175, 224 195" class="wire w-t"/>
      <path id="p-tun" d="M 288 195 C 320 195, 330 120, 352 118" class="wire w-t"/>
      <circle r="4.5" class="dot d-t"><animateMotion dur="2.2s" repeatCount="indefinite"><mpath href="#p-ssh"/></animateMotion></circle>
      <circle r="4.5" class="dot d-t"><animateMotion dur="2.0s" repeatCount="indefinite"><mpath href="#p-cf"/></animateMotion></circle>
      <circle r="4.5" class="dot d-t"><animateMotion dur="2.0s" repeatCount="indefinite"><mpath href="#p-tun"/></animateMotion></circle>
      <text x="242" y="84" text-anchor="middle" class="lbl-s c-t">Tailscale SSH</text>
    </g>

    <!-- 本番音声ライン (Orange) -->
    <g class="g-live">
      <path id="p-ai"   d="M 508 104 L 566 104" class="wire w-o"/>
      <path id="p-lan"  d="M 436 138 L 436 178" class="wire w-o"/>
      <path id="p-rec"  d="M 288 205 C 320 205, 330 128, 352 126" class="wire w-o"/>
      <circle r="4.5" class="dot d-o"><animateMotion dur="1.5s" repeatCount="indefinite"><mpath href="#p-ai"/></animateMotion></circle>
      <circle r="4.5" class="dot d-o"><animateMotion dur="1.4s" repeatCount="indefinite"><mpath href="#p-lan"/></animateMotion></circle>
      <circle r="4.5" class="dot d-o"><animateMotion dur="2.0s" repeatCount="indefinite"><mpath href="#p-rec"/></animateMotion></circle>
      <text x="466" y="162" class="lbl-s c-o">LAN</text>
    </g>

    <!-- 1. 自宅 司令塔PC -->
    <g class="node n-ops" transform="translate(36, 56)">
      <rect width="112" height="86" rx="14" class="card"/>
      <!-- ノートPC + ロボ顔アイコン -->
      <rect x="33" y="14" width="46" height="30" rx="6" class="ico-t"/>
      <circle cx="48" cy="27" r="2.5" class="ico-eye"/>
      <circle cx="64" cy="27" r="2.5" class="ico-eye"/>
      <path d="M 51 35 Q 56 39 61 35" class="ico-smile"/>
      <path d="M 26 48 L 86 48" class="ico-stroke"/>
      <text x="56" y="69" text-anchor="middle" class="lbl">自宅・AI</text>
    </g>

    <!-- 2. Cloudflare -->
    <g class="node n-both" transform="translate(184, 160)">
      <rect width="104" height="80" rx="14" class="card"/>
      <!-- 雲アイコン -->
      <path d="M 34 42 C 26 42 24 30 33 28 C 35 19 49 18 53 25 C 62 24 68 31 65 39 C 64 42 60 42 56 42 Z" class="ico-o"/>
      <text x="52" y="64" text-anchor="middle" class="lbl">Cloudflare</text>
    </g>

    <!-- 3. 会場 メインPC -->
    <g class="node n-both" transform="translate(352, 56)">
      <rect width="156" height="82" rx="14" class="card"/>
      <!-- PCタワー + マイクアイコン -->
      <rect x="42" y="14" width="26" height="34" rx="5" class="ico-n"/>
      <circle cx="55" cy="25" r="5" class="ico-fan"/>
      <circle cx="55" cy="39" r="2" class="ico-eye"/>
      <rect x="86" y="16" width="12" height="20" rx="6" class="ico-o"/>
      <path d="M 82 28 A 10 10 0 0 0 102 28 M 92 38 L 92 46 M 86 46 L 98 46" class="ico-stroke"/>
      <text x="78" y="68" text-anchor="middle" class="lbl">メインPC</text>
    </g>

    <!-- 4. 会場 顔表示PC ×3 -->
    <g class="node n-both" transform="translate(352, 178)">
      <rect width="156" height="72" rx="14" class="card"/>
      <!-- 3つの笑顔モニター -->
      <g transform="translate(22, 14)">
        <rect x="0" y="0" width="32" height="24" rx="5" class="ico-v"/>
        <circle cx="11" cy="10" r="2" class="ico-eye"/><circle cx="21" cy="10" r="2" class="ico-eye"/>
        <path d="M 12 16 Q 16 19 20 16" class="ico-smile"/>
      </g>
      <g transform="translate(62, 14)">
        <rect x="0" y="0" width="32" height="24" rx="5" class="ico-t"/>
        <circle cx="11" cy="10" r="2" class="ico-eye"/><circle cx="21" cy="10" r="2" class="ico-eye"/>
        <path d="M 12 16 Q 16 19 20 16" class="ico-smile"/>
      </g>
      <g transform="translate(102, 14)">
        <rect x="0" y="0" width="32" height="24" rx="5" class="ico-o"/>
        <circle cx="11" cy="10" r="2" class="ico-eye"/><circle cx="21" cy="10" r="2" class="ico-eye"/>
        <path d="M 12 16 Q 16 19 20 16" class="ico-smile"/>
      </g>
      <text x="78" y="59" text-anchor="middle" class="lbl">顔モニター ×3</text>
    </g>

    <!-- 5. 外部AI -->
    <g class="node n-live" transform="translate(566, 62)">
      <rect width="94" height="84" rx="14" class="card"/>
      <!-- キラキラAIアイコン -->
      <path d="M 47 14 L 52 29 L 67 34 L 52 39 L 47 54 L 42 39 L 27 34 L 42 29 Z" class="ico-y"/>
      <text x="47" y="70" text-anchor="middle" class="lbl">外部AI</text>
    </g>
  </svg>
</div>

<style>
  .va-arch {
    --bg: #f8f6f1;
    --card: #ffffff;
    --zone: #efeae0;
    --ink: #1e293b;
    --muted: #64748b;
    --line: #cbd5e1;
    --teal: #0d9488;
    --orange: #f97316;
    --violet: #8b5cf6;
    --yellow: #eab308;
    --navy: #334155;
    box-sizing: border-box;
    font-family: system-ui, -apple-system, sans-serif;
    background: var(--bg);
    color: var(--ink);
    border: 1px solid var(--line);
    border-radius: 16px;
    padding: 12px 14px 8px;
  }
  [data-theme="dark"] .va-arch {
    --bg: #131822;
    --card: #1d2534;
    --zone: #18202e;
    --ink: #f1f5f9;
    --muted: #94a3b8;
    --line: #334155;
    --teal: #2dd4bf;
    --orange: #fb923c;
    --violet: #a78bfa;
    --yellow: #facc15;
    --navy: #60a5fa;
  }
  .va-r { position: absolute; opacity: 0; pointer-events: none; }
  .va-bar {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
    margin-bottom: 4px;
  }
  .va-t {
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 999px;
    background: var(--zone);
    color: var(--muted);
    border: 1px solid var(--line);
    user-select: none;
  }
  #va-ops:checked ~ .va-bar .t-ops { background: var(--teal); color: #fff; border-color: var(--teal); }
  #va-live:checked ~ .va-bar .t-live { background: var(--orange); color: #fff; border-color: var(--orange); }
  [data-theme="dark"] #va-ops:checked ~ .va-bar .t-ops,
  [data-theme="dark"] #va-live:checked ~ .va-bar .t-live { color: #0f172a; }

  .va-svg { width: 100%; height: auto; display: block; max-height: 360px; }
  .zone { fill: var(--zone); stroke: var(--line); stroke-width: 1.5; stroke-dasharray: 5 5; }
  .z-lbl { fill: var(--muted); font-size: 12px; font-weight: 700; }
  .card { fill: var(--card); stroke: var(--line); stroke-width: 2; transition: stroke 0.25s; }
  .lbl { fill: var(--ink); font-size: 13px; font-weight: 700; }
  .lbl-s { font-size: 11px; font-weight: 700; }
  .c-t { fill: var(--teal); }
  .c-o { fill: var(--orange); }

  .ico-t { fill: var(--teal); }
  .ico-o { fill: var(--orange); }
  .ico-v { fill: var(--violet); }
  .ico-n { fill: var(--navy); }
  .ico-y { fill: var(--yellow); }
  .ico-eye { fill: #fff; }
  .ico-fan { fill: none; stroke: #fff; stroke-width: 2; }
  .ico-smile { fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; }
  .ico-stroke { fill: none; stroke: var(--ink); stroke-width: 2.2; stroke-linecap: round; }

  .wire { fill: none; stroke-width: 2.5; stroke-linecap: round; }
  .w-t { stroke: var(--teal); }
  .w-o { stroke: var(--orange); }
  .d-t { fill: var(--teal); }
  .d-o { fill: var(--orange); }

  .g-ops, .g-live, .node { transition: opacity 0.25s; }
  #va-ops:checked ~ .va-svg .g-live,
  #va-ops:checked ~ .va-svg .n-live { opacity: 0.22; }
  #va-ops:checked ~ .va-svg .n-ops .card,
  #va-ops:checked ~ .va-svg .n-both .card { stroke: var(--teal); }

  #va-live:checked ~ .va-svg .g-ops,
  #va-live:checked ~ .va-svg .n-ops { opacity: 0.22; }
  #va-live:checked ~ .va-svg .n-live .card,
  #va-live:checked ~ .va-svg .n-both .card { stroke: var(--orange); }

  @media (prefers-reduced-motion: reduce) {
    .dot { display: none; }
  }
</style>
```

1作目「ウワサの待合所」も基本思想は同じです。Cloudflare Workers + D1 + R2で作品配布と端末管理を束ね、各卓PCが `TableController`（Python）と `RenderHost`（C++）で描画・音声出力を回しています。

### RenderHost流用と共通シート

開発スピードに効いたのが、1作目のC++顔描画・音声ホスト `RenderHost` の流用です。本来は1プロセス最大2体の設計ですが、2作目で3体必要になった際、C++本体は一切改造しませんでした。

単体モードを3プロセス並列起動し、手前の薄いNode.jsブリッジからJSON Linesで制御する構成にすることで、短期間で3体運用へ対応しています。

![2作品で共通化した4列×8行の表情SpriteSheet（左：ウワサの待合所、右：ラブシャトル）](/images/articles/voice_agent_spritesheets.png)

表情シート（`expression-spritesheet` v2）も統一しました。横4フレーム×縦8表情を並べ、会話用の7行を「F1: 閉、F2: 小、F3: 大、F4: 瞬き」として音量で口パクさせます。待機行を瞬き専用にし、聞き手の口が動く事故を構造的に防ぎました。

:::details 表情切替の細かい調整
顔表示側では発話途中の表情切替を行わないため、10文字以下の短いリアクションだけ感情別の行を使い、長台詞は目を開いた通常会話（`unique1`）で話すようにしています。喜・楽の行は目を細めた絵が多く、長台詞中ずっと目を閉じて見えるのを避けるためです。
:::

### マルチエージェント開発の回しかた

3週間で500コミット超（約5.5万行・テスト1,000件以上）のペースでは文脈がすぐ消えるため、仕様・プロトコル・TODOのMarkdownを常に正本とし、「実測結果と変更理由」をそのまま残しました。

- 実装・テストはCodexを主軸にしつつ、UI再設計や日本語コメディ台本は対象ファイルと制約を書いたブリーフでClaude Code（Sonnet / Fable）へ委譲
- 表情シート生成やタイムライン作品化など繰り返す工程は、検証スクリプト込みでスキル（`expression-spritesheet`・`timeline-production`）としてリポジトリ内に定義
- 展示直前に「1日連続稼働で止まるバグ」「結末判定の食い違い」を観点指定してエージェントに複数回レビューさせ、履歴蓄積やログ上限による停止バグを事前に潰した

### 評価ハーネスと音声の検証

AIが自分で叩いて数値を見られる検証環境を、本編と並行して3段構えで作りました。

- 録音サイト（`/record`）とコーパス評価スクリプト（`voice-eval`）
- 実録音WAVとローカルSTTだけで外部APIなしに番組を通すシナリオ回帰テスト（`scenario-run`）
- TTSを省き、仮想体験者LLMと採点LLM（6観点）で会話の面白さを回すシミュレーター（`sim-run`）

![3段階の自動評価ハーネス（音声コーパス評価・シナリオテスト・LLMシミュレーター）](/images/articles/voice_agent_05_eval_harness.jpg)

自分の声で録った45〜58本のコーパス（16kHz WAV＋正解JSON）でSTTを比較すると、手元GPUではKotoba-Whisperの名前認識率42〜46%に対し、Haas-ASR＋語彙（alpha 4.0）はCER 10.8%・名前認識率79%・往復62msまで伸びました。

最終的には直後に登場したElevenLabs Scribe v3をライブ本番で使い、上限到達時だけローカルHaasへ落とす構成にしています。録音コーパス検証で見つかった音声まわりの実戦的な知見は以下にまとめました。

:::details 録音検証で見えた音声エンジニアリングの小技4選
- 語彙バイアスの罠とキャラ改名：不在キャラ名や体験者名を強い重みで語彙に入れると誤変換が増えるため、語彙は「舞台にいる3人だけ」に限定しました。また旧キャラ名「ヨル」は録音12件中8件が漢字の「夜」に吸われたため「シオン」へ改名しています。
- SM58物理スイッチの自動PTT化：AGC等を全オフにし、100Hzハイパス後のRMS音量を20ms間隔で監視します。OFF（カプセル短絡の極小ノイズ）とON（環境音）の差を事前キャリブレーション（6dB以上）し、120ms超過でON（250msプリロール付き録音）、−3dBを1200ms下回ってOFFと判定します。
- コンプレッサーとSTT経路の分離：AGCオフで小さくなった体験者の声（−34.6 dBFS）を動画用にコンプで持ち上げた（−21.4 dBFS）ところ、STT精度が劣化しました（39発話中17件が変化し、告白の相手名も誤認識）。STTには生音声、記録・お土産動画にだけコンプ済み音声を使うよう分離しています。
- 割り込み（barge-in）時の文脈保持：ElevenLabsの `with-timestamps` で文字ごとの時刻アライメントを受け取り、中断されたサンプル位置までの本文だけを会話履歴に確定させています。
:::

### 非同期Directorとルール制御

マルチエージェント会話をLLMに丸投げした初期テストでは、全員が同意し合う穏やかな料理話で終わったり、AI3人が体験者を囲む圧迫面接状態になったりしました。そこで「非同期の演出AI（Director v2）」と「決定論的ルール」に分けています。

![演出カンペを出すDirectorと盛り上がるキャラたち](/images/articles/voice_agent_06_director.jpg)

Directorは会話を止めないよう2発話ごとに非同期で呼び、Prompt Cachingが効く入力順＋Structured Outputで評価と指示を返させます。画面見出し（`chip`: 12字）と演者用の非公開本文（`text`: 40字）を分け、カンペ朗読も防ぎました。

```html-embed
<div class="va-dir">
  <svg class="vd-svg" viewBox="0 0 680 230" role="img" aria-label="表の会話レーンをルールで止めずに回しつつ、裏レーンからDirectorがカンペを差し込む2層構造の図">
    <!-- 表レーン（会話の道） -->
    <rect x="24" y="24" width="632" height="84" rx="18" class="vd-lane-top"/>
    <text x="42" y="47" class="vd-tag t-o">表の会話（止めない）</text>
    <path id="vd-main" d="M 105 74 L 580 74" class="vd-track tr-o"/>
    <circle r="5" class="vd-ball b-o"><animateMotion dur="2.6s" repeatCount="indefinite"><mpath href="#vd-main"/></animateMotion></circle>

    <!-- 体験者アイコン -->
    <g transform="translate(64, 52)">
      <circle cx="22" cy="14" r="11" class="vd-o"/>
      <path d="M 6 40 C 6 28, 38 28, 38 40 Z" class="vd-o"/>
    </g>

    <!-- 関所：ルール優先 -->
    <g transform="translate(248, 44)">
      <rect width="120" height="52" rx="12" class="vd-gate"/>
      <!-- 盾アイコン -->
      <path d="M 24 14 L 36 18 L 36 27 C 36 34 30 38 24 40 C 18 38 12 34 12 27 L 12 18 Z" class="vd-n"/>
      <text x="46" y="31" class="vd-lbl">ルール優先</text>
    </g>

    <!-- 演者3画面アイコン -->
    <g transform="translate(520, 54)">
      <rect x="0" y="0" width="32" height="26" rx="6" class="vd-v"/>
      <rect x="38" y="0" width="32" height="26" rx="6" class="vd-t"/>
      <rect x="76" y="0" width="32" height="26" rx="6" class="vd-o"/>
      <circle cx="11" cy="11" r="2" class="vd-eye"/><circle cx="21" cy="11" r="2" class="vd-eye"/>
      <circle cx="49" cy="11" r="2" class="vd-eye"/><circle cx="59" cy="11" r="2" class="vd-eye"/>
      <circle cx="87" cy="11" r="2" class="vd-eye"/><circle cx="97" cy="11" r="2" class="vd-eye"/>
    </g>

    <!-- 裏レーン（非同期Director） -->
    <rect x="24" y="130" width="632" height="78" rx="18" class="vd-lane-bot"/>
    <text x="42" y="153" class="vd-tag t-t">裏で非同期</text>

    <!-- 表→裏の観察線 & 裏→表のカンペ差し込み線 -->
    <path id="vd-sub" d="M 164 74 C 164 138, 180 174, 240 174 L 440 174 C 482 174, 492 142, 492 78" class="vd-track tr-t"/>
    <circle r="4.5" class="vd-ball b-t"><animateMotion dur="3.2s" repeatCount="indefinite"><mpath href="#vd-sub"/></animateMotion></circle>

    <!-- Director ロボ + カンペ -->
    <g transform="translate(274, 145)">
      <rect width="144" height="50" rx="12" class="vd-card"/>
      <rect x="14" y="11" width="28" height="24" rx="6" class="vd-t"/>
      <circle cx="23" cy="21" r="2" class="vd-eye"/><circle cx="33" cy="21" r="2" class="vd-eye"/>
      <text x="54" y="30" class="vd-lbl">Director AI</text>
    </g>

    <!-- カンペアイコン -->
    <g transform="translate(466, 102)">
      <rect width="54" height="30" rx="8" class="vd-cue"/>
      <text x="27" y="19" text-anchor="middle" class="vd-cue-t">カンペ</text>
    </g>
  </svg>
</div>

<style>
  .va-dir {
    --bg: #f8f6f1;
    --card: #ffffff;
    --top: #fff7ed;
    --bot: #f0fdfa;
    --ink: #1e293b;
    --line: #cbd5e1;
    --teal: #0d9488;
    --orange: #f97316;
    --violet: #8b5cf6;
    --navy: #334155;
    box-sizing: border-box;
    font-family: system-ui, -apple-system, sans-serif;
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 16px;
    padding: 8px;
  }
  [data-theme="dark"] .va-dir {
    --bg: #131822;
    --card: #1d2534;
    --top: #261b14;
    --bot: #102627;
    --ink: #f1f5f9;
    --line: #334155;
    --teal: #2dd4bf;
    --orange: #fb923c;
    --violet: #a78bfa;
    --navy: #60a5fa;
  }
  .vd-svg { width: 100%; height: auto; display: block; max-height: 270px; }
  .vd-lane-top { fill: var(--top); stroke: var(--orange); stroke-opacity: 0.35; stroke-width: 1.5; }
  .vd-lane-bot { fill: var(--bot); stroke: var(--teal); stroke-opacity: 0.4; stroke-width: 1.5; stroke-dasharray: 6 5; }
  .vd-tag { font-size: 12px; font-weight: 700; }
  .t-o { fill: var(--orange); }
  .t-t { fill: var(--teal); }
  .vd-track { fill: none; stroke-width: 3; stroke-linecap: round; }
  .tr-o { stroke: var(--orange); stroke-opacity: 0.45; }
  .tr-t { stroke: var(--teal); stroke-dasharray: 5 5; stroke-opacity: 0.6; }
  .b-o { fill: var(--orange); }
  .b-t { fill: var(--teal); }
  .vd-gate, .vd-card { fill: var(--card); stroke: var(--line); stroke-width: 2; }
  .vd-gate { stroke: var(--navy); }
  .vd-card { stroke: var(--teal); }
  .vd-lbl { fill: var(--ink); font-size: 13px; font-weight: 700; }
  .vd-cue { fill: var(--teal); }
  .vd-cue-t { fill: #fff; font-size: 11px; font-weight: 700; }
  [data-theme="dark"] .vd-cue-t { fill: #0f172a; }
  .vd-o { fill: var(--orange); }
  .vd-t { fill: var(--teal); }
  .vd-v { fill: var(--violet); }
  .vd-n { fill: var(--navy); }
  .vd-eye { fill: #fff; }
  @media (prefers-reduced-motion: reduce) {
    .vd-ball { display: none; }
  }
</style>
```

:::details Director の構造化JSON出力例
```json:director-output.json
{
  "assessment": {
    "energy": 2,
    "monotony": 4,
    "participantNeglected": false,
    "goalProgress": "not_yet",
    "issues": ["全員が同意するだけで張り合いがない"]
  },
  "humanCue": null,
  "actorDirectives": [
    {
      "actor": "A",
      "chip": "反論して",
      "text": "ニコラの意見に軽く反対し、自分の理想を1つ言う"
    }
  ],
  "beat": "values_clash",
  "memo": ["料理"],
  "phaseReady": false
}
```
:::

ただし「2人名指しで無関係な演者が答える」「演者が5人連続で話す」といった破綻はLLMだけでは防げません。次の話者を決める `nextSpeaker` の優先順位ルールと雑談のサイロ脱出を最上位に置き、LLM演出はその下で動かしています。

:::details nextSpeaker の優先順位設計（抜粋）
1. 告白の段取りで確定している話者
2. 体験者が発言内で明示的に名指しした演者（規則ベースで複数名も呼ばれた順に抽出）
3. トークテーマで体験者が特定の演者に好意を見せた直後の「張り合いの一言」
4. 体験者の発言直後の応答担当（分類モデルの宛先、または直前までやりとりしていた演者）
5. 同じ2人のラリーが2往復（4発言）を超えたときの強制介入（輪の外の演者が話題を変えずに入る）
6. 「その人しか話せない話題」（仕事・過去・気持ち）なら体験者へ戻し、開いた話題なら他演者が入る
7. 演者の連続発話上限（自己紹介・告白2人、イベント3〜4人）に達したら体験者へ
8. 演者から体験者への質問なら体験者へ
9. ここまでの保護ルールを通過したときだけ、仕掛けやDirectorの割り込みを適用する
:::

### フォールバックと展示の監視設計

モデルをすぐ乗り換えられ、展示中に落ちても自動で戻るよう、切り替えと安全装置を薄く組んでいます。

![展示PCを見守り自動復帰させる監視のイメージ](/images/articles/voice_agent_07_monitoring.jpg)

- Director LLMは1関数に閉じ込め、Anthropic直 → OpenRouter → OpenAI（Sol）の順で番組中に最大2回まで自動フォールバック
- STTは本番Scribeと会場GPUのHaasを自動切替。1作目ではElevenLabs障害時に会場の自前GPU母艦（ローカルLLM＋IrodoriTTS/Fish Audio）へ落とす経路も実装
- 各PCの生死・応答・GPU温度を定期ポーリング監視し、電源ONだけで全サービス・全画面が自動復帰する構成にした
- 受付WorkerとスタジオWorkerを分離し、受付IDとは別の内部参照ID `ref` で漏洩を防止。グローバルな `Quota` Durable Objectで日次上限も管理した

:::details 現場で効いた細かい対策（ローカルLLMの珍事件・OS固定設定）
- ローカルLLMの `[end_call]` 読み上げ事件：1作目で自前GPU母艦のGemmaへフォールバックさせた際、終了合図の `[end_call]` を本文としてそのまま読み上げて3分上限まで終わらない事故がありました。出力をJSON Schemaの `endConversation: boolean` に強制してサニタイズし解決しています。
- Windowsディスプレイ固定：再起動で `\\.\DISPLAY1` 番号が入れ替わるため、`MonitorId` 機種コード＋GPU端子固有の `UID` で画面を識別しました。
- LinuxのEDID焼き込み：顔モニター3画面は起動時に電源OFFだとEDIDが読めず他画面も道連れで落ちるため、実機のEDIDバイナリを `/etc/X11/xorg.conf.d/` に固定しました。
- USBオーディオ・portproxy・McAfee・フォーカス対策：USB音声ドングル3本は `/etc/modprobe.d/` で固定、Windows起動直後の `portproxy` 失敗は1分監視タスクで張り直し、McAfeeの誤検知対策でサーバーとブラウザを別タスク分離、物理ボタン（Hキー）のフォーカス外れは操作2秒後の自動復帰で対応しています。
:::

---

## まとめ

2つのVoiceAgent展示をCodingAgentとのフル制作体制で走り切り、コードを読まずにアイデアをここまで短時間で実機へ持っていける時代を実感しました。

PoCやR&D、広告系の展示のようにタイトなスケジュールで体験を磨きたい現場では、思いついた改善をその場で作って展示中でもすぐデプロイできる恩恵は大きいです。

最新モデルへの乗り換え前提、TailscaleやCloudflare APIでAIが展示PCを触れる環境、物理の音を渡す検証データ、そして目的と境界を握るチーム設計――これらを人間が整えると、CodingAgentとの展示制作がぐっと回りやすくなります。

With CodingAgentな展示制作の一つのやり方として参考になれば嬉しいです！展示コンテンツの中身や体験設計の振り返りは、また別の記事で書こうと思います。

---

## 参考記事

- [ElevenLabs ドキュメント](https://elevenlabs.io/docs/overview)（Conversational AI・TTS・Scribe音声認識）
- [Cloudflare Workers / Durable Objects ドキュメント](https://developers.cloudflare.com/durable-objects/)（管理画面・受付Worker・状態管理とQuota制御）
- [Tailscale ドキュメント](https://tailscale.com/kb)（開発PC〜会場展示PC群を結ぶVPNとSSH運用）
- [Haas-ASR（GitHub）](https://github.com/third-intelligence/Haas-ASR)（ローカルGPUで検証・運用した日本語音声認識モデル）
- [OpenRouter ドキュメント](https://openrouter.ai/docs/quickstart)（Director用LLMの切り替え・フォールバック経路）
