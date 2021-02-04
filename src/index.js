"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicSiteMonitor = void 0;
var fs = require("fs");
var path = require("path");
var cdk = require("aws-cdk-lib");
var cloudwatch = require("aws-cdk-lib/aws-cloudwatch");
var actions = require("aws-cdk-lib/aws-cloudwatch-actions");
var events = require("aws-cdk-lib/aws-events");
var targets = require("aws-cdk-lib/aws-events-targets");
var lambda = require("aws-cdk-lib/aws-lambda");
var sns = require("aws-cdk-lib/aws-sns");
var subscriptions = require("aws-cdk-lib/aws-sns-subscriptions");
var BasicSiteMonitor = /** @class */ (function (_super) {
    __extends(BasicSiteMonitor, _super);
    function BasicSiteMonitor(scope, id, props) {
        var _this = _super.call(this, scope, id) || this;
        // Remove disallowed characters
        var sanitizedSiteName = props.siteName.replace(/[^a-zA-Z0-9-_\.]+/g, '');
        var fnName = "Uptime-" + sanitizedSiteName;
        var fn = new lambda.Function(_this, 'Fn', {
            functionName: fnName,
            code: lambda.Code.fromInline(_this.codeForUrl(props.url)),
            handler: 'index.handler',
            runtime: lambda.Runtime.PYTHON_3_7,
            description: "Site uptime monitor for " + props.siteName,
            memorySize: 128,
            timeout: cdk.Duration.seconds(10),
        });
        new events.Rule(_this, 'CanaryCron', {
            schedule: events.Schedule.rate(cdk.Duration.minutes(1)),
            targets: [new targets.LambdaFunction(fn)],
        });
        var errorAlarm = new cloudwatch.Alarm(_this, 'ErrorAlarm', {
            metric: fn.metricErrors(),
            threshold: 2,
            alarmName: "Errors-" + props.siteName,
            alarmDescription: "Failures to load " + props.siteName,
            evaluationPeriods: 2,
            treatMissingData: cloudwatch.TreatMissingData.BREACHING,
        });
        var alarmNotification = new sns.Topic(_this, 'SiteErrorNotification', {
            displayName: sanitizedSiteName + " Site Monitoring",
        });
        props.notificationEmails.forEach(function (email) { return alarmNotification.addSubscription(new subscriptions.EmailSubscription(email)); });
        var snsAction = new actions.SnsAction(alarmNotification);
        errorAlarm.addAlarmAction(snsAction);
        errorAlarm.addOkAction(snsAction);
        return _this;
    }
    BasicSiteMonitor.codeTemplate = function () {
        if (!this._lambdaCodeTemplate) {
            this._lambdaCodeTemplate = fs.readFileSync(path.join(__dirname, '../lambda/index.py'), 'utf-8');
        }
        return this._lambdaCodeTemplate;
    };
    BasicSiteMonitor.prototype.codeForUrl = function (url) {
        return BasicSiteMonitor.codeTemplate().replace('REPLACE_SITE_URL', url);
    };
    return BasicSiteMonitor;
}(cdk.Construct));
exports.BasicSiteMonitor = BasicSiteMonitor;
//# sourceMappingURL=index.js.map