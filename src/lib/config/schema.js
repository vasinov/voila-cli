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
        apiVersion: { type: 'string' },
        stages: {
          type: 'object',
          properties: {
            build: {
              type: 'object',
              properties: {
                dockerfile: {
                  type: 'string'
                },
                image: {
                  type: 'string',
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
              required: ['image']
            },
            run: {
              type: 'object',
              properties: {
                env: {
                  type: 'array',
                  items: { type: 'string' },
                  uniqueItems: true
                },
                hostPath: {
                  type: "string"
                },
                stackPath: {
                  type: "string"
                },
                volumes: {
                  type: 'array',
                  items: {
                    type: {
                      type: 'object',
                      properties: {
                        hostPath: {
                          type: "string"
                        },
                        stackPath: {
                          type: "string"
                        }
                      },
                      required: ['hostPath', 'stackPath']
                    }
                  },
                  uniqueItems: true
                },
                ports: {
                  type: 'array',
                  items: { type: 'string' },
                  uniqueItems: true
                },
                hardware: {
                  type: 'object',
                  properties: {
                    cpu: {
                      type: 'object',
                      properties: {
                        cores: {
                          type: 'string'
                        },
                        period: {
                          type: 'string'
                        },
                        quota: {
                          type: 'string'
                        }
                      }
                    },
                    memory: {
                      type: 'object',
                      properties: {
                        max: {
                          type: 'string'
                        },
                        swap: {
                          type: 'string'
                        }
                      }
                    }
                  }
                },
                command: {
                  type: 'string'
                }
              },
              required: ['hostPath', 'stackPath']
            }
          },
          required: ['build', 'run']
        }
      },
      required: ['name', 'apiVersion', 'stages']
    }
  },
  required: ['id']
}
