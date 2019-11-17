exports.stackTemplate = (name, hostDir, images) => {
  return {
    "name": name,
    "apiVersion": "1",
    "stages": {
      "build": {
        "images": images
      },
      "run": {
        "hostDir": hostDir,
        "containerDir": "/project"
      }
    }
  }
}
