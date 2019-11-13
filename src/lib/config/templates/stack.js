exports.stackTemplate = (name, images) => {
  return {
    "name": name,
    "env": [],
    "hostDir": ".",
    "containerDir": "/project",
    "volumes": [],
    "ports": [],
    "stages": {
      "build": {
        "images": images,
        "env": [],
        "actions": [
          { "execute": "apt-get update" }
        ]
      },
      "run": {
        "command": ""
      }
    }
  }
}
