---
title: AWStats
description: How to Install and Configure AWStats on Apache Web Server AlmaLinux 8
sidebar_position: 3
sidebar_label: AWStats 
---

**AWStats** is one of the most frequently used **web analytics** solutions by system administrators and website managers. By integrating AWStats into the **Apache Web Server** on **AlmaLinux 8**, we can present detailed, real-time website traffic statistics. AWStats supports various log formats and displays important information such as the number of visits, visitor origin, browser, operating system, and bandwidth data.

In this guide, we will cover **how to install AWStats on an Apache Web Server on AlmaLinux 8**, from installation to configuration and security optimization. This guide is ideal for administrators looking to accurately manage website traffic using an open source solution.

## Prerequisites

- Full `root` access
- Basic Linux Command Line
- Security
- Apache/HTTPD installed
- Domain (optional)
- Timezone configured

## Install AWStats
First, we need to update the system first and also install `epel` because the `awstats` package is not available in `AppStream` aka the default repository:
```
dnf update -y
dnf install epel-release -y
```

Then, install AWStats with the following command:
```
dnf install awstats -y
```

## Virtualhost Configuration for AWStats
Make sure Apache is installed. If it isn't, please run the following command:
```
dnf install httpd -y
systemctl enable --now httpd
```

Then allow ports 80 and 443 on firewalld when using it:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

After the installation process is complete, we have to configure Apache we can add the following configuration block into an existing virtual host file or create a new one:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf 
``` 
Then fill in the following parameters:
```jsx {7,9-18,20-26} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf" 
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    Alias /web-stats "/usr/share/awstats/wwwroot/cgi-bin/"

    <Directory "/usr/share/awstats/wwwroot/cgi-bin/">
        DirectoryIndex index.pl
        Options ExecCGI
        AddHandler cgi-script .pl
        AuthType Basic
        AuthName "AWStats Protected"
        AuthUserFile "/etc/httpd/.htpasswd-focusnic"
        Require valid-user
        AllowOverride None
    </Directory>

    Alias /awstatsclasses "/usr/share/awstats/wwwroot/classes/"
    Alias /awstatscss "/usr/share/awstats/wwwroot/css/"
    Alias /awstatsicons "/usr/share/awstats/wwwroot/icon/"
    <Directory "/usr/share/awstats/wwwroot/">
        AllowOverride None
        Require all granted
    </Directory>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

Create a virtualhost directory:
```
mkdir -p /var/www/focusnic.biz.id/public_html
```
Create a basic auth username `admin` to access AWStats:
```
htpasswd -c /etc/httpd/.htpasswd-focusnic admin
```
Then restart Apache after making the changes:
```
apachectl configtest
systemctl restart httpd
```

## AWStats Configuration

The next step is to configure AWStats. By default, AWStats provides a template file called `awstats.model.conf`. We need to copy and customize it for our domain:
```
cp /etc/awstats/awstats.model.conf /etc/awstats/awstats.focusnic.biz.id.conf
```
Then edit the following file:
```
nano /etc/awstats/awstats.focusnic.biz.id.conf
```
Adjust some necessary parameters:
```jsx showLineNumbers title="/etc/awstats/awstats.focusnic.biz.id.conf"
LogFile="/var/log/httpd/focusnic.biz.id-access.log"
DirData="/var/lib/awstats/focusnic.biz.id"
SiteDomain="focusnic.biz.id"
```
Then create an AWStats directory to store the above statistics:
```
mkdir /var/lib/awstats/focusnic.biz.id/
```

After that, please run the following command to generate data:
```
/usr/share/awstats/wwwroot/cgi-bin/awstats.pl -config=focusnic.biz.id -update
```
Output example:
```
Create/Update database for config "/etc/awstats/awstats.focusnic.biz.id.conf" by AWStats version 7.9 (build 20230108)
From data in log file "/var/log/httpd/focusnic.biz.id-access.log"...
Phase 1 : First bypass old records, searching new record...
Direct access after last parsed record (after line 2998)
Jumped lines in file: 2998
 Found 2998 already parsed records.
Parsed lines in file: 6
 Found 2 dropped records,
 Found 0 comments,
 Found 0 blank records,
 Found 0 corrupted records,
 Found 0 old records,
 Found 4 new qualified records.
```
If you have more than one domain using AWStats then run the following command
```
/usr/share/awstats/tools/awstats_updateall.pl now -configdir="/etc/awstats"
```
Then access the browser by typing the domain name and the following query `http://focusnic.biz.id/web-stats/awstats.pl?config=focusnic.biz.id` and enter the username and password that were created previously.
![](/img/almalinux8-apache-awstats.jpg)<br/>

Create a cron to automate the generation of AWStats data every day at 00:00
```
crontab -e
```
Fill in the following parameters:
```
0 0 * * * /usr/share/awstats/tools/awstats_updateall.pl now -configdir="/etc/awstats"
```
# Troubleshooting
1. 404 Not Found or no response when opening http://domain.com/web-stats/ <br/>

Make sure Alias has been configured in the `<VirtualHost>` block and the CGI module has been enabled.

2. Basic Authentication does not appear <br/>

Do not use the `Require all granted` parameter together with `Require valid-user` in the `<VirtualHost>` block.

3. Statistics are not updated <br/>

Run a manual update:
```
/usr/share/awstats/wwwroot/cgi-bin/awstats.pl -config=yourdomain -update
```

Check the LogFile in your AWStats `.conf` file to see if it points to the correct log location.

## Conclusion

Configuring AWStats per VirtualHost provides significant benefits in managing and analyzing traffic for each domain. This is especially important if you manage multiple websites on a single server. With well-organized logs, separate configuration files, and automatic updates, AWStats can function optimally without conflict between domains.

Q: Can AWStats run without root access? <br/>
A: Yes, as long as the Apache user has permission to read log files and AWStats is installed correctly.

Q: Where are the AWStats statistics files stored? <br/>
A: By default, it's in: `/var/lib/awstats/`

Q: Does AWStats delete old data automatically? <br/>
A: No. You must delete old .txt files manually or via a cronjob.

Q: Can it be used on multiple VirtualHost? <br/>
A: Yes, it's perfect for multiple domains, as long as each domain has:
- Its own `.conf` file
- Its own directory aliases and protection
