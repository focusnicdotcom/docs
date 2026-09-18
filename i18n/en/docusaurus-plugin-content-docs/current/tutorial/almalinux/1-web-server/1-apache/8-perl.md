---
title: Perl
description: How to Install and Use Perl on Apache in AlmaLinux 8
sidebar_position: 8
sidebar_label: Perl
---

Apache and Perl are a powerful combination in the world of server-side scripting. **Perl**, with its flexibility and power in text processing and server automation, remains a relevant language today, especially for *legacy* applications and system *scripting*. In this guide, we will cover the **step-by-step installation of Perl on an Apache web server running AlmaLinux 8**, a stable Linux distribution compatible with Red Hat Enterprise Linux (RHEL). This guide is designed for **system administrators, web developers, and server service providers** who want to maximize the potential of their servers using open-source technologies.

## Prerequisite
- Full `root` access
- Apache/HTTPD installed
- Basic Linux Command Line
- Security

## Perl Installation
Before installing, make sure your system is updated to the latest version to avoid potential package conflicts.
```
dnf update -y
```
The Apache web server is a key component of this environment. If Apache isn't installed, run the following command:
```
dnf install httpd -y
systemctl enable --now httpd
```
Make sure the firewall allows both HTTP and HTTPS traffic:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```
By default, Perl is available in the official AlmaLinux repositories. We just need to run one simple command to install it:
```
dnf install perl -y
```
After the installation is complete, verify the Perl version:
```
perl -v
```
Here is an example of the output:
```
This is perl 5, version 26, subversion 3 (v5.26.3) built for x86_64-linux-thread-multi
```
To allow Apache to execute Perl scripts, we need to enable `mod_cgi`. On AlmaLinux 8, this module is available within the Apache package:
```
httpd -M | grep cgi
```
Example output:
```
cgid_module (shared)
```
If the output does not appear, please install the following package:
```
dnf install httpd-tools -y
```

## Setting Up Directories for Perl Scripts in Apache

Open the relevant Apache (or virtual host) configuration file. If you don't have a virtual host yet, create one:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```
Fill in the following parameters:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    <Directory "/var/www/focusnic.biz.id/public_html/perl-app">
        AllowOverride All
        Options +ExecCGI
        AddHandler cgi-script .cgi .pl
        Require all granted
    </Directory>

    ScriptAlias /perl-app/ "/var/www/focusnic.biz.id/public_html/perl-app/"
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```
Create a directory:
```
mkdir -p /var/www/focusnic.biz.id/public_html/perl-app/
```
Next is to create a simple Perl script:
```
nano /var/www/focusnic.biz.id/public_html/perl-app/hello.pl
```
Fill in the following script:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/public_html/perl-app/hello.pl"
#!/usr/bin/perl
print "Content-type: text/html\n\n";
print "<html><head><title>Perl Apache</title></head><body><h1>Perl on Apache!</h1></body></html>";
```
Adjust the following permissions:
```
chmod 755 /var/www/focusnic.biz.id/public_html/perl-app/hello.pl
```
Then, if you use SELinux, please allow the following file to execute:
```
chcon -t httpd_sys_script_exec_t /var/www/*/public_html/perl-app/ -R
```
Then restart Apache:
```
apachectl configtest
systemctl restart httpd
```
Open in browser `http://$DOMAIN_NAME/perl-app/hello.pl`<br/>
![](/img/almalinux8-perl.jpg)<br/>

## Troubleshooting
1. Internal Server Error (500) when opening Perl script <br/>

Make sure the file has execute rights:
```
chmod 755 /var/www/focusnic.biz.id/public_html/perl-app/hello.pl
```
Make sure the first line of the file is:
```
#!/usr/bin/perl
```
Then also check SELinux, please allow execute script:
```
chcon -t httpd_sys_script_exec_t /var/www/*/public_html/perl-app/ -R
```
Check Apache error log:
```
tail -f /var/log/httpd/$NAMA_DOMAIN-error.log
```

2. Perl files are not executed, instead they are displayed as text <br/>

This is usually caused by `mod_cgi` not being enabled, or the `AddHandler cgi-script .pl` parameter not being added. Please enable the `.pl` handler.
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
AddHandler cgi-script .pl .cgi
Options +ExecCGI
```

3. Forbidden or 403 Access Denied <br/>

This is usually caused by overly restrictive directory/file permissions and the `Require all granted` parameter not being set. Please add the following configuration:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<Directory "/var/www/focusnic.biz.id/public_html/perl-app">
    Require all granted
</Directory>
```

4. perl command not found<br/>

Perl is not installed correctly. Please reinstall Perl with the following command:
```
dnf reinstall perl
```
Then verify:
```
which perl
```

## Conclusion
Perl remains highly relevant for certain server-side applications, and integrating it with Apache provides great flexibility for automation, monitoring, and dynamic web-based data processing.

If you need **professional assistance in server installation or optimal cloud hosting configuration**, visit ***Focusnic*** immediately.

Q: Is Perl installed by default on AlmaLinux 8? <br/>
A: Not always. Some minimal versions of AlmaLinux 8 don't include Perl, but you can install it via `dnf`.

Q: Can I use extensions other than `.pl` for Perl scripts? <br/>
A: Yes. You can use `.cgi` and configure Apache to recognize it using `AddHandler`.

Q: Do I have to use `mod_cgi`? <br/>
A: Yes, if you want to execute Perl scripts via Apache. This module is responsible for connecting HTTP requests to the Perl interpreter.

Q: Can I run Perl in specific subdirectories only? <br/>
A: Yes. Use the `<Directory>` configuration to restrict execution to specific folders.

Q: Is it safe to use Perl in a production environment? <br/>
A: It is safe, as long as you implement best practices such as: restricting access rights, avoiding unvalidated input, and regularly monitoring logs.

Q: What if I want to develop a Perl-based web application like `CGI.pm` or `Dancer`? <br/>
A: Install additional modules using CPAN:
```
dnf install perl-CPAN -y
cpan Dancer
```
