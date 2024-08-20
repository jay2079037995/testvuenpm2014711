export const MenuItems = [
  {
    key: 'file',
    text: '文件',
    shortcutKey: 'Ctrl+F',
    children: [
      {
        key: 'new',
        text: '新建',
        shortcutKey: 'Ctrl+N'
      },
      {
        key: 'open',
        text: '打开',
        shortcutKey: 'Ctrl+O'
      },
      {
        key: 'recent',
        text: '最近',
        shortcutKey: 'Ctrl+B',
        children: [
          {
            key: 'new',
            text: '最近打开'
          },
          {
            key: 'open',
            text: 'aa.docx'
          },
          {
            key: 'save',
            text: 'bb.docx'
          }
        ]
      },
      {
        key: 'export',
        text: '导出',
        shortcutKey: 'Ctrl+T',
        children: [
          {
            key: 'export-img',
            text: '导出为图片'
          },
          {
            key: 'export-pdf',
            text: '导出为PDF'
          },
          {
            key: 'save',
            text: '导出为xlsx'
          }
        ]
      },
      {
        key: 'print',
        text: '打印',
        shortcutKey: 'Ctrl+P'
      },
      {
        key: 'print-area',
        text: '打印选中区域',
        shortcutKey: 'Ctrl+Q'
      },
      {
        key: 'save',
        text: '保存',
        shortcutKey: 'Ctrl+S'
      },
      {
        key: 'rename',
        text: '重命名',
        shortcutKey: 'Ctrl+D'
      }
    ]
  },
  {
    key: 'edit',
    text: '编辑',
    shortcutKey: 'Ctrl+E',
    children: [
      {
        key: 'undo',
        text: '撤销',
        shortcutKey: 'Ctrl+U'
      }
    ]
  },
  {
    key: 'view',
    text: '查看',
    shortcutKey: 'Ctrl+V',
    children: [
      {
        key: 'search',
        text: '搜索',
        shortcutKey: 'Ctrl+F'
      }
    ]
  },
  {
    key: 'insert',
    text: '插入',
    shortcutKey: 'Ctrl+V'
  },
  {
    key: 'format',
    text: '格式',
    shortcutKey: 'Ctrl+V'
  },
  {
    key: 'tool',
    text: '工具',
    shortcutKey: 'Ctrl+V'
  },
  {
    key: 'help',
    text: '帮助',
    shortcutKey: 'Ctrl+V'
  },
  {
    key: 'ai',
    text: 'AI创作',
    shortcutKey: 'Ctrl+V'
  },
  {
    key: 'noai',
    text: '去AI化',
    shortcutKey: 'Ctrl+V'
  },
  {
    key: 'check-lang',
    text: '语法检查',
    shortcutKey: 'Ctrl+V'
  },
  {
    key: 'de-weight',
    text: '论文去重',
    shortcutKey: 'Ctrl+V'
  },
  {
    key: 'score',
    text: '论文评分',
    shortcutKey: 'Ctrl+V'
  }
]
