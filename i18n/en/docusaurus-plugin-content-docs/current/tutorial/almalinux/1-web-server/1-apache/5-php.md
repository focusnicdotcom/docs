---
title: PHP
description: How to Install PHP on Apache in AlmaLinux 8
sidebar_position: 5
sidebar_label: PHP
---

In the world of modern web development, PHP and Apache Web Server are two essential, complementary components. Both dominate server-side hosting environments for various companie  and individuals managing CMS-based websites like WordPress, Joomla, Laravel, and others. This guide will cover how to install PHP on Apache Web Server AlmaLinux 8 in detail, from package installation to configuration testing.

## Prerequisites

- Full `root` access
- Apache/HTTPD installed
- Basic Linux Command Line
- Security

## PHP Installation

The first step before installing PHP is to ensure that your system is up to date and ready to use.
```
dnf update -y
dnf install epel-release -y
```
After updating the system, we need to ensure that Apache Web Server (httpd) is installed. If it isn't, install it with the following command:
```
dnf install httpd -y
systemctl enable --now httpd
```
If you are using a firewall (such as firewalld), make sure the HTTP and HTTPS ports are open:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```
AlmaLinux 8 provides certain PHP versions by default. However, to get the latest version or a specific version like PHP 7.4, PHP 8.0, or PHP 8.1, we need to add the Remi repository.

Install Remi repository:
```
dnf install -y https://rpms.remirepo.net/enterprise/remi-release-8.rpm
```
Then list the available PHP using the following command:
```
dnf module list php
```
Sample output:
```
AlmaLinux 8 - AppStream
Name                               Stream                                 Profiles                                                 Summary                                            
php                                7.2 [d]                                common [d], devel, minimal                               PHP scripting language                             
php                                7.3                                    common [d], devel, minimal                               PHP scripting language                             
php                                7.4                                    common [d], devel, minimal                               PHP scripting language                             
php                                8.0                                    common [d], devel, minimal                               PHP scripting language                             
php                                8.2                                    common [d], devel, minimal                               PHP scripting language                             

Remi's Modular repository for Enterprise Linux 8 - x86_64
Name                               Stream                                 Profiles                                                 Summary                                            
php                                remi-7.2                               common [d], devel, minimal                               PHP scripting language                             
php                                remi-7.3                               common [d], devel, minimal                               PHP scripting language                             
php                                remi-7.4                               common [d], devel, minimal                               PHP scripting language                             
php                                remi-8.0                               common [d], devel, minimal                               PHP scripting language                             
php                                remi-8.1                               common [d], devel, minimal                               PHP scripting language                             
php                                remi-8.2                               common [d], devel, minimal                               PHP scripting language                             
php                                remi-8.3                               common [d], devel, minimal                               PHP scripting language                             
php                                remi-8.4                               common [d], devel, minimal                               PHP scripting language                             

Hint: [d]efault, [e]nabled, [x]disabled, [i]nstalled
```
Enable the desired PHP module version. For example, for PHP 8.4, use:
```
dnf module reset php -y
dnf module enable php:remi-8.4 -y
```
Once the repository is active, we can proceed with installing PHP along with the commonly used essential modules:
```
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json
```
Check the installed PHP version:
```
php -v
```
Here is an example of the output:
```
PHP 8.4.10 (cli) (built: Jul  2 2025 02:22:42) (NTS gcc x86_64)
Copyright (c) The PHP Group
Built by Remi's RPM repository <https://rpms.remirepo.net/> #StandWithUkraine
Zend Engine v4.4.10, Copyright (c) Zend Technologies
    with Zend OPcache v8.4.10, Copyright (c), by Zend Technologies
```
To see the installed PHP modules, run the following command:
```
php -m
```

## Configure Apache for PHP Compatibility

Once PHP is successfully installed, we need to configure Apache to run PHP scripts. If you use `mod_php`, Apache will automatically recognize .php files once the relevant module is installed. Ensure the Apache configuration file in `/etc/httpd/conf.d/php.conf` contains the following directive:

```jsx showLineNumbers title="/etc/httpd/conf.d/php.conf"
AddType text/html .php
DirectoryIndex index.php
```

Restart Apache for the changes to take effect:
```
apachectl configtest
systemctl restart httpd
```
To test whether the PHP installation was successful and can be run through Apache, create a test file in the root directory of the web server:
```
echo "<?php phpinfo(); ?>" | tee /var/www/html/info.php
```
Access the file through a browser by typing your server's IP address or domain: `http://IP_ADDRESS_SERVER/info.php`. If the PHP Info page appears, PHP has been successfully integrated with Apache.
![](/img/almalinux8-php84.jpg)<br/>

