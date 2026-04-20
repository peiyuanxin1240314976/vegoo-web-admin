export type DailyValue = string | number

export type SummaryRow = {
  label: string
  total: DailyValue
  days: DailyValue[]
}

export type MetricRow = {
  label: string
  values: DailyValue[]
}

export type AppBlock = {
  app: string
  platform: string
  allRows: MetricRow[]
  googleRows: MetricRow[]
  alt?: boolean
}

export const panelAppDimensionText = {
  item: '\u9879',
  total: '\u6c47\u603b',
  app: '\u5e94\u7528',
  platform: '\u5e73\u53f0',
  adPlatform: '\u5e7f\u544a\u5e73\u53f0',
  spend: '\u5e7f\u544a\u652f\u51fa',
  calculatedSpend: '\u8ba1\u7b97\u6d88\u8017',
  roi: '\u9996\u65e5ROI',
  commissionSpend: '\u4ee3\u6295\u6d88\u8017',
  estimatedProfit: '\u9884\u4f30\u5229\u6da6',
  minProfit: '\u6700\u4f4e\u5229\u6da6',
  android: '\u5b89\u5353',
  all: '\u5168\u90e8',
  workbook: '\u5e94\u7528\u7ee9\u6548\u8bc4\u4f30',
  sheet: '\u5e94\u7528\u7ef4\u5ea6'
} as const

export const panelAppDimensionDateHeaders = [
  '4\u670818\u65e5',
  '4\u670817\u65e5',
  '4\u670816\u65e5',
  '4\u670815\u65e5',
  '4\u670814\u65e5',
  '4\u670813\u65e5',
  '4\u670812\u65e5'
] as const

export const panelAppDimensionSummaryRows: SummaryRow[] = [
  {
    label: panelAppDimensionText.spend,
    total: '$102429',
    days: ['$5381', '$5474', '$5721', '$5770', '$5126', '$5211', '$5860']
  },
  {
    label: panelAppDimensionText.calculatedSpend,
    total: '$51543',
    days: ['$2623', '$2747', '$2937', '$3109', '$2796', '$2835', '$3148']
  },
  {
    label: panelAppDimensionText.roi,
    total: '39%',
    days: ['38%', '37%', '37%', '39%', '42%', '39%', '39%']
  },
  {
    label: panelAppDimensionText.commissionSpend,
    total: '$0',
    days: ['$0', '$0', '$0', '$0', '$0', '$0', '$0']
  }
]

