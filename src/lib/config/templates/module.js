exports.moduleTemplate = (name, images) => {
  return {
    "name": name,
    "env": [],
    "workdir": "/project",
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
