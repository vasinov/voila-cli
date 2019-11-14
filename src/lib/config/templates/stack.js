exports.stackTemplate = (name, images) => {
  return {
    "name": name,
    "stages": {
      "build": {
        "images": images
      },
      "run": {
        "hostDir": ".",
        "containerDir": "/project"
      }
    }
  }
}
