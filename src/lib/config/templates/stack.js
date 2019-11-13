exports.stackTemplate = (name, images) => {
  return {
    "name": name,
    "hostDir": ".",
    "containerDir": "/project",
    "stages": {
      "build": {
        "images": images
      }
    }
  }
}
