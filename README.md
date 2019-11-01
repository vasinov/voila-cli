# Voila CLI

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/gitbucket/gitbucket/blob/master/LICENSE)

## Getting Started

Getting started with Voila is easy:

- Install [Docker Desktop](https://www.docker.com/products/docker-desktop).
- Download Voila CLI.
- Initialize Voila in your project directory with `voila init`. That will generate a `.voila.yml` config file in the current directory.
- In your project directory run `voila local:start` to start containers defined in `.voila.yml`.
- In your project directory run `voila local:run COMMAND` to run your project locally and generate result artifacts in the same directory without exiting the CLI (string output will show up sequentially). For example, `voila local:run ls -al`.
- To check container status run `voila local:status`.
- To SSH into a running container run `voila local:ssh`.
- To stop containers run `voila local:stop`.

## Config Format

The YAML config file has the following structure (subject to change):

```yaml
containers:
  - name: STRING
    env: ARRAY_OF_OBJECTS
    workdir: STRING
    volumes: ARRAY_OF_OBJECTS
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

Represents a directory in the Docker container where your current directory will be copied to. Voila automatically attaches your current host directory to `workdir`. Think of it as a default attached volume.

### `container.volumes` (optional)

Map local directories (full paths only) to container directories. For example, `"/usr/local/bin/app": "/my_app"`. If either folder doesn't exist it will get created.

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
* [`voila config-init`](#voila-config-init)
* [`voila help [COMMAND]`](#voila-help-command)
* [`voila $ voila local-run [ARGS...]`](#voila--voila-local-run-args)
* [`voila local-ssh`](#voila-local-ssh)
* [`voila local-start`](#voila-local-start)
* [`voila local-status`](#voila-local-status)
* [`voila local-stop`](#voila-local-stop)

## `voila config-init`

create a new config file

```
USAGE
  $ voila config-init

OPTIONS
  -f, --force  override existing config file

ALIASES
  $ voila init
  $ voila config:init
```

_See code: [src/commands/config-init.js](https://github.com/getvoila/cli/blob/v0.0.1/src/commands/config-init.js)_

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

## `voila $ voila local-run [ARGS...]`

Run a shell command inside of a running container.

```
USAGE
  $ voila $ voila local-run [ARGS...]

OPTIONS
  --container-name=container-name  Specify container name.
  --detach-command                 Run command asynchronously.

ALIASES
  $ voila local:run
```

_See code: [src/commands/local-run.js](https://github.com/getvoila/cli/blob/v0.0.1/src/commands/local-run.js)_

## `voila local-ssh`

Connect to a container over SSH.

```
USAGE
  $ voila local-ssh

OPTIONS
  --container-name=container-name  Specify container name.

ALIASES
  $ voila local:ssh
```

_See code: [src/commands/local-ssh.js](https://github.com/getvoila/cli/blob/v0.0.1/src/commands/local-ssh.js)_

## `voila local-start`

Start containers locally.

```
USAGE
  $ voila local-start

OPTIONS
  --no-cache  Don't use cache when building the image.
  --pull      Always attempt to pull a newer version of the image.

ALIASES
  $ voila local:start
```

_See code: [src/commands/local-start.js](https://github.com/getvoila/cli/blob/v0.0.1/src/commands/local-start.js)_

## `voila local-status`

Local status of containers and jobs.

```
USAGE
  $ voila local-status

ALIASES
  $ voila local:status
```

_See code: [src/commands/local-status.js](https://github.com/getvoila/cli/blob/v0.0.1/src/commands/local-status.js)_

## `voila local-stop`

Stop containers locally.

```
USAGE
  $ voila local-stop

ALIASES
  $ voila local:stop
```

_See code: [src/commands/local-stop.js](https://github.com/getvoila/cli/blob/v0.0.1/src/commands/local-stop.js)_
<!-- commandsstop -->
