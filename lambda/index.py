import urllib
import urllib.request
import urllib.error

def handler(event, context):
    url = "REPLACE_SITE_URL"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'UptimeMonitor/0.1'})
        response = urllib.request.urlopen(req)
        code = response.getcode()
        return { 'statusCode': code }

    except Exception as e:
        print(f'Error fetching {url}: {str(e)}')