const template = {
  "name": "default",
  "env": [],
  "workdir": "/project",
  "volumes": [],
  "ports": [],
  "stages": {
    "build": {
      "images": [
        "getvoila/base:latest",
        "getvoila/build-essential:latest",
        "getvoila/python:2-latest",
        "getvoila/python:3-latest",
        "getvoila/math-libs:latest",
        "getvoila/gfortran:latest",
        "getvoila/open-mpi:latest"
      ],
      "env": [],
      "actions": []
    },
    "run": {
      "command": ""
    }
  }
}

module.exports = template
