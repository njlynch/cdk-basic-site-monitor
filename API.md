# API Reference

**Classes**

Name|Description
----|-----------
[BasicSiteMonitor](#cdk-basic-site-monitor-basicsitemonitor)|Very simple site monitoring solution that uses a Lambda job to make a GET request to a URL on a regular basis (currently once a minute), and alarm if the request fails multiple times within the monitoring period.


**Structs**

Name|Description
----|-----------
[BasicSiteMonitorProps](#cdk-basic-site-monitor-basicsitemonitorprops)|Properties for creating a BasicSiteMonitor.



## class BasicSiteMonitor  <a id="cdk-basic-site-monitor-basicsitemonitor"></a>

Very simple site monitoring solution that uses a Lambda job to make a GET request to a URL on a regular basis (currently once a minute), and alarm if the request fails multiple times within the monitoring period.

Email notifications are sent on repeated failure and recovery.

At 1 request per minute, this easily fits within the AWS free tier limit.

__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-lib-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-lib-idependable)
__Extends__: [Construct](#aws-cdk-lib-construct)

### Initializer




```ts
new BasicSiteMonitor(scope: Construct, id: string, props: BasicSiteMonitorProps)
```

* **scope** (<code>[Construct](#aws-cdk-lib-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[BasicSiteMonitorProps](#cdk-basic-site-monitor-basicsitemonitorprops)</code>)  *No description*
  * **notificationEmails** (<code>Array<string></code>)  List of emails to send notifications to when the site goes down or recovers. 
  * **siteName** (<code>string</code>)  The friendly name of the site for notifications and naming. 
  * **url** (<code>string</code>)  The URL to monitor via a regular GET request. 




## struct BasicSiteMonitorProps  <a id="cdk-basic-site-monitor-basicsitemonitorprops"></a>


Properties for creating a BasicSiteMonitor.



Name | Type | Description 
-----|------|-------------
**notificationEmails** | <code>Array<string></code> | List of emails to send notifications to when the site goes down or recovers.
**siteName** | <code>string</code> | The friendly name of the site for notifications and naming.
**url** | <code>string</code> | The URL to monitor via a regular GET request.



