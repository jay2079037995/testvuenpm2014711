import { ChartItem } from 'pptxtojson'
import type { PPTElementShadow } from './slides'

export interface PPTXElementExpand {
    isValidLT: boolean[]
    isValidWH: boolean[]
    expandOrder: number
    groupRotate: number
    expandRotate: number
    groupExpand?: PPTistGroupExpand
}

export interface PPTistLineConnector {
    left: number
    top: number
    width: number
    height: number
    isFlipV: boolean
    isFlipH: boolean
    rotate: number
    name: string
    avLst?: PPTistPrstAvLst[]
    isEmptyAvLst: boolean
    isCxnSp: boolean
    stCxnSize?: PPTistCxnSize
    endCxnSize?: PPTistCxnSize
    shapType: string
    custExist: boolean
    imgFillFlg?: boolean
    grndFillFlg?: boolean
    markerStart?: string
    markerEnd?: string
}

export const enum PPTistTypes {
    TEXT = 'text',
    IMAGE = 'image',
    SHAPE = 'shape',
    LINE = 'line',
    CHART = 'chart',
    TABLE = 'table',
    LATEX = 'latex',
    VIDEO = 'video',
    AUDIO = 'audio',
  }

export interface PPTist {
    type?: 'null' | 'pptx-thumb' | 'slideSize' | 'slide' | 'progress-update' | 'globalCSS' | 'ExecutionTime'
    data?: unknown
    slide_num: number
    file_name?: string
    json: PPTistJson
}

export interface PPTistColor {
    color: [string, string],
    rot: number
}

export interface PPTistSize {
    width: number
    height: number
}

export interface PPTistJson {
    width: number
    height: number
    fill: unknown
    bgFill?: PPTistFill[]
    elements: PPTistElement[]
    notesElements: PPTistElement[]

}

export interface PPTistBGFill{
    type: 'background'
    color?: string
}

export type PPTistFill = PPTistBGFill | PPTistGroupElement | PPTistTextElement | PPTistImageElement | PPTistShapeElement

export type PPTistElement = PPTistDiagramElement | PPTistGroupElement | PPTistTextElement | PPTistImageElement | PPTistShapeElement | PPTistTableElement | PPTistChartElement | PPTistAudioElement | PPTistVideoElement | PPTistVideoLinkElement

/**
 * isUseBgFill "true"，即开启背景填充; false,表示不使用背景填充
 */
interface PPTistBaseElement{
    id: string
    left: number
    top: number
    order: number
    width: number
    height: number
    isUseBgFill: boolean
}

export interface PPTistTextElement extends PPTistBaseElement{
    type:'text'
    fillColor?: string
    svg?: string
    content: string
    rotate: number
    isFlipV: boolean
    isFlipH: boolean
    name: string
    avLst?: PPTistPrstAvLst[]
    isCxnSp: boolean
    stCxnSize: PPTistCxnSize
    endCxnSize: PPTistCxnSize
    shapType?: string
    custExist: boolean
    imgFillFlg?: boolean
    grndFillFlg?: boolean
    path?: string
    borderColor?: string
    borderWidth?: number
    borderType?: string
    borderStrokeDasharray?: string
    isVertical: boolean
    markerStart?: string
    markerEnd?: string
    shadow?: PPTElementShadow
    vAlign: string
    bwMode?: string
    txBox?: string
    lineHeight: number
}

export interface PPTistShapeElement extends PPTistBaseElement{
    type:'shape'
    fillColor?: string
    svg: string
    content: string
    rotate: number
    isFlipV: boolean
    isFlipH: boolean
    name: string
    avLst?: PPTistPrstAvLst[]
    isCxnSp: boolean
    stCxnSize?: PPTistCxnSize
    endCxnSize?: PPTistCxnSize
    shapType?: string
    custExist: boolean
    imgFillFlg?: boolean
    grndFillFlg?: boolean
    path?: string
    borderColor?: string
    borderWidth?: number
    borderType?: string
    borderStrokeDasharray?: string
    isVertical: boolean
    markerStart?: string
    markerEnd?: string
    shadow?: PPTElementShadow
    vAlign: string
    bwMode?: string
    txBox?: string
}

