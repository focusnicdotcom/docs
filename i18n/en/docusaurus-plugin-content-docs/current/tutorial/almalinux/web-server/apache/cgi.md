---
title: CGI
description: How to Use CGI Scripts on Apache in AlmaLinux 8
sidebar_position: 6
sidebar_label: CGI
---

In the world of Linux server administration, the use of **CGI (Common Gateway Interface)** remains relevant, especially for legacy systems, lightweight scripts, or the need for quick integration without additional frameworks. This guide will cover **completely and structured** how to **enable and run CGI on Apache Web Server on AlmaLinux 8**, from installation to testing. It includes practical tips to ensure optimal security and performance on production servers.

## Prerequisites
- Full `root` access
- Apache/HTTPD installed
- Basic Linux Command Line
- Security

## Enabling the CGI Module
Before continuing, ensure Apache HTTP Server is installed on your server and you have root or sudo access. CGI requires certain modules to be enabled to run properly.
If Apache is not installed, please follow these steps:

```
dnf update -y
dnf install httpd -y
systemctl enable --now httpd
```
After that, make sure ports 80 and 443 (if SSL is used) are open in firewalld:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

By default, Apache on AlmaLinux 8 includes a CGI module. However, this module must be manually loaded to run files with the `.cgi` or `.pl` extension. Verify the `mod_cgi` or `mod_cgid` module with the following command:
```
httpd -M | grep cgi
```
Example output:
```
cgid_module (shared)
```
If the output does not come out, we can add configuration in the virtual host file or main configuration:
```
nano /etc/httpd/conf.modules.d/01-cgi.conf
```
Adjust the following parameters:
```jsx showLineNumbers title="/etc/httpd/conf.modules.d/01-cgi.conf"
<IfModule mpm_worker_module>
   LoadModule cgid_module modules/mod_cgid.so
</IfModule>
<IfModule mpm_event_module>
   LoadModule cgid_module modules/mod_cgid.so
</IfModule>
<IfModule mpm_prefork_module>
   LoadModule cgi_module modules/mod_cgi.so
</IfModule>
```
Then restart Apache after making the changes:
```
apachectl configtest
systemctl restart httpd
```

### Setting Up a Directory for CGI Scripts in Apache

The default directory for CGI is `/var/www/cgi-bin`, but you can choose your own directory as long as it's set correctly in the configuration. Here's an example of a virtual host configuration for a CGI script:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```
Fill in the following parameters
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    <Directory "/var/www/focusnic.biz.id/public_html/cgi-bin">
        AllowOverride All 
        Options +ExecCGI
        AddHandler cgi-script .cgi .pl
        Require all granted
    </Directory>

    ScriptAlias /cgi-bin/ "/var/www/focusnic.biz.id/public_html/cgi-bin/"
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```
Create a directory and give it appropriate permissions:
```
mkdir -p /var/www/focusnic.biz.id/public_html/cgi-bin
chown -R apache:apache /var/www/focusnic.biz.id
chmod +x /var/www/focusnic.biz.id/public_html/cgi-bin
```
Then restart Apache to save changes
```
systemctl restart httpd
```
Create a test script:
```
nano /var/www/focusnic.biz.id/public_html/cgi-bin/hello.cgi
```
Fill with the following script:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/public_html/cgi-bin/hello.cgi"
#!/bin/bash
echo "Content-type: text/html"
echo ""
echo "<html><body><h1>CGI Test Focusnic</h1></body></html>"
```

Adjust permissions:
```
chmod 755 /var/www/focusnic.biz.id/public_html/cgi-bin/hello.cgi
```

When using SELinux, please allow the following permissions:
```
chcon -t httpd_sys_script_exec_t /var/www/*/public_html/cgi-bin/ -R
```

Open `http://$DOMAIN_NAME/cgi-bin/hello.cgi` in your browser. If the configuration is successful, you will see a page that says "CGI Focusnic Test"
![](/img/almalinux8-cgi.jpg)<br/>

If the server is used in a production environment:

- **Enable Custom Logging** for CGI scripts.
- **Process Isolation** using suEXEC or mpm-itk (further development is possible).
- **Use HTTPS** for secure data transmission when communicating with CGI scripts.
- **Audit Apache Logs** to detect anomalies in running scripts.

## Troubleshooting

1. Permission Denied<br/>
Make sure the script file has execute permission (chmod 755) and its owner is the apache user and also SELinux:
```
chcon -t httpd_sys_script_exec_t /var/www/*/public_html/cgi-bin/ -R
```

2. Internal Server Error 500<br/>
Usually caused by an error in the output header or the interpreter not being found.

3. Script Not Executing, Just Downloaded<br/>
Make sure the directory has Options +ExecCGI and AddHandler added.

4. ScriptAlias Not Found<br/>
Double check that the `ScriptAlias` path and the destination directory are correct and exist.

## Conclusion

**CGI** is a technology still used for various lightweight applications and legacy system integration. With proper configuration in **Apache Web Server on AlmaLinux 8**, CGI can run safely and stably. Support for Bash or Perl-based scripts provides flexibility in system development and integration.

If you manage a server or need a professional solution for server **installation, CGI, Apache Web Server, or cloud VPS**, **don't hesitate to contact Focusnic** —
The best Linux and Windows VPS provider with global locations including Singapore, Germany, the US, and more.

Q: Is CGI still relevant today?<br/>
A: Yes, especially for legacy systems, simple scripts, or integration processes that don't require a large framework.

Q: Is CGI safe to use?<br/>
A: It is safe as long as it is configured correctly. Use a dedicated directory, restrict permissions, and enable SELinux.

Q: How do I check if CGI is enabled in Apache?<br/>
A: Create a simple script like hello.cgi and access it via a browser. If it can be executed, it's enabled.

Q: Can CGI only be used with Perl?<br/>
A: No. CGI is standard, and can be used with Bash, Python, Ruby, and any other language as long as there is an interpreter.

Q: How do I isolate CGI scripts on a shared hosting server?<br/>
A: Use `suEXEC` or `mpm-itk` to limit users per process.

