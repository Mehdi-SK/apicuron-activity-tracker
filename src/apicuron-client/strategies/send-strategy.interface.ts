import { Report } from "../../types/report.schema.js";
import { Environment } from "../const.js";


export interface SendContext {
    environment: Environment;
    apiToken: string;
}


export interface SendStrategy {
    
    sendReports(reports: Report[]): Promise<void>;
}