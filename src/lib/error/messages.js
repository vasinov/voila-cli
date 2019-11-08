module.exports = {
  VOILA_YML_ALREADY_EXISTS: `".voila" already exists. Run "voila init --force" to overwrite.`,
  NO_VOILA_YML: `Can't find ".voila". Initialize Voila with "voila init" first.`,
  DEFINE_MODULES: `Define modules in ".voila/modules" first.`,
  SPECIFY_MODULE_NAME: `Specify module name.`,
  MODULE_NOT_FOUND: `Module not found.`,
  SPECIFY_COMMAND: `Specify command to run.`,
  SSH_SESSION_INTERRUPTED: `SSH session was interrupted unexpectedly.`,
  EXEC_INTERRUPTED: `Command execution interrupted unexpectedly.`,

  moduleNotRunningError: (moduleName) => {
    return `Module ${moduleName} is not running. Start it with "voila start ${moduleName}" first.`
  },

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
    return `Module access only allowed in the mounted module directory: ${directory}`
  }
}
