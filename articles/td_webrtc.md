---
title: TouchDesignerでWebRTCを実装する方法 —ビデオ通話とDataChannelの両立—
type: tech
topics: ["TouchDesigner", "WebRTC", "リアルタイム通信"]
emoji: 📹
published: false
---

## はじめに

PYのテクニカルアーティストの与羽です。

この記事では、TouchDesignerでWebRTCを使ってビデオ通話とデータ通信を両立させる方法を紹介します。あまりインターネットにTouchDesignerでWebRTCを実現している例が無かったので、WebRTCの基本からはじめて、TouchDesignerでどう実装すればいいの？という方に向けて、記事を書きました。

この記事では時雨堂さんが無料で提供してくださっている、Ayameというシグナリングサーバーを使った実装例を交えながら解説していきます。


## 1. WebRTCとTouchDesignerの基礎

### 1.1 WebRTCの概要

WebRTC（Web Real-Time Communication）は、ブラウザやアプリ間でプラグインなしにリアルタイム通信ができる技術です。主に次のような機能があります：

- ビデオや音声のストリーミング
- データチャネルを使ったバイナリデータのやり取り
- P2P接続によるサーバー負荷の軽減

WebRTCで通信するには「Signaling」というプロセスが必要で、ICE候補(Interactive Connectivity Establishment)の交換やSDP（Session Description Protocol）のやり取りをします。

このシグナリングサーバーを用意するのがWebRTC学習の最初のハードルです。

今回は、時雨堂さんが無料で提供してくださっているAyameSignalingサーバーをお借りします。
こちらはいくつか制約がありますが、WebRTCの学習や実験には十分な機能を持っています。


### 1.2 TouchDesignerでWebRTCを使う


TouchDesignerでWebRTCを実装するときは、Pythonでコードを書く必要があります。

TouchDesignerには、WebRTCPanelというWebRTCの実装がありますが、専用のサーバーがある前提のもので、使い勝手が悪い。かつコードが複雑で、読み解きづらい。

シグナリングサーバーによって通信の仕様が違うため、自分でシグナリングのコードを書き換えられる方が取り回しがしやすい。

今回は、
・様々なシグナリングサーバーに対応できるように、シンプルなPythonコードの提供
・動画とオーディオの送受信のサンプル
・複数データチャンネルへの対応

を実装したTouchDesignerの解説をしていこうと思います。

## 2. 環境構築

### 2.1 TouchDesignerの準備

WebRTCを使うためのTouchDesigner環境を整えましょう。必要なライブラリやモジュールについて説明します。

### 2.2 Ayameシグナリングサーバーの準備

Ayameは、WebRTCのシグナリングを簡単に行えるオープンソースのサーバーです。手元のPCで動かす方法と、クラウド上で使う方法を紹介します。

## 3. WebRTC接続の実装

### 3.1 シグナリング処理の実装

WebRTCの接続を確立するためのシグナリング処理をPythonで実装してみましょう。WebSocketDATを使ってAyameサーバーと通信し、SDP情報やICE候補を交換する方法を解説します。

まずは、挨拶から始めましょう。以下のコードは、TouchDesignerのWebSocketDATを使ってAyameサーバーに接続し、シグナリングを行う基本的な実装例です。

```python

def onConnect(dat):
	global connectionId
	debug("Connected :", connectionId)

	connectionId = None

	dataAsJSONDict = {
		"type": "register",
		"roomId": "your_room_id_here",  # AyameのルームIDを設定
		"clientId": "your_client_id_here",  # クライアントIDを設定
		"signalingKey": "your_signaling_key_here",  # Ayameのシグナリングキーを設定
	}

	dat.sendText(json.dumps(dataAsJSONDict))
	return

    
```

Registerを送信することで、Ayameサーバーに接続し、ルームに参加します。ここで、`roomId`、`clientId`、`signalingKey`はAyameの設定に合わせて変更してください。

次に、サーバーからのメッセージを受信したときの処理を実装します。以下は、Acceptメッセージを受け取ったときの処理です。

