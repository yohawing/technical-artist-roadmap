---
title: TouchDesignerでWebRTCを実装する
type: tech
topics: ["TouchDesigner", "WebRTC", "Python"]
emoji: 📹
published: true
---

## はじめに

PYのテクニカルアーティストの与羽です。

この記事では、TouchDesignerでWebRTCを使ってビデオ通話とデータ通信を両立させる方法を紹介します。あまりインターネットにTouchDesignerでWebRTCを実現している例が無かったので、WebRTCの基本からはじめて、TouchDesignerでどう実装すればいいの？という方に向けて、記事を書きました。

![alt text](/images/articles/td_webrtc_0.png)


> この記事では時雨堂さんが無料で提供してくださっている、Ayameというシグナリングサーバーを使った実装例を交えながら解説していきます。


## WebRTCとTouchDesignerの基礎

### WebRTCの概要

WebRTC（Web Real-Time Communication）は、ブラウザやアプリ間でプラグインなしにリアルタイム通信ができる技術です。主に次のような機能があります：

- ビデオや音声のストリーミング
- データチャネルを使ったバイナリデータのやり取り
- P2P接続によるサーバー負荷の軽減

WebRTCで通信するには **「Signaling」** というプロセスが必要で、
- **ICE候補(Interactive Connectivity Establishment Candidate)** :
  ネットワーク上の接続候補を交換するための情報
- **SDP（Session Description Protocol）** :
  メディアの形式やコーデック情報を交換するための情報

これらの情報を交換する必要があります。


Signalingのためには、ハブとなってくれるサーバーが必要です。これを **シグナリングサーバー** と呼びます。シグナリングサーバーは、クライアント同士の接続情報を交換する役割を担います。
このシグナリングサーバーを用意するのがWebRTC学習の最初のハードルです。

