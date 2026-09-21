---
title: SSL
description: How to Configure SSL/TLS and SSL Let's Encrypt Apache on AlmaLinux 8
sidebar_position: 3
sidebar_label: SSL/TLS
---
When building a secure and reliable website, the use of SSL (Secure Socket Layer) is an absolute must, especially when using Apache Web Server on the AlmaLinux operating system 
8. In this guide, we will comprehensively and technically discuss the two types of SSL certificates: Self-Signed SSL and SSL from Let's Encrypt, and how to configure both in a complete and practical manner. All the steps described apply directly to Apache Web Server on AlmaLinux 8, and are organized to make it easy to manage the server independently or professionally.

## Why SSL is Important?
SSL is not just a security feature. Google and other search engines give better SEO ratings to sites that use HTTPS. Visitors also trust and feel more secure when accessing sites with a green padlock icon in their browser. Therefore, SSL configuration is a key foundation for the success of modern sites, especially when using Apache Web Server on AlmaLinux 8, an operating system popular with enterprises and VPS providers.

## Prerequisite
- Full `root` access
- Apache/HTTPD already installed
- Basic Linux Command Line
- Security
- Virtual Host
- Domain Name (VALID FQDN)

## Configure Self Signed SSL
Make sure Apache is installed. If not, please run the following command to install Apache:
```
dnf install httpd -y
systemctl enable --now httpd
```
Install OpenSSL modules:
```
dnf install mod_ssl openssl -y
```
Allow HTTP and HTTPS services on the firewalld if using them:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```
Self-Signed SSL is suitable for development or internal server environments. Here are the steps:
```
mkdir /etc/ssl/private
openssl req -nodes -newkey rsa:2048 -keyout /etc/ssl/private/private.key -out /etc/ssl/private/request.csr
```
Fill in information such as Country, State, Organization, and Common Name (domain):
```
writing new private key to '/etc/ssl/private/private.key'
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [XX]:ID
State or Province Name (full name) []:YK
Locality Name (eg, city) [Default City]:YK
Organization Name (eg, company) [Default Company Ltd]:IT
Organizational Unit Name (eg, section) []:IT
Common Name (eg, your name or your server's hostname) []:localhost
Email Address []: [ENTER]

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []: [ENTER]
An optional company name []: [ENTER]
```
Then generate SSL certificate for 10 years:
```
openssl x509 -in /etc/ssl/private/request.csr \
-out /etc/ssl/private/certificate.crt \
-req -signkey /etc/ssl/private/private.key -days 3650
```
Verify:
```
ls -lah /etc/ssl/private/
```
Sample output:
```
total 12K
drwxr-xr-x. 2 root root   67 Jul 12 17:04 .
drwxr-xr-x. 3 root root   34 Jul 12 17:02 ..
-rw-r--r--. 1 root root 1.2K Jul 12 17:04 certificate.crt
-rw-------. 1 root root 1.7K Jul 12 17:02 private.key
-rw-r--r--. 1 root root  980 Jul 12 17:03 request.csr
```
Edit or create a new Virtual hosts configuration file:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```

```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:443>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined

    SSLEngine on
    SSLCertificateFile /etc/ssl/private/certificate.crt
    SSLCertificateKeyFile /etc/ssl/private/private.key
</VirtualHost>
```
Create a directory and grant appropriate permissions:
```
mkdir -p /var/www/focusnic.biz.id/public_html
chown -R apache:apache /var/www/focusnic.biz.id
```
Create a simple `index.html` file to test the virtual host:
```
echo "<h1>Selamat Datang di focusnic.biz.id</h1>" > /var/www/focusnic.biz.id/public_html/index.html
```
Then restart Apache:
```
apachectl configtest
systemctl restart httpd
```

Open a browser and access the domain for example `https://focusnic.biz.id`
![](/img/almalinux8-ssl-self-signed.png)<br/>

## Let's Encrypt SSL Configuration
:::info
Let's encrypt provides free SSL per 3 months and must be renewed. If you want a paid SSL Certificate please purchase with vendors such as Sectigo, Digicert, etc.
:::

Let's Encrypt provides free and publicly valid certificates. Use Certbot for automation:
```
dnf install epel-release -y
dnf install certbot python3-certbot-apache -y
```
Create Virtual host:
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
Create a directory and grant appropriate permissions:
```
mkdir -p /var/www/focusnic.biz.id/public_html
chown -R apache:apache /var/www/focusnic.biz.id
```

Create a simple `index.html` file to test the virtual host:
```
echo "<h1>Selamat Datang di focusnic.biz.id</h1>" > /var/www/focusnic.biz.id/public_html/index.html
```
Restart apache:
```
apachectl configtest
systemctl restart httpd
```
Before running Certbot, make sure the domain DNS is pointed to the server IP. Run:
```
certbot --apache -d focusnic.biz.id
```
Follow the instructions provided and fill in the appropriate data:
```
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Enter email address (used for urgent renewal and security notices)
 (Enter 'c' to cancel): admin@focusnic.biz.id

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Please read the Terms of Service at
https://letsencrypt.org/documents/LE-SA-v1.5-February-24-2025.pdf. You must
agree in order to register with the ACME server. Do you agree?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o: Y

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Would you be willing, once your first certificate is successfully issued, to
share your email address with the Electronic Frontier Foundation, a founding
partner of the Let's Encrypt project and the non-profit organization that
develops Certbot? We'd like to send you email about our work encrypting the web,
EFF news, campaigns, and ways to support digital freedom.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o: No
Account registered.

Requesting a certificate for focusnic.biz.id

Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/focusnic.biz.id/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/focusnic.biz.id/privkey.pem
This certificate expires on 2025-10-10.
These files will be updated when the certificate renews.
Certbot has set up a scheduled task to automatically renew this certificate in the background.

Deploying certificate
Successfully deployed certificate for focusnic.biz.id to /etc/httpd/conf.d/focusnic.biz.id-le-ssl.conf
Congratulations! You have successfully enabled HTTPS on https://focusnic.biz.id

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
If you like Certbot, please consider supporting our work by:
 * Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
 * Donating to EFF:                    https://eff.org/donate-le
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```
Verify SSL:
```
certbot certificates
```
Sample output:
```
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Found the following certs:
  Certificate Name: focusnic.biz.id
    Serial Number: 69d31f4e4ec275357d4edc0f9309998cbc7
    Key Type: RSA
    Domains: focusnic.biz.id
    Expiry Date: 2025-10-10 09:31:50+00:00 (VALID: 89 days)
    Certificate Path: /etc/letsencrypt/live/focusnic.biz.id/fullchain.pem
    Private Key Path: /etc/letsencrypt/live/focusnic.biz.id/privkey.pem
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```
Access the domain through a browser, here is an example output:
![](/img/almalinux8-ssl-letsencrypt.png)<br/>

Certbot can renew automatically 30 days before SSL expires, to test it please run the following command:
```
certbot renew --dry-run
```
Here's an example of the output:
```
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Processing /etc/letsencrypt/renewal/focusnic.biz.id.conf
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Account registered.
Simulating renewal of an existing certificate for focusnic.biz.id

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Congratulations, all simulated renewals succeeded: 
  /etc/letsencrypt/live/focusnic.biz.id/fullchain.pem (success)
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```
## Troubleshooting
1. Port `443` is not open. Make sure port `443` is open on the firewall:
```
firewall-cmd --add-service=https --permanent
firewall-cmd --reload
```
2. Invalid certificate error. For Self-Signed SSL, the browser does mark it invalid. For Let's Encrypt, make sure the domain DNS is valid and public.
3. Apache cannot be restarted. Check the Apache configuration:
```
apachectl configtest
```

## Conclusion
Configuring SSL on **Apache Web Server on AlmaLinux 8** is essential to ensure data security between the user and the server, as well as providing trust to visitors to 
sites. There are two main methods of installing SSL:

1. **SSL Self-Signed**
    - Suitable for testing, development, and internal networks.
    - Manually generated using OpenSSL.
    - Not trusted by public browsers as it is not from a Certificate Authority (CA).
2. **SSL Let's Encrypt**
    - Suitable for production and public websites.
    - Free, globally valid, and automatically renewed.
    - Uses *Certbot* for installation and auto-renewal.

In addition, we have also discussed how to open ports, set up firewalls, redirect from HTTP to HTTPS, and enable HSTS to increase security. If you need professional assistance in VPS server and cloud installation, don't hesitate to ***Focusnic*** as a reliable and trusted solution.

| Feature | SSL Self-Signed | SSL Let's Encrypt |
| --- | --- | --- |
| Browser Validity | Not trusted (not secure) | Trusted by all browsers |
| Cost | Free | Free |
| Automation | Manual | Automate with Certbot |
| Ideal For | Testing and Internal Server | Production, Public Website |
| Validity Period | Freely specified | 90 days (extendable) |

Q: What is Self-Signed SSL and when should it be used? <br/>
A: Self-Signed SSL is a certificate that is self-signed by the server owner. It is suitable for use in internal, testing, or development environments, as it is not recognized by common browsers.

Q: Is SSL Self-Signed secure? <br/>
A: Encryption-wise, Self-Signed SSL is as secure as SSL from an authorized CA, but it cannot be trusted by browsers, so it usually shows a “Your connection is not private” warning.

Q: What are the advantages of Let's Encrypt SSL over Self-Signed SSL? <br/>
A: Trusted by all browsers, auto-updates, free, and ideal for production and public websites.

Q: How do I automatically renew my Let's Encrypt certificate? <br/>
A: Let's Encrypt uses Certbot, and is scheduled to auto-renew via systemd timer. You can check this with: `certbot renew --dry-run`

Q: Is AlmaLinux 8 compatible with SSL and Let's Encrypt? <br/>
A: Yes, AlmaLinux 8 is highly compatible with all types of SSL, including Let's Encrypt. Its certifications and security systems are on par with other enterprise distributions such as RHEL and CentOS.

Q: Do I need to open a specific port for SSL to work?
A: Yes, you need to open the port:

- **80/tcp** for HTTP
- **443/tcp** for HTTPS

Q: Can I use SSL wildcards with Let's Encrypt? <br/>
A: Yes, but it requires DNS verification and cannot use normal HTTP methods. Suitable if you are using multiple subdomains.

Q: Are Let's Encrypt SSL certificates valid forever? <br/>
A: No, they are not. Each certificate is only valid for 90 days, but can be automatically renewed using Certbot.

Q: Can I use both types of SSL at the same time? <br/>
A: Not recommended. Use Let's Encrypt SSL for public environments, and Self-Signed SSL for internal or development needs only.

