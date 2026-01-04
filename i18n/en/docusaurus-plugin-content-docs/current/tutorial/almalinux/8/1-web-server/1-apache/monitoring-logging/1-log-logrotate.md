---
title: Log and Logrotate
description: How to Install and Configure Log and Logrotate on Apache Web Server AlmaLinux 8
sidebar_position: 1
sidebar_label: Log and Logrotate
---

In optimally managing **Apache Web Server** on **AlmaLinux 8**, configuring **log formats** is a vital aspect. Well-organized logs enable IT teams to accurately **analyze traffic**, **monitor security8**, and evaluate server performance. Apache provides high flexibility in configuring log formats to suit your needs, from access logs to error logs

This guide presents a comprehensive and detailed guide to **configuring Apache format logs in AlmaLinux 8**, covering various advanced options as well as best practices to ensure the logs provide maximum insight into your server activity.

## Prerequisites

- Full `root` access
- Basic Linux Command Line
- Security
- Apache/HTTPD is installed
- Domain (optional)
- Timezone has been configured

## Log

Before organizing logs, we need to understand the default log structure and location in Apache. In AlmaLinux 8, Apache logs are typically stored in the following directory:

```
/var/log/httpd/
```

With two main files as follows:

- **access_log**: records all received HTTP requests.
- **error_log**: records warnings, errors, and other important Apache logs.

These logs are controlled by default by directives in the main Apache configuration file, namely:

```
/etc/httpd/conf/httpd.conf
```

### LogFormat

Apache provides the `LogFormat` directive to specify the structure of the log files to be written. This format consists of various placeholders representing specific information from HTTP requests. Here are some common formats Apache uses by default:
```jsx showLineNumbers title="/etc/httpd/conf/httpd.conf"
LogFormat "%h %l %u %t \"%r\" %>s %b" common
```

Parameter Explanation:

- `%h`: Client IP address
- `%l`: User identifier (usually )
- `%u`: User name if authentication is used
- `%t`: Request timestamp
- `%r`: Request line (`GET /index.html HTTP/1.1`)
- `%>s`: HTTP status code
- `%b`: Response size in bytes

Apache allows us to create completely custom log formats to suit business or security needs. For example:

```
LogFormat "%v %h %u %t \"%r\" %>s %b %D" mycustomformat
CustomLog /var/log/httpd/my_custom.log mycustomformat
```

Please add the above parameters to the `/etc/httpd/conf/httpd.conf` file and between the `<IfModule log_config_module>` parameters. Please note that this configuration is server-wide, meaning that if the Virtualhost is not configured with `CustomLog`, all logs will automatically be in `/var/log/httpd/my_custom.log`.

Parameter Description:

- `%v`: Server hostname (for hosting multiple domains/virtual hosts)
- `%D`: Request processing time in microseconds

Using `%D` is crucial for identifying bottlenecks or slow requests.

Example output when using the default log:

```jsx showLineNumbers title="/var/log/httpd/access_log"
140.213.176.67 - - [21/Jul/2025:16:09:17 +0700] "GET / HTTP/1.1" 304 - "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
```

Example when using custom log:
```jsx showLineNumbers title="/var/log/httpd/my_custom.log"
localhost.localdomain 140.213.176.67 - [21/Jul/2025:16:07:11 +0700] "GET / HTTP/1.1" 304 - 2685 
focusnic.biz.id 140.213.176.67 - [21/Jul/2025:16:13:53 +0700] "GET / HTTP/1.1" 304 - 2848
```

In a multi-domain environment or more than one virtualhost, it is highly recommended to implement separate log formats and files for each domain using VirtualHost:
```jsx {7-9} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"" vhost_focusnicbizid
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log vhost_focusnicbizid
</VirtualHost>
```

Here is an example of custom log output:
```jsx showLineNumbers title="/var/log/httpd/focusnic.biz.id-access.log"
140.213.177.56 - - [21/Jul/2025:16:22:02 +0700] "GET / HTTP/1.1" 304 - "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
```

### LogFormat Example

1. Common Log Format <br/>

```
LogFormat "%h %l %u %t \"%r\" %>s %b" common
```
**Function**: Standard web server log format. Records IP, user, timestamp, request, status, and file size. Suitable for basic traffic analysis.

2. Combined Log Format <br/>

