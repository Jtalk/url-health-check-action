# URL health check action

A cURL-based health check with build-in retry. 

```yaml
steps:
  - name: Check the deployed service URL
    uses: jtalk/url-health-check-action@v1
    with:
      # Check the following URLs one by one sequentially
      url: https://example.com|http://example.com
      # Follow redirects, or just report success on 3xx status codes
      follow-redirect: no # Optional, defaults to "no"
      # Fail this action after this many failed attempts
      max-attempts: 3 # Optional, defaults to 1
      # Delay between retries
      retry-delay: 5s # Optional, only applicable to max-attempts > 1
```

The action will fail if any of the URLs reports either 4xx or 5xx status codes.
