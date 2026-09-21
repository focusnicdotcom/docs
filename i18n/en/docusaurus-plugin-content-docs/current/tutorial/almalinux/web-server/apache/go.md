---
title: Go
description: How to Install and Configure Go (Golang) on Apache in AlmaLinux 8
sidebar_position: 12
sidebar_label: Go
---

In the era of modernizing server-side technology, the use of the **Go (Golang)** programming language is increasingly popular due to its high efficiency and very fast runtime performance. For users of enterprise-based operating systems such as **AlmaLinux 8**, integrating **Go** into the **Apache Web Server** environment can open up many opportunities in developing scalable, lightweight, and secure web applications. This guide will provide a complete guide from installation, configuration, to best practices for running Go applications on Apache.

## Prerequisites
- Full `root` access
- Apache/HTTPD installed
- Basic Linux Command Line
- Security
- Domain (optional)

## Install Go

Before starting the installation process, make sure that the AlmaLinux 8 operating system has been updated to the latest version and has root access or is using an account with sudo rights:
:::info
This step will ensure the system has the basic dependencies to compile Go applications and support Apache modules if needed.
:::
```
dnf update -y
dnf groupinstall "Development Tools" -y
```
AlmaLinux 8 doesn't provide the latest Go packages in the default repositories. Therefore, we need to download them directly from the official website:
```
wget https://go.dev/dl/go1.24.5.linux-amd64.tar.gz
```
Extract and set PATH Environment:
```
tar -C /usr/local -xzf go1.24.5.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
source ~/.bash_profile
```
Verify installation:
```
go version
```
Example output:
```
go version go1.24.5 linux/amd64
```

## Apache Reverse Proxy Configuration for Go
:::info
Apache, by default, cannot directly run Go applications like PHP or Python. Therefore, we need to use a reverse proxy via `mod_proxy` or leverage `CGI` (Common Gateway Interface) to bridge Go application execution with Apache.
:::
Make sure Apache is installed, if it is not installed, please run the following command:
```
dnf install httpd -y
systemctl enable --now httpd
```

Make sure port 80/443 is opened when using firewalld, run the following command:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

Verify Apache proxy module:
```
apachectl -M | grep proxy
```

Example output:
```
proxy_module (shared)
proxy_http_module (shared)
```

