module.exports = {
  VOILA_YML_ALREADY_EXISTS: `".voila.yml" already exists. Run "voila init --force" to overwrite.`,
  NO_VOILA_YML: `Can't find ".voila.yml". Initialize Voila with "voila init" first.`,
  NO_RUNNING_CONTAINER: `No containers are currently running. Start a container with "voila start" first.`,
  DEFINE_CONTAINERS: `Define containers in ".voila.yml" first.`,
  SPECIFY_CONTAINER_NAME: `Specify container name.`,
  SPECIFY_COMMAND: `Specify command to run.`,
  SSH_SESSION_INTERRUPTED: `SSH session was interrupted unexpectedly.`,
  EXEC_INTERRUPTED: `Command execution interrupted unexpectedly.`,

  containerError: (containerName, code, reason) => {
    return `Error: Container ${containerName} returned error code ${code} during "${reason}".`
  },

  configExistsInParentError: (path) => `You can't initialize new Voila projects inside of an existing project. ".voila.yml" was found in "${path}".`,

  multipleConfigsWarning: (paths, loadedFile) => {
    const pathList = paths.map(p => `${p}\n`).join('')

    return `Multiple ".voila.yml" files were detected in the following directories:\n\n` +
      `${pathList}\n\n` +
      `Loading the top level file: ${loadedFile}`
  },

  wrongModuleHostDirError: directory => {
    return `Command execution is only allowed inside of the mounted module directory: ${directory}`
  }
}
