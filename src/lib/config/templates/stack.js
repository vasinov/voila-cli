exports.stackTemplate = (name, hostPath, image) => {
  return {
    "name": name,
    "apiVersion": "1",
    "stages": {
      "build": {
        "image": image
      },
      "run": {
        "hostPath": hostPath,
        "stackPath": "/stack"
      }
    }
  }
}
