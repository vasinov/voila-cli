module.exports = {
  NO_VOILA_YML: `Can't find ".voila.yml". Initialize Voila with "voila init" first.`,
  START_CONTAINER_LOCAL: `Start containers with "voila start" first.`,
  DEFINE_CONTAINERS: `Define containers in ".voila.yml" first.`,
  SPECIFY_CONTAINER_NAME: `Specify container name.`,
  SPECIFY_COMMAND: `Specify command to run.`,
  SSH_SESSION_INTERRUPTED: `SSH session was interrupted unexpectedly.`,
  EXEC_INTERRUPTED: `Command execution interrupted unexpectedly.`,

  containerError: (containerName, code, reason) => {
    return `Error: Container ${containerName} returned error code ${code} during "${reason}".`
  }
}