export interface PPTistPrstAvLst {
    adjName?: string
    adjFmla?: string
    adjVal?: number
}

export interface PPTistCxnSize {
    cxnId: string
    left: number
    top: number
    width: number 
    height: number
    sType?: string
}

export interface PPTistGroupElement extends PPTistBaseElement{
    type: 'group'
    elements: PPTistElement[]
    rotate: number
    rotStr?: string
    sType?: string
    isFlipV: boolean
    isFlipH: boolean
    bwMode?: string
    expandData: PPTistGroupExpand
}

export interface PPTistGroupExpand {
    originalLeft: number
    originalTop: number
    originalWidth: number
    originalHeight: number
    chOffLeft: number
    chOffTop: number
    chExtWidth: number
    chExtHeight: number
    ws: number
    hs: number
    fd: number
    cws: number
    chs: number
    fillColor?: string
    borderColor?: string
    borderWidth?: number
    borderType?: string
    borderStrokeDasharray?: string
}

export interface PPTistDiagramElement extends PPTistBaseElement{
    type: 'diagram'
    elements: PPTistElement[]
    childType?: string
    childUniqueId?: string
    count: number
    dspData: PPTistDiagramData
    rotate: number
}

export interface PPTistDiagramData {
    dspId: string
    chTop: number
    chWidth: number
    chHeight: number
    dspLeft: number
    dspTop: number
    dspWidth: number
    dspHeight: number
    dspRotate: number
    dgmBwMode?: string
    ws: number
    hs: number
    ls: number
    ts: number
    fd: number
    dcws: number
    dchs: number
    dcls: number
    dcts: number
}

/**
 * catAxData表示类别轴（通常是X轴），用于展示分类或系列数据
 * valAxData 表示值轴（通常是Y轴），用于展示数值数据
 */
export interface PPTistChartElement extends PPTistBaseElement {
    type: 'chart'
    chartData?: PPTistChart
    autoTitleDeleted?: boolean
    dispBlanksAs?: string
    plotVisOnly?: string
    showDLblsOverMax?: string
    layoutData?: PPTistLayoutData
    spPrData?: PPTistDPtCollect
    catAxData?: PPTistAxData
    valAxData?: PPTistAxData
}

export interface PPTistChart {
    type: string
    chartID: string
    chartType: string
    grouping?: string
    marker?: boolean
    barDir?: string
    holeSize?: string
    firstSliceAng?: number
    style?: string
    varyColors?: string
    gapWidth?: string
    overlap?: string
    serDataList: PPTistChartData[]
    dLbls?: PPTistDLbls
    smooth?: boolean
}

export interface PPTistChartData {
    serSpData?: PPTistDPtCollect
    dataDPtCollects: Array<PPTistDPtCollect>
    dataMat: Array<unknown>
}

export interface PPTistChartItem extends ChartItem {
    expandData?: PPtistChartExpand
    dlblsData?: PPTistDLbls
}

export interface PPtistChartExpand{
    explosion?: boolean
    markerSymbol?: string
    smooth?: boolean
}

export interface PPTistDPtCollect{
    dPtColor?: string
    borderType?: string
    borderColor?: string
    borderWidth?: number
    borderStrokeDasharray?: string
    bubble3D?: boolean
    invertIfNegative?: boolean
}

export interface PPTistLayoutData{
    layoutTarget?: string
    xMode?: string
    yMode?: string
    chartLeft: number
    chartTop: number
    chartW: number
    chartH: number
}

/**
 * showCatName: 表示的是不显示分类（Category）名称，通常对应于X轴的标签
 * showSerName 表示的是不显示系列（Series）名称，这通常对应于Y轴的标签。
 */
export interface PPTistDLbls{
    dlblsDetete?: boolean
    showLegendKey?: boolean
    showVal?: boolean
    showCatName?: boolean
    showSerName?: boolean
    showPercent?: boolean
    showBubbleSize?: boolean
    showLeaderLines?: boolean
    dLblPos?: string
    dptColorData?: PPTistDPtCollect
}

export interface PPTistBorder{
    color?: string,
    width?: number,
    type?: string,
    strokeDasharray: string,
}