今回は、時雨堂さんが無料で提供してくださっている[AyameLabo](https://ayame-labo.shiguredo.app/)サーバーをお借りします。
こちらはいくつか制約がありますが、WebRTCの学習や実験には十分な機能を持っています。


### Signalingの手順

WebRTCの接続を確立するためのシグナリングの手順は以下の通りです。

1. **接続の確立**:
   - クライアントがシグナリングサーバーに接続し、ルームに参加します。
   - ルームIDやクライアントIDを指定して、サーバーにRegisterメッセージを送信します。
2. **SDPとICE候補の交換**:
   - クライアントがSDP（Session Description Protocol）とICE候補を交換します。
   - Offer/Answerモデルに基づいて、SDPを交換し、接続を確立します。
3. **トラックとデータチャンネルの設定**:
   - 動画や音声のトラックを設定し、WebRTCコンポーネントに登録します。
   - データチャンネルを設定し、バイナリデータの送受信を可能にします。
   - 複数のデータチャンネルを使用して、異なる種類のデータを同時に送信できます。

ざっくりとした図ですが、P2P接続の確率のために、このようなやりとりが行われます。

![alt text](/images/articles/td_webrtc_7.png)

### TouchDesignerでWebRTCを使う


TouchDesignerでWebRTCを実装するときは、Pythonでコードを書く必要があります。

TouchDesignerには、WebRTCPanelというWebRTCの実装がありますが、専用のサーバーがある前提のもので、使い勝手が悪い。かつコードが複雑で、読み解きづらいため、
自分でシグナリングのコードを書き換えることができるように、Pythonでシグナリングを実装することをおすすめします。

今回は、
- シグナリングサーバーを自分で実装できるように、シンプルなPythonコードを提供
- 動画とオーディオの送受信のサンプル
- 複数データチャンネルへの対応

を実装を解説していきます。

## WebRTC接続の実装
必要となるのは、この2つのDATです。これからは、この2つのDATのCallbackスクリプトを実装していきます。
すべてのスクリプトは紹介しきれないので、主要なコードを抜粋して紹介します。

![alt text](/images/articles/td_webrtc_2.png)

### シグナリング処理の実装

WebRTCの接続を確立するためのシグナリング処理をPythonで実装してみましょう。WebSocketDATを使ってAyameサーバーと通信し、SDP情報やICE候補を交換する方法を解説します。

まずは、挨拶から始めましょう。以下のコードは、TouchDesignerのWebSocketDATを使ってAyameサーバーに接続し、シグナリングを行う基本的な実装例です。

まずは、シグナリングサーバーのアドレスとポートを設定します。

![alt text](/images/articles/td_webrtc_1.png)

```python:websocket1_callbacks.py
def onConnect(dat):
	"""WebSocketが接続されたときの処理"""
	dataAsJSONDict = {
		"type": "register",
		"roomId": "test_room",  # AyameのルームID
		"clientId": "td_client",  # クライアントID
		"signalingKey": "****"  # Ayameのシグナリングキー
	}
	dat.sendText(json.dumps(dataAsJSONDict))
	return
```

シグナリングサーバーにRegisterを送信すします。Ayameサーバーに接続し、ルームに参加することができます。
次にシグナリングサーバーから返ってくるメッセージを分岐させるために、`onReceiveText`関数を実装します。

```python:websocket1_callbacks.py
def onReceiveText(dat, rowIndex, message):
	"""
	WebSocketからメッセージを受信したときの処理
	シグナリングサーバーから返ってくるメッセージをTypeに応じて処理します。
	"""
	message = json.loads(message)

	signalingType = message.get('type', '')

	if signalingType == 'accept':
		onMessageReceivedAccept(message)

	if signalingType == 'bye':
		onMessageReceivedBye(message)

	if signalingType == 'offer':
		onMessageReceivedOffer(message)

	if signalingType == 'answer':
		onMessageReceivedAnswer(message)

	if signalingType == 'candidate':
		onMessageReceivedCandidate(message)

```

次に、サーバーからのメッセージを受信したときの処理を実装します。以下は、Acceptメッセージを受け取ったときの処理です。

```python:websocket1_callbacks.py
def onMessageReceivedAccept(message):
	"""シグナリングサーバーからAcceptが帰ってきたときの処理"""
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

	# すでに誰かRooomに参加している場合、接続を開始し、Offerを作成します。
	if isExistClient:
		connection_id = webrtc.openConnection()
		# connection_idはあらゆる場所で使うので、保持しておきましょう。
		parent().par.Connectionid = connection_id
		debug("[WebSocket] isExistClient is true, connection_id:", connection_id)

		# 動画・音声トラックとデータチャンネルを設定します。
		setTracks("video0", "video")
		setTracks("audio0", "audio")
		setDataChannels("data0")
		setDataChannels("data1")

		# Offerを作成します。
		webrtc.createOffer(connection_id)
	else:
		# まだ誰も接続していない場合、Offer待機状態にします。
		debug("[WebSocket] isExistClient is false, waiting for answer")
```

このコードでは、AyameサーバーからのAcceptメッセージを受け取り、ICEサーバーの設定をTouchDesignerのWebRTCコンポーネントに登録しています。`setTracks`関数でビデオとオーディオのトラックを設定し、`setDataChannels`関数でデータチャンネルを設定します。

### Offerを作る場合（ルームに誰かいる場合）

WebRTCDATのスクリプトの`onOffer`関数で、Offerを作成して接続を開始します。以下のコードは、Offerを作成し、サーバーに送信する処理です。

```python:webrtc1_callbacks.py
def onOffer(webrtcDAT, connectionId, localSdp):
	"""Offerを作成してサーバーに送信する処理"""

	# 作ったSDPをWebRTCDATに設定します。
	webrtcDAT.setLocalDescription(connectionId, 'offer', localSdp, stereo=False)

	# シグナリングサーバーにOfferを送信します。
	data = {
		'type': 'offer',
		'sdp': localSdp
	}
	op('websocket1').sendText(json.dumps(data))

	return

```

Answerが返ってくるので、RemoteDescriptionをWebRTCDATに登録します。

```python:websocket1_callbacks.py
def onMessageReceivedAnswer(message):
	"""Answerメッセージを受け取ったときの処理"""
	op('webrtc1').setRemoteDescription(
		connection_id,
		'answer',
		message['sdp']
	)
	return
```

### Offerを待つ場合（ルームに誰もいない場合）
次に、Offerを待機して、誰かがサーバーに入ってくるのを待つ場合の処理です。
以下のコードは、Offerメッセージを受け取り、WebRTCコンポーネントに設定する処理です。

```python:websocket1_callbacks.py
def onMessageReceivedOffer(message):
	"""Offerメッセージを受け取ったときの処理"""

	if connection_id is None:
		connection_id = op('webrtc1').openConnection()

		# 届いたRemoteDescriptionをWebRTCDATに登録します
		op('webrtc1').setRemoteDescription(
			connection_id,
			'offer',
			message['sdp']
		)

		# 動画・音声トラックとデータチャンネルを設定します。
		setTracks("video0", "video")
		setTracks("audio0", "audio")
		setDataChannels("data0")
		setDataChannels("data1")

		# Offerを受け取ったので、Answerを作成します。
		op('webrtc1').createAnswer(connection_id)
	else:
		debug("[WebSocket] connection_id is not None, waiting for answer")
	return
```

Answerを返す処理を実装します。
```python:webrtc1_callbacks.py
def onAnswer(webrtcDAT, connectionId, localSdp):
	"""Answerを作成してサーバーに送信する処理"""
	# 作ったSDPをWebRTCDATに設定します。
	op('webrtc1').setLocalDescription(connectionId, 'answer', localSdp, stereo=False)
	data = {
		'type': 'answer',
		'sdp': localSdp
	}
	op('websocket1').sendText(json.dumps(data))
	return
```

### 動画と音声の送受信設定

VideoStreamOut、で動画と音声を同時に送ることができます。
VideoStreamOutのModeにWebRTCを選択し、WebRTCDATを指定してあげると、自動的にトラック名と接続IDが設定されます。

![alt text](/images/articles/td_webrtc_3.png)


受信も同様で、VideoStreamInとAudioStreamInを使います。
こちらも、WebRTCDATを指定してあげるのと、onTrackコールバックを実装する必要があります。

![alt text](/images/articles/td_webrtc_4.png)

OnTrackでは、受信したトラックIDをVideoStreamInやAudioStreamInのパラメータに設定します。

```python:webrtc1_callbacks.py

def onTrack(webrtcDAT, connectionId, trackId, type):
	if type not in ['video', 'audio']:
		raise ValueError(f"Invalid track type: {type}")
		
	if type == 'video':
		op("videostreamin1").par.webrtctrack = trackId
	if type == 'audio':
		op("audiostreamin1").par.webrtctrack = trackId
	return
```


### DataChannelの実装

DataChannelは動画や音声とは違って専用のDATは用意されていないので、Script経由で送信する必要があります。

```python:script1_callbacks.py
def sendDataChannelMessage(channelName, message):
	"""DataChannelにメッセージを送信する関数"""

	if connection_id is None:
		debug("[Script] connection_id is None, cannot send message")
		return

	data = {
		'type': 'data',
		'channel': channelName,
		'message': message
	}
	jsonData = json.dumps(data)
	# WebRTCのDataChannelをつかった文字列の送信
	op('webrtc1').sendText(connection_id, 'data0', jsonData)

	vectorData = [1.0, 2.0, 3.0]  # 送信するベクトルデータの例

	binaryData = bytearray()
	for value in vectorData:
		binaryData.extend(value.to_bytes(4, byteorder='big'))  # floatをバイト列に変換

	# バイナリデータを送信する場合
	op('webrtc1').sendBytes(connection_id, 'data1', binaryData)
	return
```

## Container（TOX) 化

![alt text](/images/articles/td_webrtc_5.png)


ある程度の機能をまとめたContainerを作成すると取り回しが良くなります。
わたしは、このように簡単なUIと動画や音声の入出力ができるようにまとめたTOXを作成しました。

![alt text](/images/articles/td_webrtc_6.png)


## まとめ

TouchDesignerにはWebRTCDATは用意されていますが、シグナリングサーバーが必要だったりして、実装例が少ないと感じていました。

WebRTCはP2Pで低遅延のリアルタイム映像伝送が可能かつ、1:nの配信もサーバー次第では可能な技術なので、扱えるようになればマルチメディア伝送の幅が広がると感じています。
そのハブにTouchDesignerを使うことで、メディアを組み合わせたリアルタイムな仕組みを構築できるようになると思うので、ぜひ試してみてください。

また、この記事を書いていて思い出したのですが、同様の機能を持ったサービスがありますので紹介いたします。
https://livemulti.jp/studio/

## 参考資料

- [WebRTC公式ドキュメント](https://webrtc.org/)
- [Ayame GitHub](https://github.com/OpenAyame/ayame)
- [TouchDesigner Documentation](https://docs.derivative.ca/)