### PHP Production

Some important settings that are often modified when running PHP in a production environment.

| Parameters | Main Functions | Production Recommendations |
| --- | --- | --- |
| `expose_php = Off` | Hides the PHP version from the `X-Powered-By` HTTP header. Prevents system information from leaking. | ✅ Must be disabled |
| `display_errors = Off` | Disables display of errors to the browser. Protects against sensitive information. | ✅ Must be disabled |
| `log_errors = On` | Enables logging of all errors to an internal log file. Very useful for debugging. | ✅ Required |
| `error_log = /var/log/php_errors.log` | Location of the PHP error log file. Make sure this file is writable by PHP-FPM. | ✅ Recommended |
| `memory_limit = 512M` | The maximum memory limit used by a single PHP script process. Avoid setting it too small or too large. | ✅ As needed |
| `upload_max_filesize = 128M` | The maximum file size that can be uploaded via the form. | ✅ Adjust to your needs |
| `post_max_size = 128M` | Total POST data size limit (including file uploads). Must be ≥ `upload_max_filesize`. | ✅ Customize |
| `max_execution_time = 300` | Maximum script execution time (in seconds). Protects against scripts that loop too long. | ✅ Required setting |
| `date.timezone = Asia/Jakarta` | Specifies the server's time zone. Important for log times, cache, cron, etc. | ✅ Customize locale |

To modify `php.ini`, go to `/etc/php.ini`. After making the modifications, restart php-fpm:
```
systemctl restart php-fpm
```

The PHP-FPM configuration is located in `/etc/php-fpm.d/www.conf`. The following parameters can be adjusted:
:::info
Performance tips: Adjust `pm.max_children` to the server's RAM capacity.
:::
```jsx showLineNumbers title="/etc/php-fpm.d/www.conf"
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
```
After making changes to php-fpm, please restart the php-fpm service:
```
systemctl restart php-fpm
```

The following is an explanation of the parameters above:
```
Request Incoming
      ↓
[ Idle Worker ]  ←--- set by min/max_spare_servers
      ↓
[ Active Process ]
      ↓
[ Done → idle again or stopped ]
```

1. `pm` <br/>

This mode determines the **process management mode**.

- `static`: the number of worker processes is fixed (constant).
- `dynamic`: processes are created and terminated as needed.
- `ondemand`: processes are created only when requested and terminated when idle.

**`dynamic`** is the most common and is suitable for production servers with variable traffic.

2. `pm.max_children` <br/>

The **maximum number of PHP processes** (child processes) that may run simultaneously.

- This is the upper limit. If more than 50 PHP requests are active, the remaining requests will be queued until a worker is free.
- Too large → risks consuming RAM and swap.
- Too small → bottlenecks, slow response during high traffic.

```
(Total RAM - RAM for the system) / memory per PHP process
```
Example: If a single PHP process takes approximately 30MB, and the server has 2GB of RAM:
```
(2048MB - 512MB OS) / 30MB ≈ 51
```

3. `pm.start_servers` <br/>

Number of PHP-FPM processes **that are immediately created when the service is first started**.

- Too small → the initial request will wait for the worker to be created.
- Too large → high RAM consumption when idle.

**5** is a safe value for servers with moderate traffic.

4. `pm.min_spare_servers` <br/>

Minimum number of **idle processes** (ready to use but not active).

- If the idle process is less than this, PHP-FPM will create a new process.
- Keep the system responsive to sudden requests.

5. `pm.max_spare_servers` <br/>

Maximum number of **idle processes** (not active but waiting for requests).

- If it's higher than this value, PHP-FPM will **terminate** some idle processes.
- Save RAM during low traffic times.


## Troubleshooting

1. Apache Not Executing PHP Files (Files Downloaded)

When accessing `.php`, the browser downloads the file instead of executing it. The solution is to ensure the following configuration is in place in the VirtualHost or global configuration:
```jsx showLineNumbers title="/etc/httpd/conf.d/php.conf"
<FilesMatch \.php$>
    SetHandler "proxy:unix:/run/php-fpm/www.sock|fcgi://localhost"
</FilesMatch>
```

