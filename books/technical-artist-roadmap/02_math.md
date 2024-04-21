---
title: "基礎知識：数学"
emoji: "📐"
published: true
---
    
# 三角関数 


三角関数は、直角三角形⊿の辺と角の関係を計算できる、CGにおいては非常に基本になる数学の単元です。


## **三角関数の定義**


![image.png](/images/books/tar/math_1.png)




上の図は三角関数の基本的な関係を示しています。


シンプルな定義ですが、応用範囲が広く、これから様々な分野で三角関数が使われますので、脳に刻みつけておきましょう。


$$
\sin \theta = \frac{y}{r}\\ \cos \theta = \frac{x}{r}\\ \tan \theta = \frac{sin\theta}{cos\theta}
$$


## 逆三角関数


三角関数が角度と長さから長さを求める関数だとして、逆三角関数は長さから角度を求めるときに使います。


関数電卓やプログラムだと$arcsin$, $arccos$, $arctan$として用意されてたりします。


![image.png](/images/books/tar/math_2.png)




$$
\theta = sin^{-1} x (-1 \leq x \leq 1)= \arcsin x 
$$


$$
\theta = cos^{-1} x (-1 \leq x \leq 1)= \arccos x 
$$


$$
\theta = \tan^{-1} x = \arctan x 
$$


## 弧度法・ラジアン


![image.png](/images/books/tar/math_3.png)




一般的に角度について最初に学ぶ場合、度数法（0～360°）を使った表現をしますが、ラジアン（$rad$）を使う場合も多いです。


ラジアンは主に$\pi$を使って角度を表現する事が多く、$180°=\pi$として、$90° = \frac{\pi}{2}$$\pi$の分数でよく表現します。


# ベクトル


ベクトルは、向きと大きさを持つ数学的な概念で、CGにおいては位置や方向の表現に不可欠です


よく出てくるベクトル操作について 


| 操作               | 説明                            |
| ---------------- | ----------------------------- |
| Dot （内積）         | 写像の長さ（スカラー）をあらわす              |
| Cross (外積)       | 面積と直交するベクトルをあらわす              |
| Normalize （ノルム化） | ベクトルを単位ベクトル（長さノルム１のベクトル）にすること |


![image.png](/images/books/tar/math_4.png)




## 内積（dot）


ベクトル$\vec a$とベクトル$\vec b$の内積は、$\vec b$が$\vec a$に落とす射影の長さになる


$$
\vec a \cdot \vec b = |\vec a||\vec b| \cos \theta
$$


## 外積（cross）


２つのベクトルと直交するベクトルで長さは、２つのベクトルのなす平行四辺形の面積に等しい。


$$
\vec a = \begin{pmatrix} 
 a_x \\ a_y \\ a_z 
\end{pmatrix} \vec b = \begin{pmatrix} 
 b_x \\ b_y \\ b_z 
\end{pmatrix}  のとき、　
\vec a \times \vec b = \begin{pmatrix} 
a_yb_z - a_z b_y \\ a_zb_x - a_xb_z \\ a_xb_y - a_yb_x
\end{pmatrix}
$$


## ノルム化（Normalize）


ベクトルの大きさ１になるように変えること、単位ベクトルにすること。


ベクトル長さを割れば良いので、


$\vec a$の成分$(a_x, a_y, a_z)$とすると、ベクトルの大きさ$|\vec a|$はこのように表される


$$
|\vec a| = \sqrt{a_x^2 + a_y^2 + a_z^2}
$$


このとき、単位ベクトル$\vec{n}$は


$$
\vec{n} = \frac{\vec a}{|\vec a|}
$$


と表される。


## 応用


内積と外積を駆使することによって以下のような、様々なベクトル操作が楽になる。

- ベクトル間の角度
- 点と三角形の内外判定（外積）
- 点と線の距離（内積）
- ２直線の線上最近点（内積）
- 直交ベクトルの算出（外積）
- ポリゴンの裏表判定（外積）

# 行列・Matrix


行列とは数や記号を長方形の配列状に並べたものです。行列は、連立方程式の解法、座標変換、画像処理、機械学習など、様々な問題を解決するために使用されます。3DCGでは行列を主に座標変換に使用します。


行列は以下のように表されます：


$$

\begin{bmatrix}
a_{11} & a_{12} & \cdots & a_{1n} \\
a_{21} & a_{22} & \cdots & a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
a_{m1} & a_{m2} & \cdots & a_{mn}
\end{bmatrix}

$$


## 連立方程式を解く


ここで行列を使って連立方程式を解く簡単な例を考えてみます。


$$
2x + 3y = 4 \\
x - 4y = -9
$$


この連立方程式を行列形式で表すと、以下のようになります：


$$
\begin{bmatrix}
2 & 3 \\
1 & -4
\end{bmatrix}
\begin{bmatrix}
x \\
y
\end{bmatrix} = \begin{bmatrix}
4 \\
-9
\end{bmatrix}
$$


左辺の行列の逆行列はこのように表せられます。逆行列はかけると単位行列になる行列のことです。


$$
\begin{bmatrix}
2 & 3 \\
1 & -4
\end{bmatrix}^{-1} = -\frac{1}{11}
\begin{bmatrix}
-4 & -3 \\
-1 & 2
\end{bmatrix}

$$


この逆行列を両辺にかけると、左辺は単位行列と解のみにできるので、応えが求まります。


