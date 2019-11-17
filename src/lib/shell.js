exports.parseTable = (output, separator = ' ') => {
  const lines = output.split('\n')
  const headers = lines.shift()
  const splitHeader = headers.split(separator)

  const limits = []

  splitHeader
    .map(title => title.trim())
    .filter(title => !!title)
    .forEach(title => limits.push({ label: title, start: headers.indexOf(title) }))

  for (let i = 0; i < splitHeader.length; i++) {
    const colName = splitHeader[i].trim()

    if (colName) {
      limits.push({ label: colName, start: headers.indexOf(colName) })
    }
  }

  return lines
    .filter(row => !!row)
    .map(row => {
      const result = {}

      for (const key in limits) {
        const header = limits[key]
        const nextKey = parseInt(key, 10) + 1
        const start = (key === '0') ? 0 : header.start
        const end = (limits[nextKey]) ? limits[nextKey].start - start : undefined

        result[header.label] = row.substr(start, end).trim()
      }

      return result
    })
    .filter(row => row !== undefined)
}