export const panelAppDimensionAppBlocks: AppBlock[] = [
  {
    app: 'Weather8',
    platform: panelAppDimensionText.android,
    allRows: [
      {
        label: panelAppDimensionText.estimatedProfit,
        values: ['$812', '$631', '$686', '$623', '$820', '$488', '$352']
      },
      {
        label: panelAppDimensionText.minProfit,
        values: ['$989', '$989', '$989', '$989', '$989', '$989', '$989']
      }
    ],
    googleRows: [
      {
        label: panelAppDimensionText.spend,
        values: ['$1686', '$1708', '$1658', '$1766', '$1582', '$1768', '$1918']
      },
      {
        label: panelAppDimensionText.roi,
        values: ['40%', '41%', '40%', '39%', '42%', '39%', '39%']
      }
    ]
  },
  {
    app: 'Weather5',
    platform: panelAppDimensionText.android,
    alt: true,
    allRows: [
      {
        label: panelAppDimensionText.estimatedProfit,
        values: ['$1613', '$1465', '$1287', '$1341', '$1410', '$1317', '$1460']
      },
      {
        label: panelAppDimensionText.minProfit,
        values: ['$1978', '$1978', '$1978', '$1978', '$1978', '$1978', '$1978']
      }
    ],
    googleRows: [
      {
        label: panelAppDimensionText.spend,
        values: ['$911', '$939', '$961', '$933', '$774', '$773', '$839']
      },
      {
        label: panelAppDimensionText.roi,
        values: ['22%', '18%', '19%', '19%', '19%', '17%', '19%']
      }
    ]
  },
  {
    app: 'Weather9',
    platform: panelAppDimensionText.android,
    allRows: [
      {
        label: panelAppDimensionText.estimatedProfit,
        values: ['$83', '-$18', '$192', '$389', '$356', '$241', '$49']
      },
      {
        label: panelAppDimensionText.minProfit,
        values: ['$396', '$396', '$396', '$396', '$396', '$396', '$396']
      }
    ],
    googleRows: [
      {
        label: panelAppDimensionText.spend,
        values: ['$810', '$803', '$798', '$693', '$653', '$622', '$735']
      },
      {
        label: panelAppDimensionText.roi,
        values: ['37%', '34%', '41%', '47%', '47%', '38%', '39%']
      }
    ]
  },
  {
    app: 'Weather11',
    platform: panelAppDimensionText.android,
    alt: true,
    allRows: [
      {
        label: panelAppDimensionText.estimatedProfit,
        values: ['$527', '$483', '$612', '$578', '$590', '$544', '$502']
      },
      {
        label: panelAppDimensionText.minProfit,
        values: ['$688', '$688', '$688', '$688', '$688', '$688', '$688']
      }
    ],
    googleRows: [
      {
        label: panelAppDimensionText.spend,
        values: ['$1202', '$1188', '$1266', '$1193', '$1160', '$1115', '$1096']
      },
      {
        label: panelAppDimensionText.roi,
        values: ['31%', '29%', '33%', '32%', '35%', '34%', '31%']
      }
    ]
  },
  {
    app: 'Weather12',
    platform: panelAppDimensionText.android,
    allRows: [
      {
        label: panelAppDimensionText.estimatedProfit,
        values: ['$932', '$887', '$954', '$901', '$978', '$844', '$816']
      },
      {
        label: panelAppDimensionText.minProfit,
        values: ['$1206', '$1206', '$1206', '$1206', '$1206', '$1206', '$1206']
      }
    ],
    googleRows: [
      {
        label: panelAppDimensionText.spend,
        values: ['$1712', '$1689', '$1741', '$1703', '$1666', '$1608', '$1581']
      },
      {
        label: panelAppDimensionText.roi,
        values: ['43%', '42%', '44%', '41%', '45%', '40%', '39%']
      }
    ]
  },
  {
    app: 'Weather13',
    platform: panelAppDimensionText.android,
    alt: true,
    allRows: [
      {
        label: panelAppDimensionText.estimatedProfit,
        values: ['$241', '$198', '$265', '$289', '$302', '$248', '$211']
      },
      {
        label: panelAppDimensionText.minProfit,
        values: ['$455', '$455', '$455', '$455', '$455', '$455', '$455']
      }
    ],
    googleRows: [
      {
        label: panelAppDimensionText.spend,
        values: ['$764', '$733', '$781', '$745', '$718', '$692', '$701']
      },
      {
        label: panelAppDimensionText.roi,
        values: ['28%', '25%', '31%', '33%', '32%', '29%', '27%']
      }
    ]
  },
  {
    app: 'Weather14',
    platform: panelAppDimensionText.android,
    allRows: [
      {
        label: panelAppDimensionText.estimatedProfit,
        values: ['$1154', '$1099', '$1188', '$1202', '$1235', '$1108', '$1044']
      },
      {
        label: panelAppDimensionText.minProfit,
        values: ['$1368', '$1368', '$1368', '$1368', '$1368', '$1368', '$1368']
      }
    ],
    googleRows: [
      {
        label: panelAppDimensionText.spend,
        values: ['$2106', '$2058', '$2144', '$2120', '$2077', '$1988', '$1940']
      },
      {
        label: panelAppDimensionText.roi,
        values: ['46%', '44%', '48%', '49%', '47%', '45%', '43%']
      }
    ]
  },
  {
    app: 'Weather15',
    platform: panelAppDimensionText.android,
    alt: true,
    allRows: [
      {
        label: panelAppDimensionText.estimatedProfit,
        values: ['$62', '$105', '$84', '$126', '$118', '$96', '$72']
      },
      {
        label: panelAppDimensionText.minProfit,
        values: ['$280', '$280', '$280', '$280', '$280', '$280', '$280']
      }
    ],
    googleRows: [
      {
        label: panelAppDimensionText.spend,
        values: ['$655', '$640', '$671', '$689', '$660', '$634', '$622']
      },
      {
        label: panelAppDimensionText.roi,
        values: ['18%', '21%', '19%', '23%', '22%', '20%', '18%']
      }
    ]
  }
]
