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
        stages: {
          type: 'object',
          properties: {
            build: {
              type: 'object',
              properties: {
                dockerfile: {
                  type: 'string'
                },
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
                      run: {
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
                env: {
                  type: 'array',
                  items: { type: 'object' },
                  uniqueItems: true
                },
                hostDir: {
                  type: "string"
                },
                containerDir: {
                  type: "string"
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
                command: {
                  type: 'string'
                }
              },
              required: ['hostDir', 'containerDir']
            }
          },
          required: ['build', 'run']
        }
      },
      required: ['name', 'stages']
    }
  },
  required: ['id']
}
