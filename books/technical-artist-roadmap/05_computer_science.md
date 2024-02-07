---
title: "基礎知識：コンピューターサイエンス（50％）"
emoji: "📟"
published: true
---
    
コンピューターサイエンスはコンピューターの仕組みや技術を知識体系としてまとめたものです。プログラミングで仕事をするうえで何となく身についている基礎知識がほとんどですが、意外と理解できてない知識などあるので一度さらっておくとよいでしょう。


# アルゴリズムとデータ構造


アルゴリズムは問題を解決するための手順や方法を示します。一方、データ構造はデータを効率的に管理・格納するための方法を提供します。例えば、配列、リスト、スタック、キュー、ツリー、グラフなどがあります。これらは、効率的なアルゴリズムの実装に不可欠です。


## データ構造


データ構造は、データを処理しやすい形に整えた構造のことです。アルゴリズムが料理しやすいようにデータを下処理するようなイメージですね。


![Untitled.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/b7c80d04-e22f-417f-8da1-4b443ffb4876/a5b3c047-dd4f-4157-8f7e-37ca7ea335b3/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240207%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240207T094020Z&X-Amz-Expires=3600&X-Amz-Signature=1edda506c0c3711cb035a516f64ff9b0bd03cf2374d9d55d390bfad1aebb7502&X-Amz-SignedHeaders=host&x-id=GetObject)


![Untitled.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/b7c80d04-e22f-417f-8da1-4b443ffb4876/9585ca36-117b-4d8c-8045-e3b6f07f2f06/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240207%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240207T094020Z&X-Amz-Expires=3600&X-Amz-Signature=592e83daf68edb1f58282f5cbb94ce72696c8c312125301d991bb5ec49c0b32c&X-Amz-SignedHeaders=host&x-id=GetObject)


![Untitled.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/b7c80d04-e22f-417f-8da1-4b443ffb4876/03fa4d8c-1e3e-4f26-a6ab-b446eb01090e/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240207%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240207T094021Z&X-Amz-Expires=3600&X-Amz-Signature=72ee8139f85a5b6d6e2c006362c4dbd1ab45427b062c04c3ea3b1153313f8b6f&X-Amz-SignedHeaders=host&x-id=GetObject)


![Untitled.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/b7c80d04-e22f-417f-8da1-4b443ffb4876/4f3008a8-d0c2-4977-82fe-29a23824d3ff/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240207%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240207T094021Z&X-Amz-Expires=3600&X-Amz-Signature=5cb712bfa5fe74a1315a2dbccba6d096e80fafa46434a7b7fcf38ccaecd6d684&X-Amz-SignedHeaders=host&x-id=GetObject)


![Untitled.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/b7c80d04-e22f-417f-8da1-4b443ffb4876/fa9030df-0bd3-434a-8872-f6c2839d2bdd/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240207%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240207T094023Z&X-Amz-Expires=3600&X-Amz-Signature=029036c5b75d6ae831b7784ef82cede63c5e5082f59fe7bd8406aa8088623e5c&X-Amz-SignedHeaders=host&x-id=GetObject)


![Untitled.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/b7c80d04-e22f-417f-8da1-4b443ffb4876/6ed293c3-72e9-4a83-b27a-f85bac288b52/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240207%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240207T094023Z&X-Amz-Expires=3600&X-Amz-Signature=95454c93f1ccb7187035b2556f0f1daa224842404c2e472d77338309632f807f&X-Amz-SignedHeaders=host&x-id=GetObject)

