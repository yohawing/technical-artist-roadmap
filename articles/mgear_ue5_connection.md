---
title: mGearでUE5とMayaのリグ連携ワークフロー
type: tech
topics: ["maya", "mgear", "ueGear", "UE5", "rigging"]
emoji: ⚙️
published: true
---

## はじめに

こんにちは、PYのテクニカルアーティストの与羽です。

![mGearとueGearのロゴ](/images/articles/uegear01.png)

先日、Mayaのオープンソース・オートリグフレームワークである**mGear**と、待望のUnreal Engine連携ツール**ueGear**が正式リリースされました！
これまでのGame Toolsも便利でしたが、今回のアップデートでMayaとUE5のパイプライン連携が劇的に進化しています。

この記事では、新しくなったmGearのハイライトと、MayaのリグやアニメーションをUE5へスムーズに転送できるueGearのワークフローについて、その仕組みを含めて紹介します。
「Mayaでリグを作り、UE5のControl Rigとして再利用する」という次世代のフローに興味がある方は、ぜひ一緒に試してみましょう。

## 前提環境

本記事で紹介する機能を使用するための環境要件です。

- Maya: 2025〜2026（2024以前はPyMELが必要）
- mGear: 5.1以降（バグ修正が頻繁に行われているため、なるべく最新版を推奨）
- ueGear: 1.0.0以降（mGearに同梱されていますが、プラグイン設定が必要）
- Unreal Engine: 5.3〜5.5

## mGear/ueGearとは？

mGearはMaya用のオープンソース・オートリグフレームワークで、キャラクターリグの構築やアニメーション制作を効率化するためのツールセットです。

ueGearはそのmGearの拡張機能として提供されるUnreal Engine 5向けのプラグインで、MayaとUE5間のデータ転送やリグの再構築をサポートします。mGearと連携することで、Mayaで作ったリグをUE5のControl Rigとして再構築できる点が最大の魅力です。

## ueGearによる連携ワークフロー

### 目玉機能：Control Rigとしてリビルド

今回の最大の見どころは、**mGearリグのControl Rig変換**です。
Maya上で組んだリグの情報を元に、UE5上で対応するControl Rigノードを自動的に組み上げてくれます。

### 自動変換のためのリグ構築手順

Control Rigへの自動変換を行うには、標準のShifter Componentではなく**EPIC Components**を使用する必要があります。
EPIC Componentsは、mGearに同梱されているUE5向けのコンポーネント群で、UE5のControl Rigに対応した構造を持っています。

![EPIC Componentsの一覧](/images/articles/uegear02.png)

:::message
GuideManagerにもEPIC Componentsが登録されていますが、現状手動でリグを組むとUEでビルドできないケースがあります。確実に動作させるには、**テンプレートからガイドをロードする方法**をお勧めします。
:::

![テンプレート選択画面](/images/articles/uegear03.png)

### 手順1：テンプレートのロード

Mayaメニューから `mGear` → `Shifter` → `Guide Template Samples` を開きます。
`UE_Mannequin_Template.sgt`（またはMetahuman関連のテンプレート）を選択してください。

### 手順2：ガイドの調整

ロードされたガイドは、UE5マネキン互換の構造（EPIC Componentsで構成）になっています。
これをリグを入れたいキャラクターに合わせて配置調整します。

### 手順3：リグのビルド

guideのSettingで**Collect Data on External Files**オプションを有効にします。
このオプションにより、Control Rig変換に必要なリグ情報（.gnxファイル）が保存されます。

![Collect Data on External Filesオプションの設定](/images/articles/uegear04.png)

通常通り`Build Rig`を実行します。
指定したディレクトリに.gnxファイルが生成されていることを確認してください。このファイルにはリグの構造情報がすべて格納されています。

### 手順4：スキニング作業

通常通りスキニング作業を行います。

:::message
mGearのDataCentricRiggingに基づき、すべてスクリプトで自動化できるよう、ウェイト情報を保存しながらスキニングすることをお勧めします。
:::

### 手順5：UE5へのエクスポート

Shifter FBX Exportを使用して、リグをFBX形式でエクスポートします。
**Enable UnrealEngine Import**機能を利用することで、UE5のアセットを直接更新することができます。

![UE5へのエクスポート設定画面](/images/articles/uegear05.png)

この機能はUE5のCommandPortに接続し、FBXインポートを自動化する仕組みです。UE5内にあるSkeletonアセットを指定して更新できます。

### 手順6：UE5でControl Rigのビルド

UE5側で**Generate ueGear Rig**ウィンドウを開きます。
生成データの設定と、先程生成された.gnxファイルを指定します。

![Generate ueGear Rigウィンドウ](/images/articles/uegear06.png)

生成されたリグを確認すると、Mayaで組んだリグがControl Rigノードとして再現されていることがわかります。

![生成されたControl Rigのノードグラフ](/images/articles/uegear07.png)

## 技術的な裏側：コンポーネント対応状況

調べてみると、すべてのEPIC ComponentsがControl Rigに対応しているわけではありません。
現時点でのControl Rig変換対応表を作成しました。

Control Rigへの自動変換を行いたい場合は、`ueGear Builder`に対応があるコンポーネント（✅）を使用してください。

| mGear Component (Maya) | ueGear Builder (UE5) | 備考 |
| :--- | :---: | :--- |
| `control_01` | - | control_01は非対応でエラーが発生 |
| `EPIC_arm_01` | ✅ | |
| `EPIC_arm_02` | ✅ | |
| `EPIC_chain_01` | ✅ | |
| `EPIC_chain_IK_FK_01` | - | |
| `EPIC_control_01` | ✅ | |
| `EPIC_foot_01` | ✅ | |
| `EPIC_hydraulic_01` | - | |
| `EPIC_layered_control_01` | - | |
| `EPIC_leg_01` | ✅ | |
| `EPIC_leg_02` | ✅ | |
| `EPIC_leg_3jnt_01` | ✅ | |
| `EPIC_mannequin_arm_01` | - | |
| `EPIC_mannequin_leg_01` | - | |
| `EPIC_meta_01` | ✅ | |
| `EPIC_neck_01` | ✅ | |
| `EPIC_neck_02` | ✅ | |
| `EPIC_shoulder_01` | ✅ | |
| `EPIC_spine_01` | ✅ | |
| `EPIC_spine_02` | ✅ | |
| `EPIC_spine_cartoon_01` | - | |

:::message alert
最初は`control_01`を使用していたため、UE5でリグを生成する際にエラーが発生しました。control_01を使わないようにリグを組み直したところ、無事にControl Rigとして生成できました。
:::

## まとめ

mGear 5とueGearによって、MayaとUE5のリギングパイプラインはより密接につながりました。
特に「EPIC Componentsを使ってリグを組み、UE5でControl Rigとして再利用する」というフローは、今後のスタンダードになる可能性を秘めています。

ぜひ最新版をダウンロードして、次世代のワークフローを体感してみてください！

## 参考記事

- [mGear 公式ドキュメント](https://mgear4.readthedocs.io/en/master/) - mGearの機能や使い方の詳細
- [mGear GitHub Repository](https://github.com/mgear-dev/mgear) - mGear本体のソースコード
- [ueGear GitHub Repository](https://github.com/mgear-dev/ueGear) - ueGearプラグインのソースコード
