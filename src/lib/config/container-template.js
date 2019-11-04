const template = {
  "name": "default",
  "env": [],
  "workdir": "/project",
  "volumes": [],
  "ports": [],
  "stages": {
    "build": {
      "images": [
        "getvoila/base:0.1.0",
        "getvoila/build-essential:0.1.0",
        "getvoila/python:0.1.0",
        "getvoila/math-libs:0.1.0",
        "getvoila/gfortran:0.1.0",
        "getvoila/open-mpi:0.1.0",
        "julia:1.2-buster"
      ],
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

module.exports = template