```
LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"" combined
```
**Function**: A comprehensive format that records Referer and User-Agent information. Suitable for SEO, visitor tracking, and in-depth analysis.

3. Proxy Log Format <br/>

```
LogFormat "%{X-Forwarded-For}i %l %u %t \"%r\" %>s %b" proxy
```

**Function**: Used in reverse proxy. Retrieves the original IP from X-Forwarded-For to log traffic coming through the proxy.

4. Debugging Custom Format <br/>

```
LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Cookie}i\" \"%{Authorization}i\"" debuglog
```

**Function**: Useful for debugging session-based or header authentication applications. Stores cookies and auth tokens.

5. Custom JSON Format for Modern Logging <br/>

```
LogFormat "{ \"ip\": \"%h\", \"method\": \"%m\", \"url\": \"%U\", \"status\": \"%>s\", \"time\": \"%t\" }" json
```
**Function**: To be sent to logging systems such as ELK, Grafana Loki, or Fluentd that require logs in JSON format.

6. Filtering or Ignoring Certain Logs <br/>
```
SetEnvIf Remote_Addr "192.168.1.1" dontlog
CustomLog /var/log/httpd/access_log combined env=!dontlog
```
**Function**: With this setting, requests from `192.168.1.1` will not be logged.
## Log Level

The log level is used to control the type of error messages logged in Apache's ErrorLog. This is very useful for debugging, monitoring, or simply logging fatal errors.


| **Level** | **Explanation** |
| --- | --- |
| `emerg` | Emergency condition; the system is unusable. |
| `alert` | Immediate action is required. |
| `crit` | Critical error requiring immediate attention. |
| `error` | General error, often the default level. |
| `warn` | Warning, not fatal but important to note. |
| `notice` | Important information that is not an error. |
| `info` | Additional information useful for diagnosis. |
| `debug` | Detailed information for debugging; very verbose. |
| `trace1`–`trace8` | Very detailed trace levels, used for advanced troubleshooting. |

How to set LogLevel is in the file `/etc/httpd/conf/httpd.conf`:
```jsx showLineNumbers title="/etc/httpd/conf/httpd.conf"
...
...
..
LogLevel warn
..
...
...
```

Then enabled on each virtualhost:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```

Fill in the `Error Log` parameter:
```jsx {8} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"" vhost_focusnicbizid
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log vhost_focusnicbizid
</VirtualHost>
```

Example of an error log on the virtualhost above:
```jsx showLineNumbers title="/var/log/httpd/focusnic.biz.id-error.log"
[Mon Jul 21 16:21:24.247642 2025] [proxy_fcgi:error] [pid 80233:tid 139715174033152] [client 140.213.177.56:49950] AH01071: Got error 'Primary script unknown'
```

## Logrotate
Apache logs can grow very quickly, especially on high-traffic servers. We can use the built-in tool `logrotate` to automatically compress and delete old logs.

The logrotate configuration file for Apache is usually located at:
```
/etc/logrotate.d/httpd
```
Example configuration:
```jsx showLineNumbers title="/etc/logrotate.d/httpd" 
/var/log/httpd/*log {
    missingok
    notifempty
    sharedscripts
    delaycompress
    postrotate
        /bin/systemctl reload httpd.service > /dev/null 2>/dev/null || true
    endscript
}
```

By default logs will be rotated weekly and stored for up to 4 rotations, and compressed for storage efficiency in `/etc/logrotate.conf`:
```jsx showLineNumbers title="/etc/logrotate.conf"
# see "man logrotate" for details
# rotate log files weekly
weekly

# keep 4 weeks worth of backlogs
rotate 4

# create new (empty) log files after rotating old ones
create

# use date as a suffix of the rotated file
dateext

# uncomment this if you want your log files compressed
compress

# RPM packages drop log rotation information into this directory
include /etc/logrotate.d
```

Run logrotate:
```
logrotate -v /etc/logrotate.conf
```

Debug logrotate:
```
logrotate -d /etc/logrotate.conf 
```

## Conclusion
Configuring **Apache Web Server log format in AlmaLinux 8** is an essential foundation for professional and efficient server management. By organizing logs in a neat, informative, and structured manner, we can more easily perform troubleshooting, traffic analysis, security audits, and performance evaluations. From using LogFormat and CustomLog, separating logs per VirtualHost, to integrating with analytics tools, all play a vital role in a stable and reliable server system.