```python
    def OnMessageReceivedAccept(message):
	# Accept Messageのレスポンスはこちら
	# {
	# 	"type": "accept"
	# 	"connectionId": "***"
	# 	"iceServers": [
	# 		{
	# 			"credential": "***"
	# 			"urls": [
	# 				"stun:ayame-labo.shiguredo.app:3478",
	# 				"turn:ayame-labo.shiguredo.app:3478?transport=udp"
	# 				"turn:ayame-labo.shiguredo.app:3478?transport=tcp"
	# 				"turns:ayame-labo.shiguredo.app:5349?transport=tcp"
	# 			]
	# 			"username": "********"
	# 		}
	# 	]
	# 	"isExistClient": false
	# 	"isExistUser": false
	# 	"isInitiator": true
	# }
	print('OnMessageReceivedAccept', message)
	global connectionId
	webrtc = op('webrtc1')

	receivedConnectionId = message.get('connectionId')
	isExistClient = message.get('isExistClient')
	iceServers = message.get('iceServers')[0]

	# ICEの設定を登録
	webrtc.par.stun = iceServers['urls'][0]
	webrtc.par.username = iceServers['username']
	webrtc.par.password = iceServers['credential']
	# transportをUDPに設定
	webrtc.par.turn0server = iceServers['urls'][1]
	webrtc.par.turn1server = iceServers['urls'][2]
	webrtc.par.turn2server = iceServers['urls'][3]

	if isExistClient:
        # クライアントが accept を受け取った際、 isExistClient が true の場合は新しい接続を作成します。
		connectionId = webrtc.openConnection()
		print('create new connection on receive accept', connectionId)
		setTracks("video0", "video")
		setTracks("audio0", "audio")
		setDataChannels("header0")
		setDataChannels("body0")
		webrtc.createOffer(connectionId)
	else:
		# クライアントが accept を受け取った際、 isExistClient が false の場合は answer メッセージを待ちます。
		# 何もしない
		debug('isExistClient is false, waiting for answer')
		pass
```

このコードでは、AyameサーバーからのAcceptメッセージを受け取り、ICEサーバーの設定をTouchDesignerのWebRTCコンポーネントに登録しています。`setTracks`関数でビデオとオーディオのトラックを設定し、`setDataChannels`関数でデータチャンネルを設定します。

次に、Offerを作成して接続を開始します。以下のコードは、Offerを作成し、サーバーに送信する処理です。

```python
def onOffer(webrtcDAT, connectionId, localSdp):
	print('onOffer local', connectionId, localSdp)

	webrtcDAT.setLocalDescription(connectionId, 'offer', localSdp, stereo=False)
	# Send localSdp to signalling server
	data = {
		'type': 'offer',
		'sdp': localSdp
	}
	socket.sendText(json.dumps(data))
	
	return
```

### 3.2 ビデオストリームの送受信

TouchDesignerのカメラ入力やTOP（Texture Operator）からの映像をWebRTCで送信する方法と、受信した映像をTouchDesigner内で表示する方法を紹介します。

ビデオストリームの送受信を設定するには、Trackを作成し、MediaStreamを設定してあげる必要があります。

```python
# ビデオストリームの送受信例
async def create_video_track(pc):
    # カメラ入力を取得
    video_source = pc.createVideoSource("camera")

    # トラックの作成
    video_track = pc.addTrack(video_source)

    @video_track.on("track")
    def on_track(track):
        if track.kind == "video":
            print("Video track added")

    return video_track
```

### 3.3 DataChannelの実装

WebRTCのDataChannelを使ってテキストやバイナリデータを送受信する方法を解説します。TouchDesignerのパラメータ値やイベント情報をリアルタイムに共有する実装例も紹介しますね。

```python
# DataChannelの実装例
async def create_datachannel(pc):
    channel = pc.createDataChannel("touch")
    
    @channel.on("open")
    def on_open():
        print("DataChannel opened")
    
    @channel.on("message")
    def on_message(message):
        if isinstance(message, str):
            # テキストメッセージの処理
            op('text_output').text = message
        else:
            # バイナリデータの処理
            # ...
    
    return channel
```

## 4. モジュール化

### 4.1 WebRTC機能のContainer化

TouchDesignerのContainerを使って、WebRTC機能をモジュール化する方法を紹介します。再利用可能なコンポーネントとして整理することで、プロジェクトの管理が楽になりますよ。

### 4.2 パラメーターインターフェースの設計

使いやすいWebRTCモジュールにするために、適切なパラメーターインターフェースを設計する方法を解説します。

### 5.1 再利用可能なWebRTC Toxの作成

WebRTC機能をToxファイルとしてエクスポートし、他のプロジェクトで再利用する方法を紹介します。

### 5.2 実践的なTox活用テクニック

実際のプロジェクトでToxを効果的に活用するためのテクニックやヒントを共有します。

## 6. トラブルシューティング

### 6.1 接続問題の解決

NAT越えの問題やファイアウォールの設定など、WebRTC接続でよくある問題の解決方法を紹介します。

### 6.2 デバッグ方法

TouchDesignerでのWebRTC実装をデバッグするためのコツを紹介します。

## まとめ

TouchDesignerとWebRTCの組み合わせは、インタラクティブなアプリケーションの可能性を大きく広げてくれます。ビデオ通話とデータ通信を両立させることで、より豊かな表現やコミュニケーションが実現できますね。

この記事で紹介した方法を参考に、ぜひ自分だけのWebRTCアプリケーションを作ってみてください。TouchDesignerの表現力とWebRTCの通信機能を組み合わせれば、きっと面白いものが作れるはずです！

## 参考資料

- [WebRTC公式ドキュメント](https://webrtc.org/)
- [Ayame GitHub](https://github.com/OpenAyame/ayame)
- [TouchDesigner Documentation](https://docs.derivative.ca/)
