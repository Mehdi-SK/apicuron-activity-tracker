import { debug, error, info, warning } from '@actions/core'

export class Logger {
  static info(message: string) {
    info(message)
  }

  static warning(message: string) {
    warning(message)
  }

  static debug(message: string) {
    debug(message)
  }

  static error(message: string) {
    error(message)
  }

  static logProcessingErrors(errors: { file: string; error: unknown }[]) {
    Logger.warning(
      `Finished processing all articles with ${errors.length} errors: `
    )
    errors.forEach((err) => {
      Logger.error(`\tError in file [${err.file}] => ${err.error}`)
    })
    Logger.warning(
      `If you wish to credit contributors to these pages, please address the errors and re-run the workflow.`
    )
  }
}
