# CORS check action

A cURL-based post-deploy CORS check with build-in redirect & retry. An quick & easy way to verify if a url will work correctly with CORS. 

```yaml
steps:
  - name: Check the deployed service URL
    uses: Qiming-Liu/cors-check-action@v1
    with:
      # Check the following URLs one by one sequentially
      url: https://cypress.io
      # Follow redirects, or just report success on 3xx status codes
      follow-redirect: false # Optional, defaults to "false"
      # Fail this action after this many failed attempts
      max-attempts: 3 # Optional, defaults to 1
      # Delay between retries
      retry-delay: 5s # Optional, only applicable to max-attempts > 1
      # Retry all errors, including 404. This option might trigger curl upgrade.
      retry-all: false # Optional, defaults to "false"
      # String representation of cookie attached to health check request.
      # Format: `Name=Value`
      cookie: "token=asdf1234" # Optional, default is empty
      # Basic auth login password pair.
      # Format: `login:password`
      basic-auth: "login:password" # Optional, default is empty
```

The action will fail if once all `max-attempts` have been exhausted, or the `url` will not work correctly with CORS.
