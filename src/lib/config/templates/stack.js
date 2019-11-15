exports.stackTemplate = (name, hostDir, images) => {
  return {
    "name": name,
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
