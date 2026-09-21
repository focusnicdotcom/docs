---
title: Userdir
description: How to Configure Userdir Apache on AlmaLinux 8
sidebar_position: 4
sidebar_label: Userdir
---

In the world of Linux-based system administration, the use of user directories or `Userdir` is one of the most practical solutions to provide private web access to each system user. By enabling and configuring the `Userdir` module in Apache Web Server on AlmaLinux 8 systems, we allow each user to serve their own web pages via URLs such as `http://server/~username` or `http://IP_ADDRESS_SERVER/~username`. This guide will cover `Userdir` configuration in depth, step by step, complete with security tips and best optimizations for Apache web server performance on AlmaLinux 8.

The `mod_userdir` module is part of the Apache HTTP Server that allows user-specific directories in `~/public_html` to be accessed via the web. This feature is very popular in education and development environments as it allows any user to create and manage their own web without having to have root access or edit the main server configuration.

## Prerequisites

- Full `root` access
- Apache/HTTPD already installed
- Basic Linux Command Line
- Security
- Each user already has a home directory at `/home/username`

## Userdir Configuration
Run the following command to make sure Apache is installed:
```
dnf install httpd -y
```
Get Apache up and running:
```
systemctl enable --now httpd
```
If using firewalld, make sure the firewall allows HTTP and HTTPS:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

In AlmaLinux 8, the `mod_userdir` module is available by default. However, it is necessary to ensure that its configuration is correct. Open the userdir.conf configuration file:
```
nano /etc/httpd/conf.d/userdir.conf
```
Verify the contents of the file:
```jsx showLineNumbers title="/etc/httpd/conf.d/userdir.conf"
<IfModule mod_userdir.c>
    UserDir enabled
    UserDir public_html
</IfModule>

<Directory "/home/*/public_html">
    AllowOverride FileInfo AuthConfig Limit Indexes
    Options MultiViews Indexes SymLinksIfOwnerMatch IncludesNoExec
    Require method GET POST OPTIONS
</Directory>
```
Or make sure with the following command:
```
httpd -M |grep userdir
```
Here's an example of the output:
```
userdir_module (shared)
```

Brief explanation:

- `UserDir public_html` → Specifies the directory name used in the home user.
- `UserDir enabled user1 user2` → Only allow the specified user to use Userdir.
- `<Directory "/home/*/public_html">` → Set access rights and allowed options.

Once the configuration is complete, restart Apache:
```
apachectl configtest
systemctl restart httpd
```
Before a user can use the `Userdir` directory, they must of course have an account on the system. We can add a new user using the following command:
```
adduser focusnic
passwd focusnic
```
Each user who wants to host a site through `Userdir` must have a `public_html` directory in their home. Perform the following steps for each user:
```
mkdir /home/focusnic/public_html
chmod 711 /home/focusnic
chmod 755 /home/focusnic/public_html
chown -R focusnic:focusnic /home/focusnic/public_html
```
Place the HTML file or user website in the `public_html` directory. Example:
```
echo "<h1>Halo dari Userdir</h1>" > /home/focusnic/public_html/index.html
```
If SELinux is on, make sure httpd has permission to access the user's home directory:
```
setsebool -P httpd_enable_homedirs true
chcon -R -t httpd_user_content_t /home/focusnic/public_html
```
Access via browser: `http://ip-server/~focusnic/`
![](/img/almalinux8-userdir.png)<br/>

### Userdir Production

The following are best practices in implementing `Userdir` in a production environment on Apache Web Server AlmaLinux 8, to keep it secure, stable, and well managed:

1. Limit Users Allowed to Use `Userdir`<br/>

The default configuration of `UserDir enabled` will allow all users to serve web content, which is a big risk in production environments. We recommend using the following configuration:
```jsx showLineNumbers title="/etc/httpd/conf.d/userdir.conf"
<IfModule mod_userdir.c>
    UserDir disabled
    UserDir public_html
    Userdir enabled user_1 user_2 user_3
</IfModule>
```

2. Restrict Access and Options of `public_html` Directory<br/>

Use a minimalistic and secure configuration to prevent abuse. Use `AllowOverride All` only when absolutely necessary, as `.htaccess` can create security risks and slow down performance:
```
<Directory "/home/*/public_html">
    AllowOverride none
    Options -Indexes -ExecCGI -Includes
    Require all granted
</Directory>
```

