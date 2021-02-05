import * as fs from 'fs';
import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';

/**
 * Properties for creating a BasicSiteMonitor
 */
export interface BasicSiteMonitorProps {
  /**
   * The URL to monitor via a regular GET request.
   */
  readonly url: string;
  /**
   * The friendly name of the site for notifications and naming.
   */
  readonly siteName: string;
  /**
   * List of emails to send notifications to when the site goes down or recovers.
   */
  readonly notificationEmails: string[];
}

/**
 * Very simple site monitoring solution that uses a Lambda job to make a GET request
 * to a URL on a regular basis (currently once a minute), and alarm if the request
 * fails multiple times within the monitoring period.
 * Email notifications are sent on repeated failure and recovery.
 *
 * At 1 request per minute, this easily fits within the AWS free tier limit.
 */
export class BasicSiteMonitor extends cdk.Construct {

  private static _lambdaCodeTemplate?: string;

  private static codeTemplate(): string {
    if (!this._lambdaCodeTemplate) {
      this._lambdaCodeTemplate = fs.readFileSync(path.join(__dirname, '../lambda/index.py'), 'utf-8');
    }
    return this._lambdaCodeTemplate;
  }

  constructor(scope: cdk.Construct, id: string, props: BasicSiteMonitorProps) {
    super(scope, id);

    // Remove disallowed characters
    const sanitizedSiteName = props.siteName.replace(/[^a-zA-Z0-9-_\.]+/g, '');
    const fnName = `Uptime-${sanitizedSiteName}`;

    const fn = new lambda.Function(this, 'Fn', {
      functionName: fnName,
      code: lambda.Code.fromInline(this.codeForUrl(props.url)),
      handler: 'index.handler',
      runtime: lambda.Runtime.PYTHON_3_7,
      description: `Site uptime monitor for ${props.siteName}`,
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
    });

    new events.Rule(this, 'CanaryCron', {
      schedule: events.Schedule.rate(cdk.Duration.minutes(1)),
      targets: [new targets.LambdaFunction(fn)],
    });

    const errorAlarm = new cloudwatch.Alarm(this, 'ErrorAlarm', {
      metric: fn.metricErrors(),
      threshold: 2,
      alarmName: `Errors-${props.siteName}`,
      alarmDescription: `Failures to load ${props.siteName}`,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING,
    });

    const alarmNotification = new sns.Topic(this, 'SiteErrorNotification', {
      displayName: `${sanitizedSiteName} Site Monitoring`,
    });
    props.notificationEmails.forEach((email) => alarmNotification.addSubscription(new subscriptions.EmailSubscription(email)));
    const snsAction = new actions.SnsAction(alarmNotification);
    errorAlarm.addAlarmAction(snsAction);
    errorAlarm.addOkAction(snsAction);
  }

  private codeForUrl(url: string) {
    return BasicSiteMonitor.codeTemplate().replace('REPLACE_SITE_URL', url);
  }
}
