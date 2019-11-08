const chalk = require('chalk')
const format = require('date-fns/format')
const {cli} = require('cli-ux')

const timeLabel = () => {
  return chalk.dim(`[${format(new Date(), 'HH:mm:ss')}]`)
}

exports.info = (text, sub = false) => {
  if (sub) {
    console.log(chalk.dim(`↳ ${result}`))
  } else {
    console.log(text)
  }
}

exports.infoWithTime = (text, sub = false) => {
  if (sub) {
    console.log(chalk.dim(`${timeLabel()} ↳ ${text}`))
  } else {
    console.log(`${timeLabel()} ${text}`)
  }
}

exports.error = text => {
  const finalTest = text.split('\n').map(line => `${chalk.red('›')}   ${line}`).join('\n')

  console.log(finalTest)
}

exports.warn = text => {
  const finalTest = text.split('\n').map(line => `${chalk.yellow('›')}   ${line}`).join('\n')

  console.log(finalTest)
}

exports.table = (header, data) => {
  cli.table(data, header)
}
