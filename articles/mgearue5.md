---
title: mGear 5.0とueGear 1.0で加速するMaya-UE5連携ワークフロー
type: tech
topics: ["maya", "mgear", "ueGear", "UE5", "rigging"]
emoji: ⚙️
published: false
---

## はじめに

こんにちは、PYのテクニカルアーティストの与羽です。

先日、Mayaのオープンソース・オートリグフレームワークの**mGear 5.0**と、待望のUnreal Engine連携ツールである**ueGear 1.0**が正式リリースされました！
これまでのGame Toolsも便利でしたが、今回のアップデートでMayaとUE5のパイプライン連携が劇的に進化しました。

この記事では、新しくなったmGear 5.0のハイライトと、MayaのリグやアニメーションをUE5へスムーズに転送できるueGear 1.0のワークフローについて紹介します。

## 新機能ハイライト


### ueGear 1.0: 真のMaya-UEブリッジ

ueGearは、MayaとUnreal Engineをつなぐための新しいブリッジツールです。
単なるFBXエクスポーターにとどまらず、以下のような強力な機能を持っています。

*   **リグの直接転送**: mGearのリグをFBX経由でUE5へ送るだけでなく、アセットとして管理しやすくします。
*   **Control Rigへの変換**: Mayaのリグ構造を解析し、UE5のControl Rigアセットを自動生成（リビルド）できます。これは画期的です！
*   **アニメーションとカメラの同期**: シーケンサーレベルでのデータのやり取りが容易になりました。

## 前提環境

最新の機能を使うためには、以下の環境が必要です。

*   **Maya**: 2022 〜 2026 (2025以降も安心！)
*   **mGear**: 5.0.0以降
*   **ueGear**: 1.0.0以降 (mGearに同梱されていますが、プラグイン設定が必要です)
*   **Unreal Engine**: 5.3 〜 5.5

## ueGearの使い方

### セットアップ

1.  Maya側: mGearメニューから `ueGear` がロードされていることを確認します。
2.  UE5側: Python Scripting プラグインを有効にし、Project SettingsでPythonのリモート実行を許可しておく必要があります。これによりMayaからUE5を操作できるようになります。

### MayaからUE5へリグを送る

従来のGame Exporterも健在ですが、ueGearを使うとよりインタラクティブに送信できます。

1.  MayaでmGearのリグを選択します。
2.  **mGear** -> **ueGear** -> **Export / Import** メニューを開きます。
3.  `Push Selection` ボタンを押すと、選択したオブジェクトがUE5の現在開いているレベルやコンテンツブラウザに転送されます。

### Control Rigとしてリビルドするためのリグ構築手順

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

:::message
**Tips**: このテンプレートを使用することで、UE5上のマネキンやMetaHumanとのモーション共有も容易になります。
:::

### 目玉機能：Control Rigとしてリビルド

今回の目玉機能と言えるのが、**mGearリグのControl Rig変換**です。
Maya上で組んだガイド情報を元に、UE5上で対応するControl Rigノードを組み上げてくれます。

:::message alert
**重要**: この機能を使用するには、Mayaのリグ構築時に **「EPIC Components」** を使用している必要があります（例：`EPIC_leg_01`, `EPIC_arm_01` など）。
これらのコンポーネントは、リビルド時に必要な変換情報（Control Rigタグなど）を自動的にエンベッドするように設計されています。標準のShifter Componentでは、現時点ではこの自動変換に対応していませんのでご注意ください。
:::

1.  UE5側でSkeletal Meshをインポートしておきます。
2.  MayaのueGearメニューから `Build Control Rig` (※メニュー名はバージョンにより異なる場合がありますが、Build関連の項目) を実行します。
3.  すると、UE5のPythonが走り、Mayaのリグ構造を模したControl Rigアセットが生成されます！

これにより、Mayaでアニメーションを付けるだけでなく、UE5エディタ内で直接アニメーションを微調整したり、プロシージャルな動きをつけたりすることが非常に容易になります。

## 技術トピック: 実装の裏側

テクニカルアーティスト向けに、GitHub上のソースコード構造についても少し触れておきます。


*   **ueGear**: `release/scripts/mgear/uegear` にあります。

### Maya <-> UE5 通信の仕組み
MayaとUE5の通信は、UE5標準の **Python Remote Execution** 機能を利用しています。
`uegear/bridge.py` を確認すると、Python標準の `urllib` を使って、UE5がリッスンしている **30010ポート** (デフォルト) に対してHTTPリクエストを投げていることが分かります。
独自のソケット通信ではなく、UE5標準の仕組みに乗っかっているため、環境構築が比較的容易で、ファイアウォール等の設定も標準機能のそれに準じます。

