---
title: Virtual Host
description: How to Configure and Create Apache Virtual Host on AlmaLinux 8
sidebar_position: 2
sidebar_label: Virtual Host
---
Apache HTTP Server is one of the most popular and stable web servers that is widely used to run various types of websites. In an AlmaLinux 8-based server environment, the use of Apache Virtual Hosts is the primary solution for hosting multiple websites on a single server. This guide discusses comprehensively and in-depth on how to set up Virtual Host in Apache Web Server on the AlmaLinux 8 operating system, from basic installation to multi-domain configuration.

Virtual Host allows us to manage more than one website on a single Apache server machine. This is very efficient to save resources, server costs, and facilitate the administration of multiple domains in one system.

There are two types of Virtual Hosts in Apache:

- *Name-Based Virtual Host* → uses a domain address (hostname) to distinguish each site.

- *IP-Based Virtual Host* → uses a different IP address for each site.

In AlmaLinux 8, the default configuration uses the *Name-Based* approach because it is more efficient and flexible.

## Prerequisite
- Full `root` access
- Apache/HTTPD already installed
- Basic Linux Command Line
- Security
- Domain Name (VALID FQDN)

## Virtual Host Configuration
Before starting the Virtual Host configuration, make sure your AlmaLinux 8 system has Apache HTTP Server installed. If you have not installed Apache, please run the following command:

```
dnf install httpd -y
systemctl enable --now httpd
```
Make sure your firewall allows HTTP and HTTPS:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

Virtual Host configurations should be separated into dedicated directories for easy management:

- Configuration directory: `/etc/httpd/conf.d/$DOMAIN.conf`
- Site documents directory: for example in `/var/www/$DOMAIN/public_html/`

Recommended directory structure:
```
/var/www/
├── focusnic.biz.id/
│   └── public_html/
├── domain2.com/
│   └── public_html/
```
Create a directory and grant appropriate permissions:
```
mkdir -p /var/www/focusnic.biz.id/public_html
chown -R apache:apache /var/www/focusnic.biz.id
```

Create a configuration file for the domain:
:::info
If using more than one domain, please do the same for other domains, for example domain2.com and adjust the parameters.
:::

```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```

Fill in the following configuration:
```jsx showLineNumbers title="/etc/httpd.conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```
Once done, restart Apache:
```
apachectl configtest
systemctl restart httpd
```
Create a simple `index.html` file to test the virtual host:
```
echo "<h1>Selamat Datang di focusnic.biz.id</h1>" > /var/www/focusnic.biz.id/public_html/index.html
```

Open a browser and visit `http://$DOMAIN`. If the configuration is correct, the page will be displayed according to the testing file above.

### Virtual Host Production
The following is an example of an Apache Virtual Host configuration recommended for a production environment on AlmaLinux 8. This configuration takes into account security, a clean log structure, .htaccess support, and performance optimization.z

For applications that require HTTP port 80:
```jsx showLineNumbers title="/etc/httpd/conf.d/$DOMAIN.conf"
<VirtualHost *:80>
    ServerName example.com
    ServerAlias www.example.com
    DocumentRoot /var/www/example.com/public_html

    ErrorLog /var/www/example.com/logs/error.log
    CustomLog /var/www/example.com/logs/access.log combined

    # Block sensitive files
    <FilesMatch "\.(user.ini|htaccess|git|svn|project|LICENSE|README\.md)$">
        Require all denied
    </FilesMatch>

    <Directory /var/www/example.com/public_html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        DirectoryIndex index.html index.php
        
    # Output compression
        <IfModule mod_deflate.c>
            AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
        </IfModule>
    </Directory>
</VirtualHost>
```
For applications that require HTTPS port 443:
```jsx showLineNumbers title="/etc/httpd/conf.d/$DOMAIN.conf"
<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerName example.com
    ServerAlias www.example.com
    ServerAdmin admin@example.com
    DocumentRoot /var/www/example.com/public_html

    ErrorLog /var/www/example.com/logs/error.log
    CustomLog /var/www/example.com/logs/access.log combined

    # SSL Certificate
    SSLEngine on
    SSLCertificateFile /etc/ssl/example.com/fullchain.pem
    SSLCertificateKeyFile /etc/ssl/example.com/privkey.pem

    # Additional SSL security configuration (optional)
    SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite HIGH:!aNULL:!MD5:!3DES
    SSLHonorCipherOrder on

    # Public directory of websites
    <Directory /var/www/example.com/public_html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        DirectoryIndex index.html index.php

        <IfModule mod_deflate.c>
            AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
        </IfModule>
    </Directory>

    # Block access to sensitive files
    <FilesMatch "\.(user.ini|htaccess|git|svn|project|LICENSE|README\.md)$">
        Require all denied
    </FilesMatch>

    # Security header
    <IfModule mod_headers.c>
        Header always set X-Frame-Options "SAMEORIGIN"
        Header always set X-Content-Type-Options "nosniff"
        Header always set X-XSS-Protection "1; mode=block"
        Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        Header always set Referrer-Policy "strict-origin-when-cross-origin"
    </IfModule>

    # Disable TRACE method
    TraceEnable off
</VirtualHost>
</IfModule>
```

