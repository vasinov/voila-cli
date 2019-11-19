module.exports = {
  CONFIG_ALREADY_EXISTS: `".penguin" already exists. Run "penguin init --force" to overwrite.`,
  NO_CONFIG: `Can't find ".penguin". Initialize Penguin with "penguin init" first.`,
  DEFINE_STACKS: `Define stacks in ".penguin/stacks" first.`,
  SPECIFY_STACK_NAME: `Specify stack name.`,
  STACK_NOT_FOUND: `Stack not found.`,
  SPECIFY_COMMAND: `Specify command to run.`,
  SSH_SESSION_INTERRUPTED: `SSH session was interrupted unexpectedly.`,
  EXEC_INTERRUPTED: `Command execution interrupted unexpectedly.`,
  CONTAINER_DIR_NOT_ABSOLUTE: `"containerDir" in the stack config file has to be an absolute path.`,
  HOST_DIR_OUTSIDE_PROJECT: `"hostDir" has to be inside the current project.`,

  DOCKERFILE_DOESNT_EXIST: `Dockerfile doesn't exist.`,
  DOCKERFILE_OUTSIDE_PROJECT: `Dockerfile path has to be inside the current project.`,

  STACK_NAME_INVALID: `Stack name has to be a non-empty alphanumeric string ("-" and "_" characters are allowed).`,
  STACK_NAME_EXISTS: `Stack name already exists.`,

  STORAGE_TABLE_DOESNT_EXIST: `Table doesn't exist in the local storage.`,
  STORAGE_SETTINGS_KEY_DOESNT_EXIST: `Key doesn't exist in the settings.`,

  JOB_ISNT_RUNNING: `Job isn't running.`,
  JOB_DOESNT_EXIST: `Job doesn't exist.`,
  jobDoesntExistAfterRestart: (job) => `Job "${job.id}" log was cleared after stack "${job.stackName}" restarted.`,

  stackNotRunningError: stackName => {
    return `Stack "${stackName}" is not running. Start it with "penguin start ${stackName}" first.`
  },

  configExistsInParentError: path => `You can't initialize new Penguin projects inside of an existing project. ".penguin.yml" was found in "${path}".`,

  multipleConfigsWarning: (paths, loadedFile) => {
    const pathList = paths.map(p => `${p}\n`).join('')

    return `Multiple ".penguin.yml" files were detected in the following directories:\n\n` +
      `${pathList}\n\n` +
      `Loading the top level file: ${loadedFile}`
  },

  wrongStackHostDirError: directory => {
    return `Stack access only allowed in the mounted stack directory: ${directory}`
  },

  stopStackBeforeProceeding: stack => {
    return `Stack "${stack}" is currently running. Stop it with "penguin stop ${stack}" first`
  }
}