$$
\begin{bmatrix}
1&0 \\
0&1
\end{bmatrix}
\begin{bmatrix}
x \\
y
\end{bmatrix}=-\frac{1}{11}
\begin{bmatrix}
-4 & -3 \\
-1 & 2
\end{bmatrix}
\begin{bmatrix}
4 \\
-9
\end{bmatrix} = \begin{bmatrix}
1 \\
-2
\end{bmatrix}
$$


行列の計算は複雑そうに見える問題を機械的に処理する計算用ツールです。これはコンピューターでの処理と相性が良く、人間にとっては少々扱いづらいです。


## アフィン変換・座標変換


CGにおいて、行列は座標変換やその合成を効率的に計算するためのツールです。


例えばモデル変換行列は、一般的な3DCGにおけるTransformはTranslate,Rotation,Scaleの3つのベクトルで表わせ、それらを合成した1つの4x4の行列で表現することができます。


**移動(Translate)を表す行列T**は次の通りです。


$$

T \begin{pmatrix}
x \\ y \\ z
\end{pmatrix} =
\begin{pmatrix}
1 & 0 & 0 & x \\
0 & 1 & 0 & y \\
0 & 0 & 1 & z \\
0 & 0 & 0 & 1
\end{pmatrix}
$$


右に並んでますね。これは、回転や拡縮とはレイヤーを分けてるイメージです。


**3次元空間での**_**x**_**軸、**_**y**_**軸、**_**z**_**軸周りの回転**$\theta$**を表す回転行列R**は、それぞれ次の通りです。（右手座標系）


$$
R_x(\theta) = \begin{pmatrix}1 & 0 & 0 \\0 & \cos \theta & -\sin \theta \\0 & \sin \theta & \cos \theta \end{pmatrix} \\ R_y(\theta) = \begin{pmatrix}\cos \theta & 0 & \sin \theta \\0 & 1 & 0 \\-\sin \theta & 0 & \cos \theta \end{pmatrix} \\ R_z(\theta) = \begin{pmatrix}\cos \theta & -\sin \theta & 0 \\\sin \theta & \cos \theta & 0 \\0 & 0 & 1 \end{pmatrix} \\ 
$$


ただし回転行列はXYZの順番によって行列が変わる点に注意（非可換性）


**x軸、y軸、z軸に沿ってスケーリングする行列S**は次の通りである


$$
S \begin{pmatrix}
x \\ y \\ z
\end{pmatrix} =
\begin{pmatrix}
x & 0 & 0 & 0 \\
0 & y & 0 & 0 \\
0 & 0 & z & 0 \\
0 & 0 & 0 & 1
\end{pmatrix}
$$


**移動・拡縮・回転を合成したTransform行列M**は次のとおりである。


$$
M = T \cdot R \cdot S
$$


以上の操作でできたトランスフォーム行列$M$は他の行列と合成したり、位置や回転を操作したりなど、統合的な操作を行える。これによって複雑な3D空間の座標表現を行うことが出来ます。


# 四元数（クォータニオン）


虚数空間がもつ回転を表す性質を利用して、CGの回転の計算に応用をすると便利な概念です。


回転を４つの数で表すということは、クォータニオンにおいて、回転軸ベクトル$\vec v (x,y,z)$と回転角$w$で以下のように表せられる


$$
q = [\vec v, w] = ( x , y  , x , w)
$$


![image.png](/images/books/tar/math_5.png)




この式をノルム（長さ）が常に１になるようにすると都合がよいので


$$
q = \begin{pmatrix}
x\sin \frac{w}{2} \\
y\sin \frac{w}{2} \\
z\sin \frac{w}{2} \\
\cos w \\
\end{pmatrix}
$$


この回転の表現を、虚数を用いて合成したり色々な操作を簡単な計算でできるようになるのが、クォータニオンです。


## 四元数


クォータニオン${q}$は実数$a,b,c,d$と虚数$i,j,k$を用いて以下の通りあらわされる


$$
i^2 = j^2 = k^2 = ijk = -1 を満たす\\
q = a + bi + cj + dk
$$


クォータニオンに関する定義


$$
\|q\| = \sqrt{a^2+b^2+c^2+d^2} 　（絶対値）\\
\overline q = a - bi - cj - dk　　(\text{共役}) \\
q^{-1} = \frac{\overline q}{\|q\|^2} 　(\text{逆クォータニオン})
$$


これを用いて、ベクトル$\vec a$をクォータニオン$q$で回転させたあとのベクトル$\vec b$は、


$$
\vec b = q \vec a q^{-1}
$$


という定理が成り立つ。シンプル。回転させたいベクトルに逆クォータニオンを掛けてから、クォータニオンを合成すると、ベクトルの変換ができる。


またクォータニオン$p$をクォータニオン$q$で回転させたあとのクオータニオン$r$は


$$
r = qp
$$


と単純な掛け算で計算できる。シンプル。


このあたりは、数式をいじって行く理解をするより、YouTubeなどで動画を見てグラフィカルに理解していくのが理解への早道かと思います。


個人的には複素平面での複素数の合成が回転の性質を表すというところに感動しました。


https://www.youtube.com/watch?v=zjMuIxRvygQ



## 四元数の応用

- SLERP（球面線形補間）
- 任意軸回転
- ジンバルロックの解消

# TBW

- 確率・統計
- フーリエ変換・ラプラス変換
- ラプラス・ガウス・オイラー
- AABB・OBB
- 錐台

    