Create a virtualhost for a Go application:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```

Fill in the following parameters:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id

    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass / http://localhost:8080/
    ProxyPassReverse / http://localhost:8080/

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

The directory structure and file placement within a Go project are crucial for easy management, development, and deployment — especially if you want to run your Go application under Apache using a reverse proxy.
```
/var/www/focusnic.biz.id
├── go.mod
├── go.sum
├── hello.go
├── hello         # ← binary build
```

| File/Folder | Description |
| --- | --- |
| `/var/www/focusnic.biz.id` | Go application project root directory |
| `hello.go` | Your main Go source file (containing the `http.HandleFunc` code) |
| `hello` | Binary build results from `go build -o hello hello.go` |
| `go.mod` | Go module files (automatically created with `go mod init`) |

Create a directory on the virtualhost above to store the Go source code:
```
mkdir -p /var/www/focusnic.biz.id
```

Restart Apache:
```
systemctl restart httpd
```

## Setting Up a Simple Go App

Here is a **simple Go (Golang) application** that can be accessed through an **Apache Web Server** (using a reverse proxy) and displays:

- **Server time (current time)**
- **Operating system**
- **Go version used**

Create a `hello.go` file in the previously created directory:
```
cd /var/www/focusnic.biz.id
nano hello.go
```

Fill in the following script:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/hello.go"
package main

import (
	"fmt"
	"net/http"
	"runtime"
	"time"
)

func handler(w http.ResponseWriter, r *http.Request) {
	currentTime := time.Now().Format("2006-01-02 15:04:05")
	os := runtime.GOOS
	goVersion := runtime.Version()

	html := fmt.Sprintf(`
		<html>
		<head>
			<title>Info Server Go</title>
			<style>
				body { font-family: Arial, sans-serif; background: #f2f2f2; padding: 40px; }
				.card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); max-width: 500px; margin: auto; }
				h1 { font-size: 24px; color: #333; }
				p { font-size: 18px; color: #666; }
			</style>
		</head>
		<body>
			<div class="card">
				<h1>Info Server Go</h1>
				<p><strong>Server Time:</strong> %s</p>
				<p><strong>Operating System:</strong> %s</p>
				<p><strong>Go Version:</strong> %s</p>
			</div>
		</body>
		</html>
	`, currentTime, os, goVersion)

	fmt.Fprint(w, html)
}

func main() {
	http.HandleFunc("/", handler)
	http.ListenAndServe(":8080", nil)
}
```

Then build the application by running the following command:
```
go build -o hello hello.go
```

Then run the Go application which has become a binary called `hello`:
```
./hello
```

After that, open the browser and navigate to the domain or IP that has been created on the virtual host `http://$DOMAIN`<br/>
![](/img/almalinux8-go.jpg)<br/>

### Systemd Service for Go Applications

To make Go applications run automatically at boot time, we can add a `systemd service`:
```
nano /etc/systemd/system/hellogo.service
```
Fill in the following parameters
```jsx showLineNumbers title="/etc/systemd/system/hellogo.service"
[Unit]
Description=Go App
After=network.target

[Service]
ExecStart=/var/www/focusnic.biz.id/hello
Restart=always
User=nobody
Group=nobody
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
````

Reload daemon and enable service:
:::info
If you encounter an error when restarting Go in systemd, please disable SELinux with the command `setenforce 0`.
:::

```
systemctl daemon-reload
systemctl enable --now hellogo
systemctl status hellogo
```

Here is an example of the output:
```
● hellogo.service - Go App
   Loaded: loaded (/etc/systemd/system/hellogo.service; enabled; vendor preset: disabled)
   Active: active (running) since Wed 2025-07-16 23:01:09 WIB; 3s ago
 Main PID: 17967 (hello)
    Tasks: 5 (limit: 11143)
   Memory: 6.6M
   CGroup: /system.slice/hellogo.service
           └─17967 /var/www/focusnic.biz.id/hello
```

## Troubleshooting

1. Apache shows 502 Bad Gateway <br/>

Make sure the binary is running ./hellogo and listening on `localhost:8080`. Check with `ss -tuln`.

2. Applications cannot be run by systemd when SELinux is active <br/>

Temporarily disable SELinux with the command `setenforce 0` or use `chcon -t bin_t /var/www/focusnic.biz.id/hello` or move it to `/usr/local/bin`

3. The `hello` service does not automatically run after reboot <br/>

Run the command `systemctl enable --now hellogo`

4. Port 8080 is not accessible <br/>

Allow port 8080 on firewalld:
```
firewall-cmd --add-port=8080/tcp --permanent 
firewall-cmd --reload
```

5. Apache does not forward requests to Go <br/>

Make sure that `LoadModule proxy_module` and `LoadModule proxy_http_module` are present in the Apache configuration.

6. Application crashes when run directly <br/>

Grant execute permission with the following command `chmod +x hello` and ensure it is run as a non-root user with access. Check the `journalctl -xe` log for systemd errors.

7. Go changes do not appear <br/>

Make sure to recompile the `hello.go` file before restarting the service.

## Conclusion

Running Go (Golang) applications on top of Apache Web Server on AlmaLinux 8 offers many advantages: high speed, light weight, and flexibility. Using a reverse proxy approach, we can separate the workload between Go as the application server and Apache as the frontend web server.

Q: Why does my Go application run when SELinux is disabled, but error when it's enabled? <br/>
A: `SELinux` blocks the execution of binaries from directories like `/var/www`. You should change the file's label to `bin_t` or move it to `/usr/local/bin`.

Q: Can Apache directly access Go applications without a reverse proxy? <br/>
A: Not directly, like PHP. Apache doesn't have a Go interpreter, so a reverse proxy is required to port the Go application.

Q: How can I see if my Go application is running? <br/>
A: Use the command `ps aux | grep hellogo` or `systemctl status hellogo` if using a systemd service.

Q: Do I have to put the Go binary files in `/var/www`? <br/>
A: Not required. The best location is `/usr/local/bin`, as that directory is designed for custom binaries and SELinux won't block it.

Q: Do I need a web framework like Gin/Echo for production? <br/>
A: For large applications, yes. But for simple applications like info servers, standard Go net/http is sufficient.

Q: Why does Apache keep showing a 502 error even though the Go application is running? <br/>
A: Make sure the Go application's port and IP address, `localhost:8080`, match the `ProxyPass` value in the Apache configuration.

Q: Do I have to restart Apache every time I change a Go file? <br/>
A: No, you just need to rebuild the Go application and restart the application process with `systemctl restart hellogo`.

Q: How do I log a Go application in production? <br/>
A: Redirect logs to a file or use the `systemd journal`, and be sure to use `log.Println()` in the application for error/debug logging.
