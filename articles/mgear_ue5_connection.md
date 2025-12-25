---
title: mGearでUE5とリグ連携ワークフロー
type: tech
topics: ["maya", "mgear", "ueGear", "UE5", "rigging"]
emoji: ⚙️
published: true
---

## はじめに

こんにちは、PYのテクニカルアーティストの与羽です。

![alt text](/images/articles/uegear01.png)

先日、Mayaのオープンソース・オートリグフレームワークの**mGear**と、待望のUnreal Engine連携ツールである**ueGear**が正式リリースされました！
これまでのGame Toolsも便利でしたが、今回のアップデートでMayaとUE5のパイプライン連携が劇的に進化しました。

この記事では、新しくなったmGearのハイライトと、MayaのリグやアニメーションをUE5へスムーズに転送できるueGearのワークフローについて、その仕組みを含めて紹介します。
「Mayaでリグを作り、UE5のControl Rigとして再利用する」という次世代のフローに興味がある方は、ぜひ一緒に試してみましょう。

## 前提環境 / 準備

本記事で紹介する機能を使用するための環境要件です。

-   Maya: 2025 〜 2026
-   mGear: 5.0.0以降
-   ueGear: 1.0.0以降 (mGearに同梱されていますが、プラグイン設定が必要です)
-   Unreal Engine: 5.3 〜 5.5

## ueGearによる連携ワークフロー

### mGear/ueGearとは？

mGearはMaya用のオープンソース・オートリグフレームワークで、キャラクターリグの構築やアニメーション制作を効率化するためのツールセットです。
ueGearはそのmGearの拡張機能として提供されるUnreal Engine 5向けのプラグインで、MayaとUE5間のデータ転送やリグの再構築をサポートします。
mGearと連携してMayaで作ったリグをUE5で再構築できる機能が本命で、これが実現できると


### 目玉機能：Control Rigとしてリビルド

今回の最大の見どころ、**mGearリグのControl Rig変換**です。
Maya上で組んだリグの情報を元に、UE5上で対応するControl Rigノードを自動的に組み上げてくれます。

#### 自動変換のためのリグ構築手順

Control Rigへの自動変換を行うには、標準のShifter Componentではなく **EPIC Components** を使用する必要があります。
Epic Componentsは、mGearに同梱されているUE5向けのコンポーネント群で、UE5のControl Rigに対応した構造を持っています。

![alt text](/images/articles/uegear02.png)

GuideManagerにもEPIC Componentsが登録されているのですが、現状手動リグだとうまくUEでビルドできないケースがあるため、**テンプレートからガイドをロードする方法**をお勧めします。

![alt text](/images/articles/uegear03.png)

#### 1.  テンプレートのロード:
 Mayaメニュー: `mGear` -> `Shifter` -> `Guide Template Samples`
 `UE_Mannequin_Template.sgt` (または `Metahuman` 関連) を選択します。
    
#### 2.  ガイドの調整:
 ロードされたガイドは、UE5マネキン互換の構造（EPICコンポーネントで構成）になっています。
 これをリグを入れたいキャラクターに合わせて配置調整します。

#### 3.  リグのビルド:
 guideのSettingでCollect Data on External Filesオプションを有効にします。こちらでControl Rig変換に必要なリグ情報(.gnx)が保存されます。
![alt text](/images/articles/uegear04.png)
   通常通り `Build Rig` を実行します。
   指定したディレクトリに.gnxファイルが生成されていることを確認してください。こちらは、リグの情報がすべて入っているようなものになります。
#### 4.  通常通りスキニング作業を行います。
mGearのDataCentricRiggingに基づきすべてスクリプトで自動化できるように、ウェイト情報を保存しながらスキニングをすることをお勧めします。


#### ５．UE5へのエクスポート

Shifter FBX Exportを使用して、リグをFBX形式でエクスポートします。
Enable UnrealEngine Import機能を利用して、UE5のアセットを直接更新することができます。

![UE5へのエクスポート手順](/images/articles/uegear05.png)

これはUE5にCommandPortによって接続し、FBXインポートを自動化する機能のようです。UE5内にあるSkeletonのアセットを指定することができます。


#### 6. UE5でコントロールリグのビルド

Generate ueGear Rigのウィンドウを開きます。 生成データの設定と、先程生成された。.gnxファイルを指定します。

![Generate ueGear Rig](/images/articles/uegear06.png)

生成されたリグを確認すると、Mayaで組んだリグがControl Rigノードとして再現されていることがわかります。

![alt text](/images/articles/uegear07.png)

#### 付録: mGearコンポーネントとControl Rig変換の対応状況

どうやら調べてみると、すべてのEPICコンポーネントがControl Rigに対応しているわけではないようです。

現時点でのControl Rig変換対応表を作成しました。
Control Rigへの自動変換を行いたい場合は、`ueGear Builder` に対応があるコンポーネント（✅）を使用してください。

| mGear Component (Maya) | ueGear Builder (UE5) | 備考 |
| :--- | :---: | :--- |
| `control_01` | - |  control_01に対応せずにエラー出ている |
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


最初は、control_01が非対応だったので、UE5でリグを生成する際にエラーが出てしまいました。
手元でControl_01を使わないようにリグを組み直したところ、無事にControl Rigとして生成できました。

## まとめ

mGear5とueGearによって、MayaとUE5のリギングパイプラインはより密接につながりました。
特に「EPIC Componentsを使ってリグを組み、UE5でControl Rigとして再利用する」というフローは、今後のスタンダードになる可能性を秘めています。

ぜひ最新版をダウンロードして、次世代のワークフローを体感してみてくださいね！

## 参考記事

-   [mGear 公式ドキュメント](https://mgear4.readthedocs.io/en/master/)
-   [mGear GitHub Repository](https://github.com/mgear-dev/mgear)
-   [ueGear GitHub Repository](https://github.com/mgear-dev/ueGear)