Also make sure php-fpm is running:
```
systemctl status php-fpm
```

2. PHP Not Installed or Incompatible Version

`php -v` did not return information, or the PHP version is not as expected. Make sure you are using the Remi repository:
```
dnf install -y https://rpms.remirepo.net/enterprise/remi-release-8.rpm
dnf module reset php -y
dnf module enable php:remi-8.4 -y
dnf install php
```

3. 500 Internal Server Error when Accessing PHP Files

The website displays a 500 error when executing a PHP file. This is usually caused by incorrect file/directory permissions. Ensure the file permissions are `644` and the directory permissions are `711` or `755`. Troubleshoot by enabling error logging:
```jsx showLineNumbers title="/etc/php.ini"
log_errors = On
error_log = /var/log/php_errors.log
```

4. phpinfo() Not Showing

Make sure the info.php file is placed in the DocumentRoot:
```
<?php phpinfo(); ?>
```

5. PHP-FPM High CPU Usage

The php-fpm process is using up to 100% CPU. This is usually caused by application code or a possible compromised script. Please mitigate this by disabling the following functions:
```jsx showLineNumbers title="/etc/php.ini"
disable_functions = exec,passthru,shell_exec,system
```

6. Slow PHP Requests or Timeouts

The site is very slow or unresponsive during high traffic. Check if `pm.max_children` is large enough. If it isn't, processes will be queued. Use the following command to check:
```
ps -ylC php-fpm --sort:rss
```

## Conclusion

Installing PHP on Apache Web Server on AlmaLinux 8 is a crucial step in building a robust, production-ready hosting server. By utilizing the Remi repository, we can choose the PHP version that best suits the needs of modern applications. Integration with PHP-FPM via FastCGI also provides high performance and efficiency, ideal for production environments.

The steps discussed include:

- System updates and Apache installation
- Installing PHP and additional modules
- Activating the PHP version via Remi
- Integrating with Apache
- Testing functionality with the `phpinfo()` file
- Adjusting configurations for security and performance

With this approach, your server is ready to run a CMS, framework, or custom PHP application efficiently, securely, and stably.

If you want a fast, secure, and optimized PHP installation without the hassle of manual configuration, don't hesitate to choose Focusnic—the best solution for professional server and cloud VPS installations.

Q: Is it mandatory to use the Remi repository?<br/>
A: Yes, if you want to use the latest or specific PHP version (such as PHP 8.1). The default AlmaLinux repository only provides the default version, which may be too old for a modern application.

Q: What's the difference between mod_php and php-fpm?<br/>
A:
- `mod_php`: PHP runs within the Apache process. Simpler but less efficient.
- `php-fpm`: PHP runs separately via FastCGI. More efficient, stable, and scalable for production.

Q: Can I install more than one version of PHP?<br/>
A: Yes, using the dnf module install and managing versions via alternatives or a separate php-fpm pool. However, it requires advanced configuration and careful consideration.

Q: Where is the main PHP configuration file located?<br/>
A:
- Global: `/etc/php.ini`
- FPM: `/etc/php-fpm.d/www.conf`

Q: How do I know which PHP modules are installed?<br/>
A: Use the command: `php -m`

Q: What's the difference between pm = dynamic and pm = ondemand?<br/>
A:
- `dynamic`: creates a number of workers from the start, suitable for fluctuating traffic.
- `ondemand`: processes are only created when a request arrives, saving more RAM but being slower to respond to the first request.

Q: How do I know what the ideal pm.max_children value is?<br/>
A: Measure the average memory usage per process: `ps -ylC php-fpm --sort:rss`. Then calculate it based on the server's total RAM:
```
(Total RAM - System) / RAM per PHP process ≈ max_children
```

Q: Should I use socket (/run/php-fpm/www.sock) or TCP (127.0.0.1:9000)?<br/>
A:
- **Socket** is faster and more efficient for a single server (default: `/run/php-fpm/www.sock`).
- **TCP** is used if Apache and PHP-FPM are on separate servers or in different containers.

Q: Can PHP-FPM be used with Apache and Nginx simultaneously?<br/>
A: Yes, as long as each web server points to a different PHP-FPM pool or through the correct proxy.

Q: How can I tell if max_children is too small?<br/>
A: Look at the PHP-FPM error log.
```jsx showLineNumbers title="/var/log/php-fpm/error.log"
[WARNING] server reached pm.max_children setting (50), consider raising it
```
