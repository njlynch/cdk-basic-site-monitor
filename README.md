# CDK Basic Site Monitor

Very basic CDK construct for monitoring a site by making a HTTP(S) request regularly and reporting if the site doesn't respond (in a timely manner).

```
import { BasicSiteMonitor } from 'njlynch';
new BasicSiteMonitor(this, 'ExampleMonitor', {
  url: 'https://example.com',
  siteName: 'Example',
  notificationEmails: ['admin@example.com'],
});