ronDev = ronDev.extend({
  /*
   * Config to define Widget Properties
   */
  propertiesConfig: [
    {
      headerTitle: { zh_CN: '自定义参数示例', en_US: 'custom param demo' },
      type: 'customParam',
      accordion: true,
      accordionState: 'close',
      config: [
        {
          label: { zh_CN: '参数 a', en_US: 'param a ' },
          name: 'parama',
          type: 'text',
          value: '',
        },
        {
          label: { zh_CN: '参数 b', en_US: 'param b' },
          name: 'paramb',
          type: 'checkbox',
          value: '',
        },
        {
          name: 'paramc',
          label: { zh_CN: '参数 c', en_US: 'param c' },
          type: 'select',
          options: [
            {
              label: 'hidden',
              value: 'hidden',
              selected: true,
            },
            {
              label: 'show',
              value: 'show',
            },
          ],
        },
        {
          type: 'connectorV2',
          name: 'APIConnector_POST',
          label: 'APIConnector_POST',
          model: 'ViewModel',
          value: 'global_connector_APIConnector',
        },
        {
          type: 'connectorV2',
          name: 'APIConnector_GET',
          label: 'APIConnector_GET',
          model: 'ViewModel',
          value: 'global_connector_APIConnector',
        },
      ],
    },
  ],

  /*
   * Triggered when the user Creates a new widget and used to initialize the widget properties
   */
  create: function (cbk) {
    if (cbk) {
      this._super();
      cbk();
    }
  },
});

Studio.registerWidget(
  'ronDev',
  '',
  {
    hasMultipleItems: false,
    hasAreaSpecificEvents: false,
  },
);