/**
 * <c:majorTickMark val="none" /> 设置主要刻度线样式为无；
 * <c:minorTickMark val="none" /> 设置次要刻度线样式为无；
 * <c:tickLblPos val="none" /> 设置刻度标签位置为无
 */
export interface PPTistAxData{
    axId: string
    minOrMax?: string
    maxValue?: string
    minValue?: string
    axDelete?: boolean
    axPos?: string
    formatCode?: string
    sourceLinked?: boolean
    majorTickMark?: string
    minorTickMark?: string
    tickLblPos?: string
    cAxColor?: PPTistDPtCollect
    axAuto?: boolean
    crosses?: string
    lblAlgn?: string
    lblOffset?: number
    noMultiLvlLbl?: boolean
    crossBetween?: string
    majorGridlinesData?: PPTistDPtCollect
}
export interface PPTistTableElement extends PPTistBaseElement {
    type: 'table'
//     outline: PPTElementOutline
//     theme?: TableTheme
    gridColWs: number[] | undefined
    gridRowHs: number[] | undefined
//     cellMinHeight: number
    data: PPTistTableCell[][],
}

export interface PPTistTableCell {
    text: string
    colStyl?: string
    cssName?: string
    colSpan?: number
    rowSpan?: number
    cellFillColor?: string
    colWidth: number
    rowHeight: number
    borderBottom?: PPTistBorder 
    borderTop?: PPTistBorder 
    borderLeft?: PPTistBorder 
    borderRight?: PPTistBorder 
    colFontClrPr?: string 
    colFontWeight?: string 
    colFontName?: string 
    celFillColor2?: string 
    fillColor?: string 
    row_borders?: string 
    fontClrPr?: string 
    fontWeight?: string 
    fontName?: string 
    band_1H_fillColor?: string
    band_2H_fillColor?: string
    isVert?: boolean
}

export interface PPTistVideoElement extends PPTistBaseElement { 
    type: 'video'
    src: string
    autoplay: boolean
    poster?: string
    ext?: string
    descr?: string
    rectShape: PPTistImageShape
    relativeResize?: boolean
    bwMode?: string
    scene3dAndSP3d?: PPTistSceneSP3d
}

export interface PPTistAudioElement extends PPTistBaseElement {
    type: 'audio'
    fixedRatio: boolean
    color: string
    loop: boolean
    autoplay: boolean
    src: string
    ext?: string
    descr?: string
    rectShape: PPTistImageShape
    relativeResize?: boolean
    bwMode?: string
    scene3dAndSP3d?: PPTistSceneSP3d
}

export interface PPTistVideoLinkElement extends PPTistBaseElement{
    type: 'videoLink'
    rotate: number
    mimeType?: string
    src: string
    descr?: string
    rectShape: PPTistImageShape
    relativeResize?: boolean
    bwMode?: string
    scene3dAndSP3d?: PPTistSceneSP3d
}

export interface PPTistImageElement extends PPTistBaseElement {
    type: 'image'
    mineType?: string
    src:string
    rotate: number
    descr?: string
    rectShape: PPTistImageShape
    relativeResize?: boolean
    bwMode?: string
    scene3dAndSP3d?: PPTistSceneSP3d
}

export interface PPTistImageShape {
    rotWithShape?: number
    cstate?: string
    shapType?: string
    custExist: boolean
    isFlipV: boolean
    isFlipH: boolean
    rectLeft?: number
    rectTop?: number
    rectRight?: number
    rectBottom?: number
    path?: string
    borderWidth?: number
    borderType?: string
    strokeDasharray?: string
    borderColor?: string
    alphaModFix?: number
    imageStyle?: string
    picShadow?: PPTElementShadow
    avLst?: PPTistPrstAvLst[]
    noChangeArrowheads?: number
}

export interface PPTistSceneSP3d {
    orthographicFront?: string
    cameraRotLat?: string
    cameraRotLon?: string
    cameraRotRev?: number
    lightRigRig?: string
    lightRigDir?: string
    lightRigRotLat?: string
    lightRigRotLon?: string
    lightRigRotRev?: number
    contourW?: number
    bevelTW?: number
    bevelTH?: number
    contourClr?: string
}