3. Enable SELinux HomeDir Access for Apache<br/>
```
setsebool -P httpd_enable_homedirs 1
chcon -R -t httpd_user_content_t /home/*/public_html
```

## Troubleshooting

1. Accessing `http://server/~username` Results in a 403 Forbidden Error<br/>

The home or public_html directory permissions are incorrect, or SELinux is denying Apache access to the user's home page. Solution:
```
chmod 755 /home/username
chmod 755 /home/username/public_html
chcon -R -t httpd_user_content_t /home/username/public_html
setsebool -P httpd_enable_homedirs 1
```

2. Error 404 Not Found When Accessing `http://server/~username`<br/>

The index.html file does not exist in public_html, the user is not included in the `UserDir enabled` list, and Apache has not been restarted after the change. Solution:
```
echo "<h1>Halo dari Userdir</h1>" > /home/username/public_html/index.html
```
Add user to `Userdir` configuration:
```jsx showLineNumbers title="/etc/httpd/conf.d/userdir.conf"
UserDir enabled username
```
Restart Apache:
```
systemctl restart httpd
```

3. `Userdir` Access Successful, But CSS/JS Not Loaded<br/>

The file does not have the appropriate permissions or the relative URL is incorrect. Solution:
```
chmod 644 /home/username/public_html/*.css
chmod 644 /home/username/public_html/*.js
```

4. Cannot Execute PHP File in `Userdir`<br/>

`mod_php` or `php-fpm` is not configured for `public_html` or Apache does not allow PHP execution in `Userdir`. Solution:

- Add PHP configuration to VirtualHost if needed
- For security reasons, it is recommended to **not allow PHP in Userdir** in production environments.

5. Apache Could Not Find the `Userdir` Directory<br/>

**Common Causes:**

- The `mod_userdir` module is not enabled
- The `userdir.conf` file is not loaded by Apache

**Solution:**

- Make sure the file `/etc/httpd/conf.d/userdir.conf` exists
- Check the module's existence by:
    ```    
    httpd -M | grep userdir
    ```
- Restart Apache:
    ```
    systemctl restart httpd
    ```

## Conclusion

Enabling and configuring **Userdir on Apache Web Server in AlmaLinux 8** is an efficient way to provide private web hosting services for each user without having to configure VirtualHosts individually. With this approach, users can access their pages via `http://server/~username`.

However, this configuration needs to be done carefully in a production environment, taking into account:

- Correct directory access rights
- Controlling who can use Userdir
- Security measures to prevent malicious script files from being executed
- Firewall and SELinux adjustments

If configured properly, this feature is very useful in educational environments, internal development, and even shared web hosting needs.

If you need professional server configuration or cloud VPS management assistance, don't hesitate to contact *Focusnic*** — your trusted partner in building secure and optimal server infrastructure.

Q: What is `Userdir` in Apache?<br/>
A: `Userdir` is an Apache feature that allows users to store their web pages in the `~/public_html` directory, which can be accessed via the URL `http://server/~username`.

Q: How do I enable Userdir for a specific user only?<br/>
A: Edit the /etc/httpd/conf.d/userdir.conf file and use:
```jsx showLineNumbers title="/etc/httpd/conf.d/userdir.conf"
UserDir disabled
UserDir enabled user1 user2
```

Q: Why do I get a 403 error when accessing `Userdir`?<br/>
A: This is usually because the directory permissions are incorrect or SELinux is denying access. Use the command:
```
chmod 711 /home/username
chmod 755 /home/username/public_html
chcon -R -t httpd_user_content_t /home/username/public_html
```

Q: Is Userdir suitable for use on production servers?<br/>
A: Yes, as long as it's secure. However, for professional or commercial scenarios, using VirtualHosts and subdomains is recommended for greater flexibility and security.

Q: Can I enable SSL (HTTPS) for `Userdir`?<br/>
A: Let's Encrypt SSL certificates are only valid for domains/subdomains, not paths like `~username`. To use SSL, consider creating a subdomain (user.domain.com)
and pointing it to the user directory with a VirtualHost.
