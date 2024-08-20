import type { SlideTypeItem } from '@/store/slides'
import { ShapePathFormulasKeys } from '@/types/slides'

export const layoutTemplates: SlideTypeItem[] = [
  {
    type: '一部分',
    children: [
      {
        id: 'template', // 只有标题模版 1
        elements: [
          { // 标题区域
            type: 'text',
            id: 'poi900',
            left: 55,
            top: 195.11111111111111,
            width: 885,
            height: 166,
            lineHeight: 1.3,
            content: '<p style=\'text-align: center\'><strong><span style=\'font-size: 120px\'>标题</span></strong></p>',
            rotate: 0,
            defaultFontName: '{{fontName}}',
            defaultColor: '{{fontColor}}',
            wordSpace: 6
          },
        ],
        background: {
          type: 'solid',
          color: '{{backgroundColor}}',
        },
        name: '标题模版'
      },
      {
        id: 'template', // 标题内容模版 2
        elements: [
          { // 标题区域
            type: 'text',
            id: '12qwas',
            left: 100,
            top: 55.11111111111111,
            width: 805,
            height: 116,
            lineHeight: 1.2,
            content: '<p style=\'\'><strong><span style=\'font-size: 70px\'>标题</span></strong></p>',
            rotate: 0,
            defaultFontName: '{{fontName}}',
            defaultColor: '{{fontColor}}',
            wordSpace: 6
          },
          { // 副标题区域
            type: 'text',
            id: '23xzxz',
            left: 105,
            top: 163.25,
            width: 805,
            height: 356,
            content: '<p style=\'height: 356px\'><span style=\'font-size:  34px; color: #0000007f\'>正文</span></p>',
            rotate: 0,
            defaultFontName: '{{fontName}}',
            defaultColor: '{{fontColor}}',
          },
        ],
        background: {
          type: 'solid',
          color: '{{backgroundColor}}',
        },
        name: '内容模版'
      },
      {
        id: 'template', // 标题内容图标 3
        elements: [
          { // 标题区域
            type: 'text',
            id: 'asdcvb',
            left: 75,
            top: 45.11111111111111,
            width: 400,
            height: 100,
            lineHeight: 1.2,
            content: '<p style=\'\'><strong><span style=\'font-size: 65px\'>标题</span></strong></p>',
            rotate: 0,
            defaultFontName: '{{fontName}}',
            defaultColor: '{{fontColor}}',
            wordSpace: 6
          },
          { // 副标题区域
            type: 'text',
            id: 'asfvbn',
            left: 80,
            top: 143.25,
            width: 400,
            height: 356,
            content: '<p><span style=\'font-size:  24px; color: #0000007f\'>正文</span></p>',
            rotate: 0,
            defaultFontName: '{{fontName}}',
            defaultColor: '{{fontColor}}',
          },
          { // 图片
            type: 'image',
            fixedRatio: true,
            src: 'imgs/default_image2.png',
            id: 'aspZs4',
            left: 500,
            top: 30,
            width: 455,
            height: 500,
            rotate: 0
          },
        ],
        background: {
          type: 'solid',
          color: '{{backgroundColor}}',
        },
        name: '图文模版'
      },
      {
        id: 'template', // 表格 4
        elements: [
          { // 标题区域
            type: 'text',
            id: '3edcvb',
            left: 80,
            top: 55.11111111111111,
            width: 850,
            height: 116,
            lineHeight: 1.2,
            content: '<p style=\'\'><strong><span style=\'font-size: 70px\'>标题</span></strong></p>',
            rotate: 0,
            defaultFontName: '{{fontName}}',
            defaultColor: '{{fontColor}}',
            wordSpace: 6
          },
          { //
            type: 'table',
            id: '5tgbnm',
            left: 80,
            top: 165,
            width: 840,
            height: 360,
            rotate: 0,
            cellMinHeight: 65,
            colWidths: [0.25, 0.25, 0.25, 0.25],
            outline: {
              width: 2,
              style: 'solid',
              color: '#eecce1',
            },
            theme: {
              color: '{{themeColor}}',
              rowHeader: true,
              rowFooter: false,
              colHeader: false,
              colFooter: false,
            },
            data: [
              [ // 1
                { 
                  id: '0dius2',
                  colspan: 1,
                  rowspan: 1,
                  text: '',
                  style: {
                    fontname: '{{fontName}}',
                    color: '{{fontColor}}',
                    align: 'center',
                    fontsize: '24'
                  }
                },
                {
                  id: '0dius3',
                  colspan: 1,
                  rowspan: 1,
                  text: '',
                  style: {
                    fontname: '{{fontName}}',
                    color: '{{fontColor}}',
                    align: 'center',
                    fontsize: '24'
                  }
                },
                {
                  id: '0dius4',
                  colspan: 1,
                  rowspan: 1,
                  text: '',
                  style: {
                    fontname: '{{fontName}}',
                    color: '{{fontColor}}',
                    align: 'center',
                    fontsize: '24'
                  }
                },
                {
                  id: '0dius5',
                  colspan: 1,
                  rowspan: 1,
                  text: '',
                  style: {
                    fontname: '{{fontName}}',
                    color: '{{fontColor}}',
                    align: 'center',
                    fontsize: '24'
                  }
                },
              ],
              [ // 2
                {
                  id: '0di2s2',
                  colspan: 1,
                  rowspan: 1,
                  text: '',
                  style: {
                    fontname: '{{fontName}}',
                    color: '{{fontColor}}',
                    align: 'center',
                    fontsize: '24'
                  }
                },
                {
                  id: '0d4us3',
                  colspan: 1,
                  rowspan: 1,
                  text: '',
                  style: {
                    fontname: '{{fontName}}',
                    color: '{{fontColor}}',
                    align: 'center',
                    fontsize: '24'
                  }
                },
                {
                  id: '0d5us4',
                  colspan: 1,
                  rowspan: 1,
                  text: '',
                  style: {
                    fontname: '{{fontName}}',
                    color: '{{fontColor}}',
                    align: 'center',
                    fontsize: '24'
                  }
                },
                {
                  id: '0di6s5',
                  colspan: 1,
                  rowspan: 1,
                  text: '',
                  style: {
                    fontname: '{{fontName}}',
                    color: '{{fontColor}}',
                    align: 'center',
                    fontsize: '24'
                  }
                },
              ],
              [ // 3
                {
                  id: '0di1s2',
                  colspan: 1,
                  rowspan: 1,
                  text: '',
                  style: {
                    fontname: '{{fontName}}',
                    color: '{{fontColor}}',
                    align: 'center',
                    fontsize: '24'
                  }
                },
                {
                  id: '0di1s3',
                  colspan: 1,
                  rowspan: 1,
                  text: '',
                  style: {
                    fontname: '{{fontName}}',
                    color: '{{fontColor}}',
                    align: 'center',
                    fontsize: '24'
                  }
                },
                {
                  id: '0di1s4',
                  colspan: 1,
                  rowspan: 1,
                  text: '',
                  style: {
                    fontname: '{{fontName}}',
                    color: '{{fontColor}}',
                    align: 'center',
                    fontsize: '24'
                  }
                },
                {
                  id: '0di1s5',
                  colspan: 1,
                  rowspan: 1,
                  text: '',
                  style: {
                    fontname: '{{fontName}}',
                    color: '{{fontColor}}',
                    align: 'center',
                    fontsize: '24'
                  }
                },
              ],
              [ // 4
                {
                  id: '0aius2',
                  colspan: 1,
                  rowspan: 1,
                  text: '',
                  style: {
                    fontname: '{{fontName}}',
                    color: '{{fontColor}}',
                    align: 'center',
                    fontsize: '24'
                  }
                },
                {
                  id: '0aius3',
                  colspan: 1,
                  rowspan: 1,
                  text: '',
                  style: {
                    fontname: '{{fontName}}',
                    color: '{{fontColor}}',
                    align: 'center',
                    fontsize: '24'
                  }
                },
                {
                  id: '0aius4',
                  colspan: 1,
                  rowspan: 1,
                  text: '',
                  style: {
                    fontname: '{{fontName}}',
                    color: '{{fontColor}}',
                    align: 'center',
                    fontsize: '24'
                  }
                },
                {
                  id: '0aius5',
                  colspan: 1,
                  rowspan: 1,
                  text: '',
                  style: {
                    fontname: '{{fontName}}',
                    color: '{{fontColor}}',
                    align: 'center',
                    fontsize: '24'
                  }
                },
              ],
              [ // 5
                {
                  id: '0dfus2',
                  colspan: 1,
                  rowspan: 1,
                  text: '',
                  style: {
                    fontname: '{{fontName}}',
                    color: '{{fontColor}}',
                    align: 'center',
                    fontsize: '24'
                  }
                },
                {
                  id: '0dfus3',
                  colspan: 1,
                  rowspan: 1,
                  text: '',
                  style: {
                    fontname: '{{fontName}}',
                    color: '{{fontColor}}',
                    align: 'center',
                    fontsize: '24'
                  }
                },
                {
                  id: '0dfus4',
                  colspan: 1,
                  rowspan: 1,
                  text: '',
                  style: {
                    fontname: '{{fontName}}',
                    color: '{{fontColor}}',
                    align: 'center',
                    fontsize: '24'
                  }
                },
                {
                  id: '0dfus5',
                  colspan: 1,
                  rowspan: 1,
                  text: '',
                  style: {
                    fontname: '{{fontName}}',
                    color: '{{fontColor}}',
                    align: 'center',
                    fontsize: '24'
                  }
                },
              ],
            ],
          },
        ],
        background: {
          type: 'solid',
          color: '{{backgroundColor}}',
        },
        name: '表格模版'
      }
    ]
  },
  {
    type: '二部分',
    children: [
      {
        id: 'template', // 图形 5
        elements: [
          { // 标题区域
            type: 'text',
            id: '3edcvb',
            left: 80,
            top: 55.11111111111111,
            width: 850,
            height: 116,
            lineHeight: 1.2,
            content: '<p style=\'\'><strong><span style=\'font-size: 70px\'>标题</span></strong></p>',
            rotate: 0,
            defaultFontName: '{{fontName}}',
            defaultColor: '{{fontColor}}',
            wordSpace: 6
          },
          { // 正方形
            type: 'shape',
            id: '4rf4bn',
            left: 121.2837658898305,
            top: 227.11296124646893,
            width: 158.7189265536723,
            height: 158.77401129943502,
            viewBox: [200, 200],
            path: 'M 0 0 L 200 0 L 200 200 L 0 200 Z',
            fill: '{{themeColor}}',
            fixedRatio: false,
            rotate: 0
          },
          { // 圆形
            type: 'shape',
            id: '4rf44n',
            left: 440.39111052259886,
            top: 227.29233977754237,
            width: 158.25706214689265,
            height: 158.89830508474577,
            viewBox: [200, 200],
            path: 'M 100 0 A 50 50 0 1 1 100 200 A 50 50 0 1 1 100 0 Z',
            fill: '{{themeColor}}',
            fixedRatio: false,
            rotate: 0,
          },
          { // 三角形
            type: 'shape',
            id: '4r84bn',
            left: 729.7208777590721,
            top: 225.61499251777025,
            width: 158.83239805462026,
            height: 158.45043022820798,
            viewBox: [158.83239805462026, 158.45043022820798],
            path: 'M 79.91619902731013 0 L 0 158.45043022820798 L 158.83239805462026 158.45043022820798 Z',
            fill: '{{themeColor}}',
            fixedRatio: false,
            rotate: 0,
            pathFormula: ShapePathFormulasKeys.TRIANGLE,
            keypoint: 0.5
          },
        ],
        background: {
          type: 'solid',
          color: '{{backgroundColor}}',
        },  
        name: '图形模版'
      },
      {
        id: 'template', // 标题内容 图表 6
        elements: [
          { // 标题区域
            type: 'text',
            id: 'ae6cvb',
            left: 75,
            top: 45.11111111111111,
            width: 400,
            height: 100,
            lineHeight: 1.2,
            content: '<p style=\'\'><strong><span style=\'font-size: 65px\'>标题</span></strong></p>',
            rotate: 0,
            defaultFontName: '{{fontName}}',
            defaultColor: '{{fontColor}}',
            wordSpace: 6
          },
          { // 副标题区域
            type: 'text',
            id: 'aef3bn',
            left: 80,
            top: 143.25,
            width: 400,
            height: 356,
            content: '<p><span style=\'font-size:  24px; color: #0000007f\'>正文</span></p>',
            rotate: 0,
            defaultFontName: '{{fontName}}',
            defaultColor: '{{fontColor}}',
          },
          {
            type: 'chart',
            chartType: 'line',
            id: 'aep1s4',
            left: 475,
            top: 65,
            width: 490,
            height: 450,
            rotate: 0,
            themeColor: ['{{themeColor}}',],
            gridColor: '{{fontColor}}',
            data: {
              labels: ['类别1', '类别2', '类别3', '类别4', '类别5', '类别6'],
              legends: ['系列1'],
              series: [
                [12, 19, 5, 2, 18, 9]
              ]
            },
            options: {
              showLine: true,
              lineSmooth: true,
              showArea: true,
              fullWidth: false,
            }
          },
        ],
        background: {
          type: 'solid',
          color: '{{backgroundColor}}',
        },
        name: '图表模版'
      },
      {
        id: 'template', // 模版一张大图，7
        elements: [
          { // 图片
            type: 'image',
            fixedRatio: true,
            src: 'imgs/default_image1.png',
            id: 'atpZq4',
            left: 35,
            top: 30,
            width: 930,
            height: 500,
            rotate: 0
          },
        ],
        background: {
          type: 'solid',
          color: '{{backgroundColor}}',
        },
        name: '大图模版'
      },
      {
        id: 'template', // 模版三张图片 8
        elements: [
          { // 图片
            type: 'image',
            fixedRatio: true,
            src: 'imgs/default_image3.png',
            id: 'aspZs7',
            left: 35,
            top: 30,
            width: 304,
            height: 500,
            rotate: 0
          },
          { // 图片
            type: 'image',
            fixedRatio: true,
            src: 'imgs/default_image3.png',
            id: 'aspZs8',
            left: 347,
            top: 30,
            width: 304,
            height: 500,
            rotate: 0
          },
          { // 图片
            type: 'image',
            fixedRatio: true,
            src: 'imgs/default_image3.png',
            id: 'aspZs9',
            left: 659,
            top: 30,
            width: 304,
            height: 500,
            rotate: 0
          },
        ],
        background: {
          type: 'solid',
          color: '{{backgroundColor}}',
        },
        name: '多图模版'
      }
    ]
  },
  {
    type: '三部分',
    children: [
      {
        'id': '14xZ8xNGS4',
        'elements': [
          {
            'type': 'text',
            'id': '2',
            'width': 565.4835200000001,
            'height': 158.53125,
            'left': 92.76,
            'top': 119.271,
            'rotate': 0,
            'defaultFontName': 'adonis-web',
            'defaultColor': '#38512f',
            'content': '<div class=\'block v-up content\' _id=\'2\' _idx=\'undefined\' _type=\'obj\' _name=\'Text 1\' style=\'width:646.267px; height:202.933px; z-index: 101;transform: rotate(0deg);\'><div style=\'display: flex;width:646.267px;padding-top: 0px;padding-bottom: -36px;margin-top: 2.75px;margin-bottom: 0px;font-size:0px;font-weight: 100;font-style: normal;\' class=\'slide-prgrph h-left pregraph-inherit _css_1\' ><div style=\'height: 100%;direction: initial;overflow-wrap:break-word;word-wrap: break-word;width:646.267px;\' ><p style=\'text-align: left;\' ><sapn class=\'text-block _css_2\' style=\'font-size:32px;font-family:adonis-web;font-weight:inherit;font-style:inherit;text-decoration:inherit;text-align:left;vertical-align:middle;color: #38512F;direction:ltr;\'>Chanel&nbsp;in&nbsp;china:&nbsp;</sapn></p></div></div><div style=\'display: flex;width:646.267px;padding-top: 0px;padding-bottom: -36px;margin-top: 2.75px;margin-bottom: 0px;font-size:0px;font-weight: 100;font-style: normal;\' class=\'slide-prgrph h-left pregraph-inherit _css_1\' ><div style=\'height: 100%;direction: initial;overflow-wrap:break-word;word-wrap: break-word;width:646.267px;\' ><p style=\'text-align: left;\' ><sapn class=\'text-block _css_2\' style=\'font-size:32px;font-family:adonis-web;font-weight:inherit;font-style:inherit;text-decoration:inherit;text-align:left;vertical-align:middle;color: #38512F;direction:ltr;\'>navigating&nbsp;luxury&nbsp;market&nbsp;dynamics</sapn></p></div></div></div>',
            'lineHeight': 1,
            'fill': '',
            'vertical': false,
            'order': 101
          },
          {
            'type': 'text',
            'id': '5',
            'width': 564.14176,
            'height': 104.3125,
            'left': 93.906,
            'top': 292.135,
            'rotate': 0,
            'defaultFontName': '\'Source Sans Pro\'',
            'defaultColor': '#272525',
            'content': '<div class=\'block v-up content\' _id=\'5\' _idx=\'undefined\' _type=\'obj\' _name=\'Text 2\' style=\'width:644.733px; height:133.533px; z-index: 151;transform: rotate(0deg);\'><div style=\'display: flex;width:644.733px;padding-top: 14px;padding-bottom: -10.5px;margin-top: 2.75px;margin-bottom: 0px;font-size:0px;font-weight: 100;font-style: normal;\' class=\'slide-prgrph h-left pregraph-inherit _css_3\' ><div style=\'height: 100%;direction: initial;overflow-wrap:break-word;word-wrap: break-word;width:644.733px;\' ><p style=\'text-align: left;\' ><sapn class=\'text-block _css_4\' style=\'font-size:12px;font-family:Source Sans Pro;font-weight:inherit;font-style:inherit;text-decoration:inherit;text-align:inherit;vertical-align:middle;color: #272525;direction:ltr;\'>The&nbsp;allure&nbsp;of&nbsp;Chanel\'s&nbsp;journey&nbsp;through&nbsp;the&nbsp;intricate&nbsp;Chinese&nbsp;luxury&nbsp;market&nbsp;is&nbsp;undeniable.&nbsp;As&nbsp;China&nbsp;becomes&nbsp;more&nbsp;receptive&nbsp;to&nbsp;international&nbsp;luxury&nbsp;brands,&nbsp;Chanel\'s&nbsp;adaptability&nbsp;and&nbsp;strategic&nbsp;decisions&nbsp;offer&nbsp;a&nbsp;window&nbsp;</sapn></p></div></div></div>',
            'lineHeight': 1,
            'fill': '',
            'vertical': false,
            'order': 151
          }
        ],
        'background': {
          'type': 'solid',
          'color': '#F6FFF2'
        },
        'remark': 'slide1',
        'name': '文本模版'
      },
      {
        'id': 'KRMnGte6jH',
        'elements': [
          {
            'type': 'text',
            'id': '2-3',
            'width': 604.48864,
            'height': 108.959,
            'left': 57.147,
            'top': 142.712,
            'rotate': 0,
            'defaultFontName': 'adonis-web',
            'defaultColor': '#38512f',
            'content': '<div class=\'block v-up content\' _id=\'3\' _idx=\'undefined\' _type=\'obj\' _name=\'Text 1\' style=\'width:687.133px; height:139.467px; z-index: 85;transform: rotate(0deg);\'><div style=\'display: flex;width:687.133px;padding-top: 0px;padding-bottom: -36px;margin-top: 2.75px;margin-bottom: 0px;font-size:0px;font-weight: 100;font-style: normal;\' class=\'slide-prgrph h-left pregraph-inherit _css_1\' ><div style=\'height: 100%;direction: initial;overflow-wrap:break-word;word-wrap: break-word;width:687.133px;\' ><p style=\'text-align: left;\' ><sapn class=\'text-block _css_2\' style=\'font-size:32px;font-family:adonis-web;font-weight:inherit;font-style:inherit;text-decoration:inherit;text-align:left;vertical-align:middle;color: #38512F;direction:ltr;\'>Chanel&nbsp;in&nbsp;china:&nbsp;navigating&nbsp;luxury&nbsp;market&nbsp;dynamics</sapn></p></div></div></div>',
            'lineHeight': 1,
            'fill': '',
            'vertical': false,
            'order': 85
          },
          {
            'type': 'text',
            'id': '2-4',
            'width': 597.3766400000001,
            'height': 154.584,
            'left': 57.147,
            'top': 269.706,
            'rotate': 0,
            'defaultFontName': '\'Source Sans Pro\'',
            'defaultColor': '#272525',
            'content': '<div class=\'block v-up content\' _id=\'4\' _idx=\'undefined\' _type=\'obj\' _name=\'Text 2\' style=\'width:686.067px; height:197.867px; z-index: 157;transform: rotate(0deg);\'><div style=\'display: flex;width:686.067px;padding-top: 24px;padding-bottom: -18px;margin-top: 2.75px;margin-bottom: 0px;font-size:0px;font-weight: 100;font-style: normal;\' class=\'slide-prgrph h-left pregraph-inherit _css_5\' ><div style=\'height: 100%;direction: initial;overflow-wrap:break-word;word-wrap: break-word;width:686.067px;\' ><p style=\'text-align: left;\' ><sapn class=\'text-block _css_4\' style=\'font-size:12px;font-family:Source Sans Pro;font-weight:inherit;font-style:inherit;text-decoration:inherit;text-align:inherit;vertical-align:middle;color: #272525;direction:ltr;\'>The&nbsp;allure&nbsp;of&nbsp;Chanel\'s&nbsp;journey&nbsp;through&nbsp;the&nbsp;intricate&nbsp;Chinese&nbsp;luxury&nbsp;market&nbsp;is&nbsp;undeniable.&nbsp;As&nbsp;China&nbsp;becomes&nbsp;more&nbsp;receptive&nbsp;to&nbsp;international&nbsp;luxury&nbsp;brands,&nbsp;Chanel\'s&nbsp;adaptability&nbsp;and&nbsp;strategic&nbsp;decisions&nbsp;offer&nbsp;a&nbsp;window&nbsp;into&nbsp;the&nbsp;broader&nbsp;market&nbsp;trends.&nbsp;This&nbsp;presentation&nbsp;delves&nbsp;into&nbsp;the&nbsp;</sapn><sapn class=\'text-block _css_6\' style=\'font-size:12px;font-family:Source Sans Pro;font-weight:inherit;font-style:inherit;text-decoration:inherit;text-align:inherit;vertical-align:middle;color: #3A3630;direction:ltr;\'>challenges&nbsp;</sapn><sapn class=\'text-block _css_4\' style=\'font-size:12px;font-family:Source Sans Pro;font-weight:inherit;font-style:inherit;text-decoration:inherit;text-align:inherit;vertical-align:middle;color: #272525;direction:ltr;\'>and&nbsp;strategies&nbsp;that&nbsp;define&nbsp;Chanel\'s&nbsp;presence&nbsp;in&nbsp;this&nbsp;vibrant&nbsp;market.</sapn></p></div></div></div>',
            'lineHeight': 1,
            'fill': '',
            'vertical': false,
            'order': 157
          }
        ],
        'background': {
          'type': 'solid',
          'color': '#F6FFF2'
        },
        'remark': 'slide2',
        'name': '文本模版2'    
      }
    ]
  }
]