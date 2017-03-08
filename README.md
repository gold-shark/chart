## jquery.chart.js ##

> 使用方式

```python
<script src='jquery.js'></script>
<script src='jquery.chart.js'></script>
<script>
  $(function(){
    $('#id').chart(options); 
  });
</script>
```

> 参数列表

- options [object] *参数*
    - global [object] *全局配置*
        - font (type: number; default: 10;) *文本大小*
        - color (type: color; default: 'black';) *颜色*
        - event (type: event; default: 'click';) *事件*
    - grid [object] *网格配置*
        - top (type: number; default: 20;) *上边距*
        - right (type: number; default: 40;) *右边距*
        - bottom (type: number; default: 50;) *下边距*
        - left (type: number; default: 40;) *左边距*
    - scale [object] *刻度*
        - show (type: boolean; default: true;) *是否显示*
        - space (type: number; default: 5;) *刻度与文本的间隙*
        - length (type: number; default: 5;) *刻度的长度*
        - font (type: number; default: global.font;) *文本大小*
        - color (type: color; default: global.color;)*刻度的颜色*
        - textColor (type: color; default: global.color;) *文本的颜色*
        - unitsColor (type: color; default: global.color;) *单位的颜色*
        - x [object] *X轴*
            - show (type: boolean; default: scale.show;) *是否显示*
            - space (type: number; default: scale.space;) *刻度与文本的间隙*
            - length (type: number; default: scale.length;) *刻度的长度*
            - font (type: number; default: scale.font;) *文本大小*
            - color (type: color; default: scale.color;) *刻度的颜色*
            - textColor (type: color; default: scale.textColor;) *文本的颜色*
            - unitsColor (type: color; default: scale.unitsColor;) *单位的颜色*
        - y [object] *Y轴*
            - show (type: boolean; default: scale.show;) *是否显*示*
            - space (type: number; default: scale.space;) *刻度与文本的间隙*
            - length (type: number; default: scale.length;) *刻度的长度*
            - font (type: number; default: scale.font;) *文本大小*
            - color (type: color; default: scale.color;) *刻度的颜色*
            - textColor (type: color; default: scale.textColor;) *文本的颜色*
            - unitsColor (type: color; default: scale.unitsColor;) *单位的颜色*
    - auxiliaryLine [object] *辅助线*
        - show (type: boolean; default: true;) *是否显示*
        - stype (type: enum['dashed','dotted','solid']; default: 'dashed';) *辅助线的样式*
        - color (type: color; default: 'silver';) *辅助线的颜色*
    - legend [object] *图例*
        - show (type: boolean; default: true;) *是否显示*
        - font (type: number; default: global.font;) *文本大小* 
        - color (type: color; default: global.color;) *文本颜色*
        - position (type: enum['bottom', 'top']; default: 'bottom';) *显示位置*
    - toolTip [object] *提示*
        - show (type: boolean; default: true;) *是否显示*
        - font (type: number; default: global.font;) *文本大小*
        - color (type: color; default: 'white';) *文本颜色*
        - lineColor (type: color; default: 'silver';) *基准线的颜色*
        - bgColor (type: color; default: 'rgba(0,0,0,.5)';) *提示框的背景颜色*
    - xAxis [object] *X轴*
        - show (type: boolean; default: true;) *是否显示*
        - color (type: color; default: global.color;) *X轴的颜色*
        - data (type: Array; default: [];) *X轴的数据*
    - yAxis [Array] *Y轴*
        - show (type: boolean; default: true;) *是否显示*
        - color (type: color; default: global.color;) *Y轴的颜色*
        - scaleNumber (type: number; default: 5;) *刻度数*
        - unitSize (type: number; default: 10;) *最小单位大小*
        - zeroScale (type: boolean; default: true;) *是否从零开始*
    - series [Array] *图表数据集*
        - type (type: enum['bar', 'line']; default: 'bar';) *图表类型*
        - name (type: string; default: undefined;) *图表名称*
        - units (type: string; default: '';) *单位*
        - color (type: color; default: 'black';) *图表的颜色*
        - width (type: number; default: 10;) *图表的宽度（type='bar'有效）*
        - data (type: Array; default: undefined;) *图表数据*