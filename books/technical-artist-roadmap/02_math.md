---
title: "基礎知識：数学"
---
本記事では、3DCGにおける数学の基本概念を概説します。詳細な説明よりも、重要なポイントの概要を紹介することを目的としています。

# 三角関数
三角関数は、直角三角形⊿の辺と角の関係を計算できる、CGにおいては非常に基本になる数学の単元です。
## 三角関数の定義

![](https://storage.googleapis.com/zenn-user-upload/e28dc79244fa-20231215.png)

上の図は三角関数の基本的な関係を示しています。
シンプルな定義ですが、応用範囲が広く、これから様々な分野で三角関数が使われますので、脳に刻みつけておきましょう。

$$
\sin \theta = \frac{y}{r}\\ \cos \theta = \frac{x}{r}\\ \tan \theta = \frac{sin\theta}{cos\theta}
$$

## 逆三角関数

三角関数が角度と長さから長さを求める関数だとして、逆三角関数は長さから角度を求めるときに使います。
関数電卓やプログラムだと$arcsin$, $arccos$, $arctan$として用意されてたりします。

![](https://storage.googleapis.com/zenn-user-upload/a3dfe0954dc0-20231215.png)


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

![](https://storage.googleapis.com/zenn-user-upload/7879709c2be1-20231215.png)

一般的に角度について最初に学ぶ場合、度数法（0～360°）を使った表現をしますが、ラジアン（$rad$）を使う場合も多いです。

ラジアンは主に$\pi$を使って角度を表現する事が多く、$180°=\pi$として、$90° = \frac{\pi}{2}$みないな$\pi$の分数でよく表現します。

# ベクトル

向きと大きさを扱う分野。CGにおいては、位置や向きを主に取り扱う。

よく出てくるベクトル操作について 

| 操作 | 説明 |
| --- | --- |
| Dot （内積） | 写像の長さ（スカラー）をあらわす |
| Cross (外積) | 面積と直交するベクトルをあらわす |
| Normalize （ノルム化） | ベクトルを単位ベクトル（長さノルム１のベクトル）にすること |

![](https://storage.googleapis.com/zenn-user-upload/b7b0c2ce0b64-20231215.png)

## 内積（dot）

ベクトル$\vec a$とベクトル$\vec b$の内積は、$\vec b$が$\vec a$に落とす射影の長さになる

$$
\vec a \cdot \vec b = |\vec a||\vec b| \cos \theta
$$

内積は二つのベクトル間の角度のコサインに、それらのベクトルの大きさを乗じたものになります

## 外積

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

ノルム化とはベクトルの大きさを１になるように変えること、単位ベクトルにすることです。

ベクトルから長さを割れば良いので、

$\vec a$の成分$(a_x, a_y, a_z)$とすると、ベクトルの大きさ$|\vec a|$はこのように表せれられる。

$$
|\vec a| = \sqrt{a_x^2 + a_y^2 + a_z^2}
$$

このとき、単位ベクトル$\vec{n}$は

$$
\vec{n} = \frac{\vec a}{|\vec a|}
$$

と表せられる。

## ベクトルの応用
内積と外積を駆使することによって以下のような様々なベクトル操作が楽になる。

- ベクトル間の角度
- 点と三角形の内外判定（外積）
- 点と線の距離（内積）
- ２直線の線上最近点（内積）
- 直交ベクトルの算出（外積）
- ポリゴンの裏表判定（外積）

# 行列

基本的な線形代数の計算についてはスキップさせていただいて、CGで使われる行列の基本的な考え方を紹介します。

3DCGにおいての行列とは、位置・回転・スケールとその操作をしたり、座標変換を行うためのものである。例えばモデル変換行列は、一般的な3DCGにおけるTransformはTranslate,Rotation,Scaleの3つのベクトルで表わせ、それらを合成した1つの4x4の行列で表現できる。

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

**3次元空間での*x*軸、*y*軸、*z*軸周りの回転を表す回転行列R**は、それぞれ次の通りである：

$$
R_x(\theta) = \begin{pmatrix}
1 & 0 & 0 \\
0 & \cos \theta & -\sin \theta \\
0 & \sin \theta & \cos \theta
 \end{pmatrix} \\ R_y(\theta) = \begin{pmatrix}
\cos \theta & 0 & \sin \theta \\
0 & 1 & 0 \\
-\sin \theta & 0 & \cos \theta
 \end{pmatrix} \\ R_z(\theta) = \begin{pmatrix}
\cos \theta & -\sin \theta & 0 \\
\sin \theta & \cos \theta & 0 \\
0 & 0 & 1
 \end{pmatrix} \\ 
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

以上の操作でできたトランスフォーム行列Mは他の行列と合成したり、位置や回転を操作したりなど、統合的な操作を行える。これによって複雑な3D空間の座標表現を行うことが出来る。

これらの三次元空間の行列操作に加えて、二次元に落とし込む、プロジェクション変換行列とビュー変換行列によって、三次元空間をディスプレイである二次元に表示させることができる。

線形代数もとい行列は、コンピューターでの計算と相性がよく、AIや物理シュミレーションでもよく出てくるので、概念だけでも把握しておくとよいです。

# 四元数（クオータニオン）

虚数空間がもつ回転を表す性質を利用して、CGの回転の計算に応用をすると便利な概念です。

回転を４つの数で表すということは、クォータニオンにおいて、回転軸ベクトル$\vec v (x,y,z)$と回転量$w$で

![](https://storage.googleapis.com/zenn-user-upload/863b3ac9c1b3-20231216.png)

$$
q = [\vec v, w] = [x,y,z,w]
$$

この式をノルム（長さ）が常に１になるようにすると都合がよいので

$$
q = \begin{pmatrix}
x\sin \frac{w}{2} \\
y\sin \frac{w}{2} \\
z\sin \frac{w}{2} \\
\cos w \\
\end{pmatrix}
$$

この回転の表現を、虚数を用いて合成したり色々な操作を簡単な計算でできるようになるのが、四元数です。

## 四元数の定義

クオータニオン${q}$は実数$a,b,c,d$と虚数$i,j,k$を用いて以下の通りあらわされる

$$
i^2 = j^2 = k^2 = ijk = -1 を満たす\\
q = a + bi + cj + dk
$$

クオータニオンに関する定義

$$
\|q\| = \sqrt{a^2+b^2+c^2+d^2} \\
\overline q = a - bi - cj - dk \\
q^{-1} = \frac{\overline q}{\|q\|^2}
$$

これを用いて、ベクトル$\vec a$をクオータニオン$q$で回転させたあとのベクトル$\vec b$は、

$$
\vec b = q \vec a q^{-1}
$$

またクオータニオン$p$をクオータニオン$q$で回転させたあとのクオータニオン$r$は

$$
r = qp
$$

となる。シンプル。

このあたりは、数式をいじって行く理解をするより、YouTubeなどで動画を見てグラフィカルに理解していくのが理解への早道かと思います。
https://www.youtube.com/watch?v=zjMuIxRvygQ
個人的には複素平面での複素数の合成が回転の性質を表すというところに感動しました。

## 四元数の応用

- SLERP（球面線形補間）回転と回転を補間する関数。
- 任意軸回転
- ジンバルロックの解消

# TBD

- 積分・微分
- 確率・統計
- ラプラス・ガウス・オイラー