- **配列（Array）**：一列に連なったデータのまとまりです。連続したメモリに格納されます。
- **連想配列（Key-Value）**：関連性のある要素どうしを結びつけるデータ構造です。その際、標識となる要素のことを、**キー(key)**、対応する要素のことを**値(value)**と言います。DictionaryだったりHashTableだったり別名があります。
- **スタック（Stack）**：**Push**で末尾に要素の追加をして、**Pop**で末尾の要素の削除をします。
- **キュー（Queue）**：**Enqueue**で末尾に要素の追加をして、**Dequeue**で先頭の要素の削除をします。
- **グラフ（Graph）**:オブジェクトやネットワークの関係性を表現するデータ構造で、**vertex/node**とそれらを結ぶ **edge/link**（辺）から構成されます。edge/linkには**weight（重み）**と**direction（方向）**があります。
- **ツリー（Tree）**：木のような、階層的なデータ構造をあらわします。一つのルートノードから始まり、複数の子ノードが連なります。
- その他：[Heap](https://medium.com/@yasufumy/data-structure-heap-ecfd0989e5be)、[Set](https://ja.wikipedia.org/wiki/%E3%82%BB%E3%83%83%E3%83%88_(%E6%8A%BD%E8%B1%A1%E3%83%87%E3%83%BC%E3%82%BF%E5%9E%8B))、[B-Tree](https://ja.wikipedia.org/wiki/B%E6%9C%A8)、[LinkedList](https://ja.wikipedia.org/wiki/%E9%80%A3%E7%B5%90%E3%83%AA%E3%82%B9%E3%83%88)

## アルゴリズム


アルゴリズムは、データを処理するルールのことです。一言でいうと簡単ですが、１＋１のような簡単なアルゴリズムから、複雑な問題をシンプルに解ける賢いアルゴリズムまで様々あります。ここでは基本的にはコンピューターが解きやすい問題を中心に取り扱います。

- **ソート（並び替え）：**バブルソート、クイックソート、マージソート、選択ソート、挿入ソート、ヒープソート
- **サーチ（探索）：**線形探索、二分探索（Binary Search）、四分木探索（Quadtree Search）、八分木探索（Octree Search）、文字列探索、ハッシュ関数
- **グラフアルゴリズム**：グラフ理論に基づくアルゴリズムダイクストラ法（最短経路問題）、クラスカル法（最小全域木問題）、深さ優先探索（DFS）、幅優先探索（BFS）
- **最適化アルゴリズム**:：特定の条件下で最適な解を見つけるアルゴリズム。例: 線形計画法、遺伝的アルゴリズム、シミュレーテッド・アニーリングなど。
- **機械学習アルゴリズム**：機械学習で使われるアルゴリズム。k近傍法、決定木、ニューラルネットワーク、SVM、Transformerなど

## 参考リンク


[bookmark](https://sevendays-study.com/algorithm/)


# ハードウェア


## 半導体と論理回路


**半導体（トランジスタ）**は計算機を作る重要なパーツになります。


電流を流す、流さない（０と１）を制御できるので、**論理回路**（AND、OR、NOT、XOR）を組むことができます。この論理回路を使うと、四則演算（+−×÷）を行うことができます。


![Untitled.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/b7c80d04-e22f-417f-8da1-4b443ffb4876/051130d7-5ea1-47e2-891e-d3327b1beb1a/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240207%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240207T094024Z&X-Amz-Expires=3600&X-Amz-Signature=eb9be13373482544d6214b6056888f7b75da34827743c3a7556b580bc22df576&X-Amz-SignedHeaders=host&x-id=GetObject)


![%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88_2024-01-17_17.11.03.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/b7c80d04-e22f-417f-8da1-4b443ffb4876/d53733f1-9f52-4317-a542-83a240afee38/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88_2024-01-17_17.11.03.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240207%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240207T094024Z&X-Amz-Expires=3600&X-Amz-Signature=d50f50797e4308dfc73ef237bfa62b37f655fd1d293e66e3ee1a6afbc5bc02f0&X-Amz-SignedHeaders=host&x-id=GetObject)


![Untitled.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/b7c80d04-e22f-417f-8da1-4b443ffb4876/4d216545-a5ac-46de-80ee-82640334ddc5/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240207%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240207T094016Z&X-Amz-Expires=3600&X-Amz-Signature=f3592171271f663cb6b1ad96e8d4d7f00ca1fa28bc6ed930e7669004a57bddc2&X-Amz-SignedHeaders=host&x-id=GetObject)


[bookmark](https://kouyama.sci.u-toyama.ac.jp/main/education/2012/isintro/pdf/text/text06.pdf)


## CPU（Central Processing Unity）


CPUは半導体の集合体です。主な機能は、シンプルには数値や論理的計算をすることなのですが、その計算により、プログラムの命令を実行し、コンピュータの各部分を制御することができます。。これにより、コンピュータは計算、データの処理、タスクの実行など、多様な作業をこなすことができます。


CPUは一般に以下の主要なコンポーネントから構成されています：

1. **演算処理ユニット（ALU）**：数学的な計算や論理的な操作を行います。
2. **制御ユニット（CU）**：プログラムの命令を解読し、他のコンピュータ部品に指示を出す役割を担います。
3. **レジスタ**：命令の実行中にデータを一時的に保存するための小さな記憶領域です。

|  単語      | 意味                                                                                  |
| -------- | ----------------------------------------------------------------------------------- |
| クロック     | 一秒あたりの命令処理数。電気信号の周波数に準じている。                                                         |
| マルチコア    | 複数の処理を同時に行う能力。小さいCPUが沢山あるイメージ。                                                      |
| マルチスレッド  | １つのコアで複数の処理を扱う能力。                                                                   |
| キャッシュサイズ | レジスタより多くの情報を一時記憶するCPUに内蔵されているメモリ                                                    |
| アーキテクチャ  | 命令セット（計算）やレジスタの仕様などの設計方法。x86,x64,ARMなどがある。                                          |
| ビット      | ２進数の数の桁数。２のN乗。コンピュータの演算処理の単位。1ビット＝１バイト。たとえば、8ビットのアーキテクチャでは、1ビットで$2^{8}=256$を表現できる 。 |


CPUの動作は基本的に「フェッチ（Fetch）、デコード（Decode）、実行（Execute）」の3ステップのサイクルで成り立っています。これを理解することで、CPUがどのようにして命令を処理するかが分かります。

1. **フェッチ（Fetch）**:
	- このステップでは、CPUはメモリから次に実行すべき命令を取得します。命令は通常、バイナリコード（0と1のシーケンス）の形で格納されています。
	- プログラムカウンタ（PC）というレジスタが、次に実行する命令のメモリアドレスを保持しており、CPUはこのアドレスから命令を「フェッチ」します。
2. **デコード（Decode）**:
	- 取得した命令は、制御ユニットによって解読されます。これは、バイナリコードをCPUが理解できる具体的な指示に変換するプロセスです。
3. **実行（Execute）**:
	- 解読された命令は、次にCPU内の適切な部分で実行されます。例えば、算術論理ユニット（ALU）では数学的な演算が、レジスタではデータの読み書きが行われます。
	- 例えば、「加算」や「データの移動」といった操作がここで特定されます。
	- 実行フェーズが完了すると、CPUは結果をメモリに書き戻すか、または内部で保持します。

## GPU（Graphic Processing Unity）


GPUは、主に画像処理とレンダリングに特化したコンピュータのプロセッサです。もともとはビデオゲームや3Dグラフィックスを高速に処理するために設計されましたが、その高い計算能力と並列処理能力により、現在ではビデオ編集、画像処理、機械学習、ディープラーニングなど幅広い分野で使用されています。


![Untitled.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/b7c80d04-e22f-417f-8da1-4b443ffb4876/0bd0b23f-f307-4fda-be56-3bf8d8ba1c91/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240207%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240207T094016Z&X-Amz-Expires=3600&X-Amz-Signature=4643439f7998508ccd3becd4bf163e8af79db029dfa0b639ad33b60df623cd8a&X-Amz-SignedHeaders=host&x-id=GetObject)

1. **並列処理能力**:
	- GPUは数百から数千の小さなコアを持っており、これにより複数の計算処理を同時に行うことができます。この並列処理能力は、特に大量のデータを扱う作業や、同じ処理を多数のデータポイントに適用するような作業に適しています。
2. **高速なグラフィックス処理**:
	- GPUは画像データの高速処理に特化しており、3Dグラフィックスレンダリング、ビデオエンコーディング、画像処理などのタスクを高速に実行できます。これは、ゲーム、仮想現実（VR）、映画制作などの分野で特に重要です。
3. **汎用性**:
	- 近年、GPUは「汎用計算」（GPGPU: General-Purpose computing on Graphics Processing Units）にも使用されるようになりました。これは、グラフィックス以外の計算作業、特に科学計算や機械学習、ディープラーニングに関連するタスクに応用されています。
4. **CPUとの連携**:
	- GPUはCPUと連携して動作します。CPUが全体的なコンピュータの制御や複雑なタスクを担い、GPUは並列処理が必要な特定のタスクを効率的に処理します。

## メモリ


そもそもメモリとは「Random Access Memory（RAM）」のこと。 **主記憶装置とも呼ばれ、CPUと直接つながっていて、CPUが計算や処理をする場合に、一時的に情報を記憶しておく場所**の事です。 パソコンの心臓部であるCPUと超高速でやり取りしながらデータの処理を行っているのです。


このメモリはデータやプログラムコードの一時的な保存場所として使用され、CPUが直接アクセスしてデータの読み書きを行います


RAMの速度はコンピュータの全体的なパフォーマンスに大きな影響を与え、メモリ容量が多いほど、より多くのプログラムやデータを同時に処理することができます。


現在RAMは半導体製品であることがほとんどで、電源が切れればデータも消える揮発性メモリとなります。


# OS（オペレーティングシステム）


OSは、**ハードウェアとソフトウェアの仲介**をして両方を管理するシステムソフトウェアです。リソース管理、ファイルシステム、セキュリティ、プロセス管理などの重要な機能を提供します。OSがやっていることをざっくりと理解しておきましょう。


ハードウェアとソフトウェアをつなぐ役割。


![os-components.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/b7c80d04-e22f-417f-8da1-4b443ffb4876/5503d078-d343-4bae-9de9-e02c193dbea4/os-components.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240207%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240207T094032Z&X-Amz-Expires=3600&X-Amz-Signature=3119f7e267d94aa785d84346142286b76c61cad8515b080a9695b4491da89bd2&X-Amz-SignedHeaders=host&x-id=GetObject)


![shell-core-layer.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/b7c80d04-e22f-417f-8da1-4b443ffb4876/5eea439f-23c6-467a-95c0-df586d50cc5e/shell-core-layer.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240207%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240207T094033Z&X-Amz-Expires=3600&X-Amz-Signature=42a9308d62516483a21fef2516719cebbd22502715d83c330971382646fff148&X-Amz-SignedHeaders=host&x-id=GetObject)


![Untitled.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/b7c80d04-e22f-417f-8da1-4b443ffb4876/27717d4b-a234-4cde-9df3-0ef0fc0e2e34/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240207%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240207T094033Z&X-Amz-Expires=3600&X-Amz-Signature=1ce3e1bbb8225f8a797214b16d7a2e579e08d0e2ec64c03a8ba03887c7caa1a2&X-Amz-SignedHeaders=host&x-id=GetObject)


![Untitled.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/b7c80d04-e22f-417f-8da1-4b443ffb4876/03663ec6-b134-406d-9f63-4ce1b58c98fa/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240207%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240207T094016Z&X-Amz-Expires=3600&X-Amz-Signature=0bb2c92d231e322e3e46afaf68df95e7e8f15a00c91f5b237bf3d66fc9c72ec6&X-Amz-SignedHeaders=host&x-id=GetObject)


## ファームウェア（BIOS)


コンピュータの電源が入ると、BIOSは最初に実行されるファームウェアです。BIOSはパワーオン・セルフテスト（POST）を行い、ハードウェアが正常に動作しているかをチェックします。


BIOSは主にハードウェアの初期化とブートプロセスの管理に関与し、カーネルはシステムが起動した後の全体的な管理とリソースの調整を行います。


BIOSがシステムの初期化とハードウェアの設定を完了した後、ブートローダーを経由してOSのカーネルに制御を移します。カーネルはその後、OSの残りの部分をロードし、システムの起動を完了します。


![Untitled.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/b7c80d04-e22f-417f-8da1-4b443ffb4876/ec014218-bbc0-4b40-9bc9-b32266622472/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240207%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240207T094016Z&X-Amz-Expires=3600&X-Amz-Signature=2c9246fa77e7070a3be4313125586d08f97288ea32e58c538ed65a0acd12ee62&X-Amz-SignedHeaders=host&x-id=GetObject)


![Untitled.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/b7c80d04-e22f-417f-8da1-4b443ffb4876/233d83a9-19f4-4d0c-a2bb-8ad0a44d38ac/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240207%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240207T094016Z&X-Amz-Expires=3600&X-Amz-Signature=111666c313eed0ab94ff1c08da75edf655704a3e9420f973d481130ac48ecfee&X-Amz-SignedHeaders=host&x-id=GetObject)


![Untitled.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/b7c80d04-e22f-417f-8da1-4b443ffb4876/23043795-48fe-42ca-9c70-fc89757503e1/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240207%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240207T094016Z&X-Amz-Expires=3600&X-Amz-Signature=5042366c4546e4ed76442001962b9b15e006ebcc71c01160d36d8bba6c7f44f9&X-Amz-SignedHeaders=host&x-id=GetObject)


## カーネル


カーネルはOSの根幹を担う機能群のことです。以下の機能があります。

- **ハードウェア管理**：ハードウェアリソース（CPU、メモリ、ディスクストレージ、入出力デバイスなど）の管理と抽象化を行います。
- **プロセス（CPU）管理**：ユーザーが与えた一連のタスク（プロセス）を管理します。開始・終了・処理のスケジューリングなど。
- **メモリ管理**：各プロセスにメモリを割り当てたり、使ってないメモリを最適化したり。
- **システムコール**：カーネルの機能を安全に実行させるためのインターフェースです。

## シェル（CLI）


シェルは、ユーザーがコンピューターと対話するためのインターフェースを提供します。いわゆるコマンドプロンプトやTerminalのことで、ユーザーが命令し易い言語を使って、カーネルに命令を実行させたり、プログラムを実行したりすることができます。


## システム・ソフトウェア


システムソフトウェアは **OS が提供しているプログラム群**です。シェルから呼び出したり、他のプログラムから呼び出したりします。

1. **ファイル管理ツール**：ファイルの作成、編集、削除、コピー、移動などを行うためのプログラム。
2. **システム監視ツール**：システムのパフォーマンス、リソース使用状況、セキュリティイベントなどを監視するためのプログラム。
3. **デバイスドライバ**：ハードウェアデバイスとOS間の通信を可能にするソフトウェア。
4. **ネットワーク管理ツール**：ネットワーク接続や設定を管理するためのプログラム。
5. **セキュリティツール**：ウイルス対策、ファイアウォール、アクセス制御などのセキュリティ関連のプログラム。

# ネットワーク・通信


コンピューターネットワークは、異なるコンピューターシステムやデバイスを接続して通信を可能にします。これには、LAN、WAN、インターネットなどが含まれます。プロトコル（TCP/IP、HTTPなど）やデータ転送技術が基礎となります。


## パケット通信


データを特定のサイズに小分け（128バイト）にして通信をする仕組みです。通信の根幹を支える技術で、より効率よく確実にデータを届けられる仕組みになっています。


![Untitled.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/b7c80d04-e22f-417f-8da1-4b443ffb4876/152a13a9-e97d-44a8-8ab3-4ccc6a0a61a0/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240207%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240207T094016Z&X-Amz-Expires=3600&X-Amz-Signature=9dc84e4d39be34bba05813e64e6931a037e5b33d109a2c9f0765615e864b9e6b&X-Amz-SignedHeaders=host&x-id=GetObject)


パケットは、ヘッダーとボディに分かれています。ヘッダーには、送信元と目的地のアドレス、順序番号、エラーチェック情報などが含まれています。ボディにはデータの本体が入っています。


## ネットワークのレイヤー


TCP/IPモデルはインターネットの基盤となるプロトコルスタックのモデルで、4層からなります。


![Untitled.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/b7c80d04-e22f-417f-8da1-4b443ffb4876/de3d73a1-364e-4b11-b1a5-bf9da4fbd831/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240207%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240207T094016Z&X-Amz-Expires=3600&X-Amz-Signature=c2f39bc257202a8c699a773fa51ee7fc456b020dec6af2279c4e07df8d5afc31&X-Amz-SignedHeaders=host&x-id=GetObject)


| 階層 | TCP/IP プロトコルスタック | プロトコル          |
| -- | ---------------- | -------------- |
| 4  | アプリケーション層        | HTTP OSC       |
| 3  | トランスポート層         | TCP UDP        |
| 2  | インターネット層         | IP port        |
| 1  | ネットワークインターフェース層  | Ethernet, Wifi |


TCP/IPは、IPアドレスを住所として扱ってネットワーク通信をする仕組み全般のことです。現在私達が使っているインターネットのほとんどは、この仕組みを使っています。


## ネットワークプロトコル


デバイス間の通信をするためのルールのことです。データの形式、送受信方法、エラー処理などを定義し、異なるデバイスやシステム間で通信するための規格となります。


以下に代表的なプロトコルを説明します。


### TCP/UDP

- **TCP(Transmission Control Protocol)**: データを損失なく確実に目的地に届けられる通信方法です。確実にデータを届けた確認をするので、信頼性が高いのが特徴です。
- **UDP (User Datagram Protocol)**: データをただ目的地に送り続けるような通信方法です。伝送速度と頻度が高いのが特徴です。

### HTTP**（Hypertext Transfer Protocol）**


よくインターネットでウェブサイトを閲覧するときに使われるプロトコルです。基本的に文字列


ClientがServerにデータをRequestをして、ServerがResponseを返す。というやり取りを行います。


リクエストヘッダーはこのファイルをこの形式で欲しいです、って要求しています。


```yaml
GET /home.html HTTP/1.1
Host: developer.mozilla.org
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:50.0) Gecko/20100101 Firefox/50.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Referer: https://developer.mozilla.org/testpage.html
Connection: keep-alive
Upgrade-Insecure-Requests: 1
If-Modified-Since: Mon, 18 Jul 2016 02:36:04 GMT
If-None-Match: "c561c68d0ba92bbeb8b0fff2a9199f722e3a621a"
Cache-Control: max-age=0
```


そのあと、レスポンスでデータの中身とメタ情報がセットで送られてきます。


```yaml
HTTP/1.x 200 OK
Date: Sat, 16 Nov 1990 00:01:45 GMT
Server: Apache / 1.3.27
Connection: close
Expires: Sat, 16 Nov 2023 00:01:25 GMT
Cache-Control: max-age=3600, public
Content-Type: text/html; charset=UTF-8
Last-Modified: Sat, 28 Nov 2009 03:50:37 GMT
Content-Encoding: gzip

<html><head></head><body>hello world</body></html>
```


### OSC （Open Sound Control）


非常なシンプルなUDPのプロトコルで、音楽関連にはじまり、簡易なデータ通信の実装などに使われます。


メッセージ部分とデータ部分にわかれていて、それぞれ、スラッシュ区切りの文字列と４つの型の配列でデータを構成します。


```text
message(string) arguments(int,float,string,byte[])
/cube/position 1.00 1.00 1.00 
```


これは個人的イメージですが、UDPを取り扱いやすいようにラップしてあげたようなプロトコルだと思っています。


# ソフトウェア設計


## ソフトウェアアーキテクチャ


MVCモデル・イベント駆動・レイヤード・マイクロサービス・リアクティブ


プログラミング


## オブジェクト指向・関数型プログラミングについて


## デザインパターン


GoFパターンってなに？


[bookmark](https://qiita.com/KyoheiOkawa/items/17bbd352671c8e5f1944)


## ウォーターフォール・アジャイル・テスト駆動


[bookmark](https://zenn.dev/nanagi/articles/0e899711611630)


# UI・UXについて


## **ユーザーインターフェース（UI）デザイン**:

- UIは、ユーザーがソフトウェアやデバイスと対話するためのインターフェースの設計を指します。
- これには画面レイアウト、色彩、フォント、ボタン、アイコンなど視覚的要素の配置とデザインが含まれます。
- UIデザインの目標は、使いやすく、直感的で、視覚的に魅力的なインターフェースを作ることです。
- コンピューターサイエンスの文脈では、UIデザインはプログラミングと密接に関連し、フロントエンド開発（HTML、CSS、JavaScriptなど）の知識が重要です。

## **ユーザーエクスペリエンス（UX）デザイン**:

- UXデザインは、製品やサービスを使用する際のユーザーの経験全体に関するものです。
- この分野では、ユーザーリサーチ、ユーザーニーズの理解、ユーザージャーニーマップの作成、プロトタイピング、ユーザビリティテストなどが含まれます。
- UXデザイナーは、使い勝手、アクセシビリティ、効率性を最適化することを目指します。
- コンピューターサイエンスでは、UXデザインはシステム設計やソフトウェア開発プロセスに組み込まれ、ユーザーセントリックなアプローチを取ります。

## **人間とコンピュータの相互作用（Human Computer Interaction）**:

- HCIは、人間とコンピュータシステムの相互作用を研究する分野です。
- この分野は、ユーザーの行動、認知心理学、インタフェースの設計原則に焦点を当てています。
- HCIの研究は、より使いやすく効果的なUI/UXデザインに直接的な影響を与えます。

# 人工知能


## ニューラルネットワーク


## 畳み込み


## 強化学習


# TBW

- セキュリティ
- データベース

    