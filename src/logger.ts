import { debug, error, info, warning } from '@actions/core'

export class Logger {
  className: string
  constructor(className?: string) {
    this.className = className || 'Core'
  }

  info(message: string) {
    info(`[${this.className}] ${message}`)
  }
  warning(message: string) {
    warning(`[${this.className}] ${message}`)
  }
  debug(message: string) {
    debug(`[${this.className}] ${message}`)
  }
  error(message: string) {
    error(`[${this.className}] ${message}`)
  }
  logProcessingErrors(errors: { file: string; error: unknown }[]) {
    this.warning(
      `Finished processing all articles with ${errors.length} errors: `
    )
    errors.forEach((err) => {
      this.error(`\tError in file [${err.file}] => ${err.error}`)
    })
    this.warning(
      `If you wish to credit contributors to these pages, please address the errors and re-run the workflow.`
    )
  }
}