The steps before activating the production configuration are as follows:

1. If using paid SSL such as Sectigo, DigiCert, etc. please fill in the SSL parameters above. However, if you use HTTP port 80 configuration and want to use Let's Encrypt SSL please run the following command:
```
dnf install certbot python3-certbot-apache -y
certbot --apache -d example.com
```
2. Directories and log files:
```
mkdir -p /var/www/example.com/public_html
mkdir -p /var/www/example.com/logs
chown -R apache:apache /var/www/example.com
```
3. Restart apache:
```
apachectl configtest
systemctl restart httpd
```

## Troubleshooting
If an error occurs while running the Virtual Host, here are the troubleshooting steps:

Check the status of Apache:
```
systemctl status httpd
```
Check the Apache error log:
```
tail -f /var/log/httpd/$DOMAIN_NAME-error.log
```
or the following log if using virtual host production:
```
tail -f /var/www/$DOMAIN_NAME/logs/error.log
```
Validate the Apache configuration:
```
apachectl configtest
```
Check file ownership and folder permissions. Use `ls -la` to ensure the file is owned by user `apache` and has read permission.

## Conclusion

Apache Virtual Host configuration in AlmaLinux 8 is an important foundation in managing multi-domain websites on a single server. By implementing a secure, organized, and structured Virtual Host, we can:

- Run multiple websites on a single Apache instance efficiently.

- Customize domain-specific settings, such as root directory, log files, compression, and security.

- Protect the system from common vulnerabilities such as directory listing, sensitive file access, and legacy HTTP protocol flaws.

- Improve performance and scalability with compression, cache, and .htaccess features.

By following the presented best practices, your Apache server will be ready for production operations in a safe and professional manner. If you need technical assistance in
server setup, Apache Virtual Host configuration, or VPS cloud services, feel free to contact Focusnic - a trusted partner in modern digital infrastructure solutions.

Q: What is a Virtual Host in Apache? <br/>
A: Virtual Hosts allow Apache to handle multiple websites (domains) on a single physical server with different configurations.

Q: What is the difference between Name-Based and IP-Based Virtual Host? <br/>
A:
- Name-Based: Multiple domains use one IP address.

- IP-Based: Each domain has a different IP address.

Q: Can I use .htaccess on a Virtual Host? <br/>
A: Yes, make sure your configuration includes: `AllowOverride All` inside the `<Directory>` block for `.htaccess` to work.

Q: How do I enable SSL/HTTPS on Virtual Host? <br/>
A: Use Let's Encrypt or an SSL certificate from another provider, then set up Virtual Host with the directive:
```jsx showLineNumbers title="/etc/httpd/conf.d/$DOMAIN.conf"
SSLCertificateFile
SSLCertificateKeyFile
```

Q: What is the use of -Indexes in the configuration? <br/>
A: The -Indexes option prevents Apache from displaying a list of folder contents if there is no index.html file, making it safer from directory exploration by visitors.

Q: Is it necessary to create a log file per domain? <br/>
A: Highly recommended. This allows you to: detect errors per domain, view specific traffic per site, and compile accurate analytics reports.

Q: What if my configuration is not running? <br/>
A: Check the syntax with `apachectl configtest` or see the error log

Q: Does this configuration work on CentOS, Rocky Linux, or RHEL? <br/>
A: Yes, since AlmaLinux is *binary-compatible* with RHEL, this Virtual Host configuration is also *fully compatible* on all those distros.
