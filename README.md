# Voila CLI

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/gitbucket/gitbucket/blob/master/LICENSE)

Voila CLI is a command line tool for Mac and Linux that enables HPC engineers and researchers to run their experiments in local and remote containers effortlessly.

## Installation

### Mac

- Download and install [Docker Desktop](https://download.docker.com/mac/stable/Docker.dmg).
- Download the latest distribution of [Voila CLI](https://voila-cli-tarballs.s3-us-west-2.amazonaws.com/voila-darwin-x64.tar.gz).
- Set an alias for the executable: `alias voila="/path/to/voila/bin/voila"`.

### Linux

- Follow Docker [installation instructions](https://docs.docker.com/install/linux/docker-ce/ubuntu/) for your distro.
- Download the latest distribution of Voila CLI: [Linux ARM](https://voila-cli-tarballs.s3-us-west-2.amazonaws.com/voila-linux-arm.tar.gz) or [Linux x64](https://voila-cli-tarballs.s3-us-west-2.amazonaws.com/voila-linux-x64.tar.gz).
- If you running Docker as a root user (i.e., prefixed with `sudo`) then you'll have to run Voila with `sudo` as well since it makes calls to the Docker CLI in the background. In this case create a symbolic link to Voila: `ln -s $PATH_TO_VOILA/bin/voila ~/home/$USER/.local/bin/voila`
- You can [run Docker as a non-root user](https://docs.docker.com/install/linux/linux-postinstall/). In this case you can either set a symbolic link like in the previous example or simply setup an alias `alias voila="$PATH_TO_VOILA/bin/voila"`.

### Windows

We don't officially support Windows yet but you could use the [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10) in order to start using Voila CLI.

### Installing from Source

You need [npm](https://nodejs.org/en/) to install the CLI from source.

```shell
# First, clone the repo
git@github.com:getvoila/cli.git

# Install package dependencies
cd cli && npm up

# To run the CLI directly 
./cli/bin/run

# To create a link for `voila`
npm link

# Voila!
voila init
```

## Getting Started

Getting started with Voila is easy:

- Initialize Voila in your project directory with `voila init`. That will generate a `.voila` folder with config files for the whole project and individual modules in the current directory.
- In your project directory run `voila start` to start the default module defined in `.voila/config.yml`.
- In your project directory run `voila $ COMMAND` to run a command for your default module locally and generate result artifacts in the same directory. For example, `voila $ ls -al > files.txt`.
- To check module status run `voila status`.
- To SSH into the default running module run `voila ssh`.
- To stop the default module run `voila stop`.

## Config Format

After running `voila init` a `.voila` folder gets added to your project. In this directory you'll find a `config.yml` file with the project ID and default module name. In the `.voila/modules` folder you'll find YAML config files for each module.

All module config files have the following structure:

```yaml
name: STRING
env: ARRAY_OF_OBJECTS
workdir: STRING_OR_OBJECT
volumes: ARRAY_OF_STRINGS_AND_OBJECTS
ports: ARRAY_OF_STRINGS
stages:
  build:
    images: ARRAY_OF_OBJECTS
    env: ARRAY_OF_OBJECTS
    actions: ARRAY_OF_OBJECTS
```

Each container represents an independent unit that has its own settings and execution context. Containers have names, environment variables, volumes, ports, and stages.

### `container.name` (required)

Name of the container image that Voila will generate.

### `container.env` (optional)

Array of environmental variables set in the following format: `name:value`. Variables setup here can be used during `build` *and* `run` stages

### `container.workdir` (required)

Represents a directory in the Docker container where your project host root directory will be mounted to. Voila automatically sets this directory to `workdir`. Think of it as a default attached volume.

You can also use an object notation and mount any directory on your hard drive to the container `workdir`. This is useful for when you want to mount a specific project sub-directory inside of a module.

### `container.volumes` (optional)

Map local directories (full paths only) to container directories. For example, `"/usr/local/bin/app": "/my_app"`. If either folder doesn't exist it will get created. You can also use a string shortcut for one-to-one mappings. For example `/my/path` will map host `/my/path` to the container `/my/path`.

### `container.ports` (optional)

Open container ports and map them to host ports. For example, `8080:80` opens port `80` in the container and maps it to the host port `8080`. You can also specify IP addresses and TCP, UDP, or SCTP protocols (TCP is the default). For example, `127.0.0.2:80:5000/udp` maps host IP address `127.0.0.2` and port `80` to container port `5000` over UDP. 

### `container.stages` (required)

There are two stages: `build` and `run`.

### `container.stages.build.images` (required)

Includes the list of images that the final image should include.

### `container.stages.build.env` (optional)

Environmental variables only available during the `build` stage.

### `container.stages.build.actions` (optional)

There is currently one type of `action` called `execute`. Here's an example of how to use it:

```yaml
actions:
  - execute: ["apt-get", "update"]
  - execute: apt-get -y install gfortran
```

`execute` actions can use exec and shell forms (i.e., array of strings or a single string).


## CLI Commands

Voila CLI documentation is part of the CLI itself. To get access to all available commands simply type `voila`. If you are interested in the details of a specific command add the `--help` flag to it. For example, `voila ssh --help`
