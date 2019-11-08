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

## Getting Started

Getting started with Voila is easy:

- Initialize Voila in your project directory with `voila init`. That will generate a `.voila` folder with config files for the whole project and individual modules in the current directory.
- In your project directory run `voila start` to start containers defined in `.voila/modules`.
- In your project directory run `voila $ COMMAND` to run your project locally and generate result artifacts in the same directory without exiting the CLI (string output will show up sequentially). For example, `voila run ls -al`.
- To check container status run `voila status`.
- To SSH into a running container run `voila ssh`.
- To stop containers run `voila stop`.

## Config Format

The YAML config file has the following structure (subject to change):

```yaml
containers:
  - name: STRING
    env: ARRAY_OF_OBJECTS
    workdir: STRING_OR_OBJECT
    volumes: ARRAY_OF_STRINGS_AND_OBJECTS
    ports: ARRAY_OF_STRINGS
    stages:
      build:
        images: ARRAY_OF_OBJECTS
        env: ARRAY_OF_OBJECTS
        actions: ARRAY_OF_OBJECTS
      run:
        command: STRING
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

### `container.stages.run.command` (optional)

Default command that you want to run. If you pass a command to the CLI directly it will override the command in the config file.

## Development

We use the [oclif](https://oclif.io/) npm framework to setup the CLI.

You need to have [npm](https://nodejs.org/en/) installed to develop the CLI. In the cloned repo run `npm up` to install package dependencies.

To run the CLI directly run `./cli/bin/run`. To link the CLI locally simply run `npm link` inside the `cli` folder.

To debug any command run it with `DEBUG=* voila COMMAND`.

## Commands

<!-- commands -->
* [`voila $ [ARGS...]`](#voila--args)
* [`voila config:init`](#voila-configinit)
* [`voila help [COMMAND]`](#voila-help-command)
* [`voila ssh`](#voila-ssh)
* [`voila start`](#voila-start)
* [`voila status`](#voila-status)
* [`voila stop`](#voila-stop)
* [`voila update [CHANNEL]`](#voila-update-channel)

## `voila $ [ARGS...]`

Run a shell command inside of a running container.

```
USAGE
  $ voila $ [ARGS...]

OPTIONS
  --module=module  Specify container name.
  --run-as-job                 Run command asynchronously.

  --execute-in=execute-in          Specify a directory inside the container that you'd like your command to be executed
                                   in.
```

_See code: [src/commands/$.js](https://github.com/getvoila/cli/blob/v0.2.0/src/commands/$.js)_

## `voila config:init`

create a new config file

```
USAGE
  $ voila config:init

OPTIONS
  -f, --force  override existing config file

ALIASES
  $ voila init
```

_See code: [src/commands/config/init.js](https://github.com/getvoila/cli/blob/v0.2.0/src/commands/config/init.js)_

## `voila help [COMMAND]`

display help for voila

```
USAGE
  $ voila help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.1/src/commands/help.ts)_

## `voila ssh`

Connect to a container over SSH.

```
USAGE
  $ voila ssh

OPTIONS
  --module=module  Specify container name.
```

_See code: [src/commands/ssh.js](https://github.com/getvoila/cli/blob/v0.2.0/src/commands/ssh.js)_

## `voila start`

Start containers locally.

```
USAGE
  $ voila start

OPTIONS
  --no-cache  Don't use cache when building the image.
  --pull      Always attempt to pull a newer version of the image.
```

_See code: [src/commands/start.js](https://github.com/getvoila/cli/blob/v0.2.0/src/commands/start.js)_

## `voila status`

Local status of containers and jobs.

```
USAGE
  $ voila status
```

_See code: [src/commands/status.js](https://github.com/getvoila/cli/blob/v0.2.0/src/commands/status.js)_

## `voila stop`

Stop containers locally.

```
USAGE
  $ voila stop
```

_See code: [src/commands/stop.js](https://github.com/getvoila/cli/blob/v0.2.0/src/commands/stop.js)_

## `voila update [CHANNEL]`

update the voila CLI

```
USAGE
  $ voila update [CHANNEL]
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v1.3.9/src/commands/update.ts)_
<!-- commandsstop -->
