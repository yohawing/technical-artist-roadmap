---
title: mGear 5.0とueGear 1.0で加速するMaya-UE5連携ワークフロー
type: tech
topics: ["maya", "mgear", "ueGear", "UE5", "rigging"]
emoji: ⚙️
published: false
---

## 1. はじめに

こんにちは、PYのテクニカルアーティストの与羽です。

先日、Mayaのオープンソース・オートリグフレームワークの**mGear 5.0**と、待望のUnreal Engine連携ツールである**ueGear 1.0**が正式リリースされました！
これまでのGame Toolsも便利でしたが、今回のアップデートでMayaとUE5のパイプライン連携が劇的に進化しました。

この記事では、新しくなったmGear 5.0のハイライトと、MayaのリグやアニメーションをUE5へスムーズに転送できるueGear 1.0のワークフローについて、その仕組み（Deep Dive）を含めて紹介します。
「Mayaでリグを作り、UE5のControl Rigとして再利用する」という次世代のフローに興味がある方は、ぜひ一緒に試してみましょう。

## 2. 前提環境 / 準備

本記事で紹介する機能を使用するための環境要件です。

*   **Maya**: 2022 〜 2026 (2025以降も安心！)
*   **mGear**: 5.0.0以降
*   **ueGear**: 1.0.0以降 (mGearに同梱されていますが、プラグイン設定が必要です)
*   **Unreal Engine**: 5.3 〜 5.5

## 3. ueGearによる連携ワークフロー

### 3.1. ueGearとは？: 真のMaya-UEブリッジ

ueGearは、MayaとUnreal Engineをつなぐための新しいブリッジツールです。
単なるFBXエクスポーターにとどまらず、双方向通信によってリグやカメラ、レイアウト情報を同期できるのが特徴です。

![予定: ueGearのメニュー画面のキャプチャ](TODO)
*Maya側のueGearメニュー*

### 3.2. セットアップ

まずはツールが通信できるようにセットアップを行います。

1.  **Maya側**: mGearメニューから `ueGear` がロードされていることを確認します。
2.  **UE5側**: Python Scripting プラグインを有効にし、Project SettingsでPythonのリモート実行を許可します。

:::message
ueGearはUE5の「Python Remote Execution」機能を利用して通信を行います。これについては後ほどの技術トピックで解説します。
:::

### 3.3. MayaからUE5へリグを送る

従来のGame Exporterも健在ですが、ueGearを使うとよりインタラクティブに送信できます。

1.  MayaでmGearのリグ（ガイドまたはリグ本体）を選択します。
2.  **mGear** -> **ueGear** -> **Export / Import** メニューを開きます。
3.  `Push Selection` ボタンを押します。
4.  選択したオブジェクトがUE5の現在開いているレベルやコンテンツブラウザに転送されます。

### 3.4. 目玉機能：Control Rigとしてリビルド

今回の最大の見どころ、**mGearリグのControl Rig変換**です。
Maya上で組んだガイド情報を元に、UE5上で対応するControl Rigノードを自動的に組み上げてくれます。

#### 自動変換のためのリグ構築手順

Control Rigへの自動変換を行うには、標準のShifter Componentではなく **EPIC Components** を使用するのが最も確実です。
ゼロから組むよりも、用意されているテンプレートを使用するのが推奨されています。

1.  **テンプレートのロード**:
    *   Mayaメニュー: `mGear` -> `Shifter` -> `Guide Template Samples`
    *   `UE_Mannequin_Template.sgt` (または `Metahuman` 関連) を選択します。
2.  **ガイドの調整**:
    *   ロードされたガイドは、UE5マネキン互換の構造（EPICコンポーネントで構成）になっています。
    *   これを自社のキャラクターに合わせて配置調整します。
3.  **リグのビルド**:
    *   通常通り `Build Rig` を実行します。
    *   生成されたリグには、Control Rig変換に必要なタグ情報が自動的に埋め込まれます。

:::message alert
**重要**: この機能を使用するには、Mayaのリグ構築時に **「EPIC Components」** を使用している必要があります（例：`EPIC_leg_01` など）。
標準のShifter Componentでは、現時点ではこの自動変換に対応していませんのでご注意ください。
:::

4.  **Control Rigの生成**:
    *   UE5側でSkeletal Meshをインポートしておきます。
    *   MayaのueGearメニューから `Build Control Rig` を実行します。
    *   UE5のPythonが走り、Control Rigアセットが生成されます！

![予定: 生成されたControl Rigのノードグラフ](TODO)
*自動生成されたControl Rig。ノードがつながっている様子がわかります。*

