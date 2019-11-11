exports.schema = {
  id: '/Project',
  type: 'object',
  properties: {
    id: { type: 'string' },
    stacks: {
      type: 'array',
      items: { '$ref': '#/definitions/stack' },
      uniqueItems: true
    }
  },
  definitions: {
    stack: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        env: {
          type: 'array',
          items: { type: 'object' },
          uniqueItems: true
        },
        workdir: {
          oneOf: [
            {
              type: "string"
            },
            {
              type: 'object'
            }
          ]
        },
        volumes: {
          type: 'array',
          items: {
            type: {
              oneOf: [
                {
                  type: "string"
                },
                {
                  type: 'object'
                }
              ]
            }
          },
          uniqueItems: true
        },
        ports: {
          type: 'array',
          items: { type: 'string' },
          uniqueItems: true
        },
        stages: {
          type: 'object',
          properties: {
            build: {
              type: 'object',
              properties: {
                images: {
                  type: 'array',
                  items: { type: 'string' },
                  uniqueItems: true
                },
                env: {
                  type: 'array',
                  items: { type: 'object' },
                  uniqueItems: true
                },
                actions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      execute: {
                        oneOf: [
                          {
                            type: "string"
                          },
                          {
                            type: 'array',
                            items: { type: 'string' },
                            uniqueItems: true
                          }
                        ]
                      }
                    }
                  },
                  uniqueItems: true
                },
              },
              required: ['images']
            },
            run: {
              type: 'object',
              properties: {
                command: { type: 'string' }
              }
            }
          }
        }
      },
      required: ['name', 'workdir']
    }
  },
  required: ['id']
}
