exports.stackTemplate = (name, hostDir, image) => {
  return {
    "name": name,
    "apiVersion": "1",
    "stages": {
      "build": {
        "image": image
      },
      "run": {
        "hostDir": hostDir,
        "containerDir": "/project"
      }
    }
  }
}
