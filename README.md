# linear_game_system
An system that can make a linear running game in javascript

and it's just begin...

#线性游戏

##构成

- 时间轴`timeline.js`
- 随时间轴运动的“路径”`path.js`
- 可控制的“人物”`charater.js`

###时间轴

使用`timestamp`获取开始到现在经过的时间

在运行`running`状态下，不断调用`window.requestAnimationFrame`触发`timeupdate`事件

对于不支持`window.requestAnimationFrame`的浏览器，用`setTimeout`作退化处理，具体见`request_frame.js`

###路径

提供`draw`方法绘画特定位移的路径场景

`addNode`方法为路径加上节点（障碍物）

`checkHit`方法判断节点与人物是否有碰撞

###人物

拥有`speed`属性决定场景的运动速度，单位为像素/毫秒

提供`startSpeedUp`和`speedUp`方法调整速度，`drawHit`、`normal`、`air`等方法调整人物姿势或展示人物状态

---


##整合(demo.js)

使用同一时间轴，实例化一个`TimeLine`

在时间轴的`timeUpdate`事件上绑定以下操作：

- `path`实例的`draw`方法，绘画每次时间更新时的场景。`draw`方法传入的参数是当前路径的位移值（单位为像素），这里使用`s=vt`计算两次时间更新之间经过的位移，加上原来的位移值得到当前的位移并记录作下次计算用

- `path`实例的`addRandomNode`方法，随机插入节点

节点随机插入的机制：

每一类型的node有一个插入的机率(0,1]，用node可能出现的位置数（此处为2，[上, 下]）除以此机率，再用随机数`Math.random()`乘以此数，得到此node应插入的位置，若此位置不在可能出现的位置(此处为[0,1])，则不作插入操作

插入的横座标则由上一次插入的此类型的node的横座标加上最小间隔距离，根据类型可能再加上一段随机的距离

此处已插入的node的存储方式为：两个位置（上、下）各用一组数组记录，每一个node用
```
{
  offset: 位移座标,
  type: 类型
}
```
记录

此处node安排的规则为：确保每隔grid(此处为100)的位置有一个金币node，随机分布上下；在此基础上根据概率插入障碍，两个障碍间最少间隔可操作的距离

所以此处金币的机率设为`1`，间隔为`grid`；障碍物机率设为`0.03`，间隔为`(9 + [0,2]) * grid`

插入障碍物时，先用随机数确定优先插入的位置（上、下），若优先位置已有金币，则插入在另外一侧

问题：机率只决定每次判断是否插入的概率，但可能在两个node之间会有多次插入的操作，所以在下一个node是会插入的期望值跟此机率不一样，应该为`1 - (1 - 单次插入机率) ^ n`，n为两个node之间插入操作的调用次数

###碰撞判断

初期使用canvas实现路径和人物渲染时，把路径和人物分在两个独立的canvas绘画，每次更新场景的时候判断两个canvas有没有同时`alpha`值不为`0`的像素，有则为有碰撞

demo: [http://junewu.work/game/5/demo.html](http://junewu.work/game/5/demo.html)

由于此方法需每次取出两个canvas的`imageData`数据作比对，计算量和内存占用量都非常大，此demo也不需这么精确的碰撞判断，因此改用以下方法判断：

使用人物占有的矩形区域与node的矩形区域简单作是否重叠的判断，但在此demo中此方法得出的碰撞机率太大，于是使用人物矩形区域中心点与node矩形区域的中心点作距离判断，若距离小于人物矩形区域的`(宽 + 高)/4`加上node矩形区域的`(宽 + 高)/4`则视为发生碰撞

###一些优化

因为android 4.4.2下webview中的canvas没有使用硬件加速，使得demo基本不可用，所以把canvas表现的元件全部转为用html dom

逐帧动画本来使用js控制`background-position`实现，但在部分android和iOS设备上会出现闪烁，于是改用css3的`@keyframes`动画实现；原来的`top, left`控制人物、node位置的操作也改为使用`transform: translate3d(x, y, z)`控制

在android、iOS设备上，似乎改变一个元素的`transform`CSS属性会使它的`@keyframes`动画停止，在此demo表现为空中的草泥马翅膀不会动，因此把修改每个node的`transform`改为修改整个的node容器