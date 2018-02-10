# check_http_json_performance
Nagios HTTP Check with parsed JSON performance output

Usage: node index.js

  -u, --url=ARG            The URL to request.
  -j, --method=ARG         HTTP Method to use (default: GET).
  -t, --timeout=ARG        Seconds before connection times out (default: 10).
  -p, --checkproperty=ARG  Warning/Critical checks should be made on this property from the body instead of the response time.
  -w, --warning=ARG        Warning threshold (default: 1000).
  -c, --critical=ARG       Critical threshold (default: 2000).
  -h, --help               Display this help.
  -V, --version            Show version.