#### 付録: mGearコンポーネントとControl Rig変換の対応状況

現時点でのControl Rig変換対応表を作成しました。
Control Rigへの自動変換を行いたい場合は、`ueGear Builder` に対応があるコンポーネント（✅）を使用してください。

| mGear Component (Maya) | ueGear Builder (UE5) | 備考 |
| :--- | :---: | :--- |
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

### 3.5. その他の強力な機能

ueGearには、Control Rig以外にもパイプラインを効率化する便利な機能が備わっています。
ソースコードから読み取れる「できること・できないこと」を整理しました。

#### 1. カメラの同期 (`update_unreal_cameras_from_maya`)

Mayaのカメラを、UE5のCineCameraActorとして同期します。

*   **できること**: トランスフォーム（移動・回転）、焦点距離 (Focal Length)、絞り (Aperture) の同期（アニメーション対応）。
*   **できないこと**: ポストプロセス設定やFocus Distanceなどの詳細パラメータの同期。

#### 2. レイアウトの転送 (`import_layout_from_unreal`)

UE5のレベル上に配置されたアクターを、Mayaに読み込みます。

*   **できること**: StaticMeshActorのインスタンス配置としての読み込み。
*   **できないこと**: SkeletalMeshやライト、BPアクターの完全な再現。あくまで背景レイアウトのアタリ用です。

#### 3. シーケンサー連携 (`update_unreal_sequencer_from_maya`)

Mayaのカメラアニメーションを、UE5のシーケンサー上のトラックとして更新します。

*   **できること**: 既存のLevel Sequenceに対するカメラトラック（Transform/Focal/Aperture）の更新。
*   **できないこと**:
    *   **リグアニメーションの直接転送**: Mayaのリグコントローラーのアニメーションを直接Control Rigトラックにキーフレームとして流し込む機能はありません。
    *   **新規シーケンス作成**: 空のシーケンスをUE5側で用意しておく必要があります。

:::message
リグのアニメーションをUE5に送る場合は、通常通りFBX経由でAnimation Sequenceとしてインポートし、シーケンサーで使用するのが基本フローとなります。
:::

## 4. 技術トピック: 実装の裏側

ここからは少しTech寄りの話、実装の仕組みについて解説します。

### 4.1. Maya <-> UE5 通信の仕組み

MayaとUE5はどうやって通信しているのでしょうか？
独自ソケット？ いいえ、実はUE5標準の機能をうまく活用しています。

`uegear/bridge.py` のソースコードを確認すると、Python標準の `urllib` を使って、UE5がリッスンしている **30010ポート** (デフォルト) に対してHTTPリクエストを投げていることが分かります。
これはUE5の **Python Remote Execution** 機能そのものです。

独自のソケット通信サーバーを立てる必要がなく、ファイアウォール設定などもUE5標準に準拠できるため、非常に賢い設計だと言えます。

### 4.2. Control Rig構築ロジックの所在

「Mayaのガイド情報をどうやってUE5のControl Rigノードに変換しているのか？」
気になってMaya側のソース (`uegear/commands.py`) を探してみましたが、そこにロジックはありませんでした。

実は、以下の連携プレーで実現されています。

1.  **Maya側**: ガイドのルートノードから `MGEAR_UE_CONTROL_RIG_TAG` という属性（JSONデータ）を読み取ります。
2.  **Bridge**: そのJSONデータを引数として、UE5に対して `build_control_rig_from_maya_guide` コマンドを投げます。
3.  **UE5側**: 実際のノード構築は、UE側のプラグイン (**[mgear-dev/ueGear](https://github.com/mgear-dev/ueGear)**) 内にあるPythonスクリプトが担当します。
    *   `Plugins/ueGear/Content/Python/ueGear/controlrig/components` 配下に、`EPIC_leg_01.py` などのビルドスクリプトが存在します。

つまり、もし独自のコンポーネントをControl Rigに対応させたいなら、Maya側ではなく **UE5側のPythonスクリプトを拡張する必要がある** ということです。

## 5. まとめ

mGear 5.0とueGear 1.0によって、MayaとUE5のリギングパイプラインはより密接につながりました。
特に「EPIC Componentsを使ってリグを組み、UE5でControl Rigとして再利用する」というフローは、今後のスタンダードになる可能性を秘めています。

ぜひ最新版をダウンロードして、次世代のワークフローを体感してみてくださいね！

## 6. 参考記事

*   [mGear 公式ドキュメント](https://mgear4.readthedocs.io/en/master/)
*   [mGear GitHub Repository](https://github.com/mgear-dev/mgear)
*   [ueGear GitHub Repository](https://github.com/mgear-dev/ueGear)