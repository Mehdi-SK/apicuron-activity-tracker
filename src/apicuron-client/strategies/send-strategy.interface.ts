import { Logger } from '../../logger.js'
import { Report } from '../../types/report.schema.js'
import { Environment } from '../const.js'

export interface SendContext {
    environment: Environment
    apiToken: string
}

export abstract class SendStrategy<TContext extends SendContext = SendContext> {
    protected token: string
    protected readonly logger = new Logger('SendStrategy')
    constructor(context: TContext, ) {
        this.token = context.apiToken
    }
    abstract sendReports(reports: Report[], resource_id: string): Promise<Response>
}
