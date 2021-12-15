# ol快速渲染海量数据的方法
本文参考：http://www.suoniao.com/article/5e4dbbe6cf329d4d321c476b

# 方法封装到图层 - CanvasLayer
## 功能
-支持绘制大数据量的点、线、面
-渲染结果不支持单个要素的操作，因为是用canvas绘制的图像
## API
### new CanvasLayer(options)
- options 初始化参数

| Name | Type | description |
| --- | --- | ----|
| map | ol.Map | 地图对象|
| style | ol.style.Style或StyleFunction| 样式对象或者样式函数|


- showData (data) 显示数据

data - Array<ol.Feature>

# 经验
- 线样式，线宽窄时，绘制性能功能，如0.1的线宽比1单位的线宽，绘制更快
- 样式函数的使用，会降低渲染效率

# 渲染性能测试
绘制10W条线（3个点组成的线），不同样式的渲染效率
|线宽|样式类型|效率（ms）| 说明 |
|----|----|----|----|
|0.1|Object|280|简单样式对象|
| 1 | Object | 1283 |简单的样式对象|
|0.1 | Function | 393 |把简单的样式对象由函数给出|