### Control Rig構築の仕組み (Deep Dive)
Control Rigへの変換ロジックがどこにあるか探してみると、Maya側の `uegear/commands.py` には実装が見当たりません。実は、以下のような連携で実現されています。

1.  **Maya側**: `commands.py` がガイドのルートノードから `MGEAR_UE_CONTROL_RIG_TAG` という属性データを読み取ります。このデータには、コンポーネントの種類やトランスフォーム情報がJSON形式で格納されています。
2.  **Bridge**: `uegear/bridge.py` を介して、Unreal Engineに対して `build_control_rig_from_maya_guide` というコマンドを実行するよう指示を投げます。
3.  **UE5側**: UE5側の実装は **[mgear-dev/ueGear](https://github.com/mgear-dev/ueGear)** リポジトリで管理されています。
    *   `Plugins/ueGear/Content/Python/ueGear/controlrig/components` 配下に、`EPIC_leg_01.py` のようなコンポーネントごとのビルドスクリプトが存在します。
    *   managerがコンポーネント名を判別し、対応するスクリプトをロードしてControl Rigのノードグラフを構築しています。

独自のコンポーネントをControl Rigに対応させたい場合は、UE5側（ueGearプラグイン内）に同様のPythonクラスを追加する必要があることが分かります。

### 付録: mGearコンポーネントとControl Rig変換の対応状況

GitHubリポジトリ（mGear / ueGear）の内容を照らし合わせた、現時点でのControl Rig変換対応表です。
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

※ `EPIC_` が付かない標準コンポーネントは、基本的に自動変換の対象外です。

## その他の強力な機能（Deep Dive）

Control Rig以外の連携機能についても、ソースコードから読み取れる「できること・できないこと」を整理しました。
導入検討時の参考にしてください。

### 1. カメラの同期 (`update_unreal_cameras_from_maya`)

Mayaのカメラを、UE5のCineCameraActorとして同期します。

*   **できること**:
    *   **トランスフォーム**: 移動・回転の同期（アニメーション対応）
    *   **レンズ設定**: 焦点距離 (Focal Length)、絞り (Aperture) の同期（アニメーション対応）
*   **できないこと / 注意点**:
    *   ポストプロセス設定やFocus Distanceなどの詳細なパラメータまでは同期されないようです。あくまで基本的なカメラワークの転送用と考えたほうが良さそうです。

### 2. レイアウトの転送 (`import_layout_from_unreal`)

UE5のレベル上に配置されたアクターを、Mayaに読み込みます。

*   **できること**:
    *   **StaticMeshActor**: UE5上の配置（Transform）を維持したまま、Mayaにインスタンスとして読み込めます。
    *   **Asset Pathの参照**: UE5側のアセットパスを参照し、対応するアセットがMayaプロジェクト内にあればそれを使用します。ない場合はロケーター等で代替されます。
*   **できないこと / 注意点**:
    *   SkeletalMeshやライト、ブループリントアクターなどの完全な再現はサポートされていません。
    *   あくまで「背景レイアウトのアタリをMayaに持ってくる」用途に特化しています。

### 3. シーケンサー連携 (`update_unreal_sequencer_from_maya`)

Mayaのアニメーションを、UE5のシーケンサー上のトラックとして更新します。

*   **できること**:
    *   **既存シーケンスの更新**: UE5上に既に存在するLevel Sequenceを指定して更新します。
    *   **カメラトラック**: カメラのトランスフォーム、Focal Length、Apertureのキーフレームをシーケンサーに流し込みます。
*   **できないこと / 注意点**:
    *   **新規シーケンスの作成**: シーケンスアセットそのものを新規作成する機能は見当たりません。事前にUE5側で空のシーケンスを用意しておく必要があります。
    *   **複雑なトラック構成**: 音声やイベントトラックなど、カメラ/トランスフォーム以外への干渉は限定的です。

## まとめ

mGear 5.0とueGear 1.0の登場により、インディーゲーム開発からハイエンドなバーチャルプロダクションまで、リギングパイプラインの選択肢が大きく広がりました。
特に「Mayaでリグを作り、UE5でControl Rigとして再利用する」というフローは、今後スタンダードになっていくかもしれません。

ぜひ最新版をダウンロードして、次世代のワークフローを体感してみてくださいね！