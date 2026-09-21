---
title: Rust
description: How to Install and Configure Rust on Apache in AlmaLinux 8
sidebar_position: 13
sidebar_label: Rust
---

In the ever-evolving digital era, the need for **modern and efficient programming languages** is increasing. One such language that is gaining a lot of attention is Rust—a low-level systems language known for its **memory safety** and **high performance**. This guide will cover in detail **how to install Rust on Apache Web Server on the AlmaLinux 8 operating system**, a system that is a favorite of many sysadmins due to its stability.

Rust is now widely used in **web backend development, CLI tools, and even embedded systems**, and is able to compete with C/C++ in terms of performance while being much more secure. Integration with Apache on AlmaLinux servers opens up many new opportunities, especially for those of you who want to build **efficient, secure, and fast web applications**.


## Prerequisites

- Full `root` access
- Apache/HTTPD installed
- Basic Linux Command Line
- Security
- Domain (optional)

## Install Rust
Before starting the installation, make sure your system is up-to-date and stable. Run the following command to update all packages:
```
dnf update -y
dnf install epel-release -y
```
Proceed by installing the basic dependencies that will be used during the installation process:
```
dnf groupinstall "Development Tools" -y
dnf install gcc make openssl-devel wget curl -y
```

The most efficient and official way to install Rust is to use Rustup, a version management tool provided by the Rust development team:
```
curl https://sh.rustup.rs -sSf | sh
```
Example output:
```
info: downloading installer

Welcome to Rust!

This will download and install the official compiler for the Rust
programming language, and its package manager, Cargo.

Rustup metadata and toolchains will be installed into the Rustup
home directory, located at:

  /root/.rustup

This can be modified with the RUSTUP_HOME environment variable.

The Cargo home directory is located at:

  /root/.cargo

This can be modified with the CARGO_HOME environment variable.

The cargo, rustc, rustup and other commands will be added to
Cargo's bin directory, located at:

  /root/.cargo/bin

This path will then be added to your PATH environment variable by
modifying the profile files located at:

  /root/.profile
  /root/.bash_profile
  /root/.bashrc

You can uninstall at any time with rustup self uninstall and
these changes will be reverted.

Current installation options:


   default host triple: x86_64-unknown-linux-gnu
     default toolchain: stable (default)
               profile: default
  modify PATH variable: yes

1) Proceed with standard installation (default - just press enter)
2) Customize installation
3) Cancel installation
>1
```
After that, follow the on-screen instructions and select the default options. Once done, activate the Rust environment:
```
source $HOME/.cargo/env
```
Verify Rust installation:
```
rustc --version
```

Example output:
```
rustc 1.88.0 (6b00bc388 2025-06-23)
```

## Rust Apache Virtualhost

Apache is one of the most popular and reliable web servers for hosting on Linux. Run the following command to install Apache:
```
dnf install httpd -y
systemctl enable --now httpd
```

If the firewall is active, don't forget to open ports 80 and 443:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

### Running Rust via CGI
Apache requires the `mod_cgi` module to run Rust programs via CGI, and it's usually already installed. Verify the CGI module first:
```
httpd -M | grep cgi
```

Example output:
```
cgid_module (shared)
```

Create a virtualhost for Rust via CGI:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html 

    ScriptAlias /rust-cgi/ /var/www/focusnic.biz.id/public_html/rust-cgi/
    <Directory "/var/www/focusnic.biz.id/public_html/rust-cgi">
        Options +ExecCGI
        AddHandler cgi-script .cgi .out
        Require all granted
    </Directory>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```
Then create a directory with the following command:
```
mkdir -p /var/www/focusnic.biz.id/public_html/rust-cgi/
```
Restart Apache:
```
apachectl configtest
systemctl restart httpd
```

Then move on to the Rust project:
```
cd /var/www/focusnic.biz.id/public_html/rust-cgi/
cargo new hello-cgi
cd hello-cgi
nano src/main.rs
```

Fill the `main.rs` file with the following script:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/public_html/rust-cgi/hello-cgi/src/main.rs"
use std::env;
use std::fs;
use std::process::Command;
use chrono::Local;

fn main() {
    println!("Content-Type: text/html\r\n\r\n");

    let current_time = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let os = env::consts::OS;

    let rust_version = match Command::new("rustc").arg("--version").output() {
        Ok(output) => String::from_utf8_lossy(&output.stdout).trim().to_string(),
        Err(_) => "Cannot fetch Rust vers".to_string(),
    };

    let kernel_version = match Command::new("uname").arg("-r").output() {
        Ok(output) => String::from_utf8_lossy(&output.stdout).trim().to_string(),
        Err(_) => {
            fs::read_to_string("/proc/version")
                .unwrap_or_else(|_| "Cannot fetch kernel".to_string())
        }
    };

    println!("<html><body>");
    println!("<h1>Info Server CGI</h1>");
    println!("<p><strong>Server Time:</strong> {}</p>", current_time);
    println!("<p><strong>Operating System:</strong> {}</p>", os);
    println!("<p><strong>Kernel ver:</strong> {}</p>", kernel_version);
    println!("<p><strong>Rust ver:</strong> {}</p>", rust_version);
    println!("</body></html>");
}
```
Add the `chrono` dependency in the `Cargo.toml` file:
```
nano Cargo.toml
```
Fill in the following parameters:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/public_html/rust-cgi/hello-cgi/Cargo.toml"
[dependencies]
chrono = "0.4"
```

Build the project, copy and adjust the permissions:
```
cargo build --release
cp target/release/hello-cgi /var/www/focusnic.biz.id/public_html/rust-cgi/hello-cgi.cgi
chmod +x /var/www/focusnic.biz.id/public_html/rust-cgi/hello-cgi.cgi
chown -R apache:apache /var/www/focusnic.biz.id
```

Then access via browser `http://$DOMAIN`<br/>
![](/img/almalinux8-rust-cgi.jpg)<br/>

When Rust is run as a CGI under Apache, many of the environment restrictions are present. Here's an example of a Rust app running as the root user:
```
./hello-cgi.cgi 
```
Output example:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/public_html/rust-cgi/hello-cgi.cgi"
Content-Type: text/html


<html><body>
<h1>Info Server CGI</h1>
<p><strong>Server Time:</strong> 2025-07-17 16:09:39</p>
<p><strong>Operating System:</strong> linux</p>
<p><strong>Kernel ver:</strong> 4.18.0-553.58.1.el8_10.x86_64</p>
<p><strong>Rust ver:</strong> rustc 1.88.0 (6b00bc388 2025-06-23)</p>
</body></html>
```

### Running Rust via Apache Reverse Proxy
If you want to run a Rust web application as a standalone service (such as with the Rocket or Actix-web frameworks), you can use Apache as a reverse proxy.

Apache requires the `proxy_module` module to run Rust programs via CGI, and it's usually already installed. Verify the CGI module first:
```
httpd -M | grep proxy
```

Example output:
```
proxy_module (shared)
proxy_http_module (shared)
```

Create a reverse proxy virtualhost for Rust:
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

Create a virtualhost to store the Rust project:
```
mkdir -p /var/www/focusnic.biz.id/
cd /var/www/focusnic.biz.id
cargo new web-rust --bin
cd web-rust
nano src/main.rs
```

Fill in the following script:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/web-rust/src/main.rs"
#[macro_use] extern crate rocket;

use rocket::response::content::RawHtml;
use std::env;
use std::process::Command;
use chrono::Local;

#[get("/")]
fn index() -> RawHtml<String> {
    let current_time = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let os = env::consts::OS;
    let rust_version = match Command::new("rustc").arg("--version").output() {
        Ok(output) => String::from_utf8_lossy(&output.stdout).trim().to_string(),
        Err(_) => "Cannot fetch Rust version".to_string(),
    };

    RawHtml(format!(r#"
        <html><body>
        <h1>Info Server</h1>
        <p><strong>Server Time:</strong> {}</p>
        <p><strong>Operating System:</strong> {}</p>
        <p><strong>Rust version:</strong> {}</p>
        </body></html>
    "#, current_time, os, rust_version))
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index])
}
```

Add the `rocket` and `chrono` dependencies in the `Cargo.toml` file:
```
nano Cargo.toml
```

Fill in the following parameters:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/web-rust"
[dependencies]
rocket = "0.5.0-rc.2"
chrono = "0.4"
```

Then run and compile with the following command:
```
cargo run
```

Example output:
```
   Compiling web-rust v0.1.0 (/var/www/focusnic.biz.id/web-rust)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 4.59s
     Running `target/debug/web-rust`
🔧 Configured for debug.
   >> address: 127.0.0.1
   >> port: 8000
   >> workers: 2
   >> max blocking threads: 512
   >> ident: Rocket
   >> IP header: X-Real-IP
   >> limits: bytes = 8KiB, data-form = 2MiB, file = 1MiB, form = 32KiB, json = 1MiB, msgpack = 1MiB, string = 8KiB
   >> temp dir: /tmp
   >> http/2: true
   >> keep-alive: 5s
   >> tls: disabled
   >> shutdown: ctrlc = true, force = true, signals = [SIGTERM], grace = 2s, mercy = 3s
   >> log level: normal
   >> cli colors: true
📬 Routes:
   >> (index) GET /
📡 Fairings:
   >> Shield (liftoff, response, singleton)
🛡️ Shield:
   >> Permissions-Policy: interest-cohort=()
   >> X-Frame-Options: SAMEORIGIN
   >> X-Content-Type-Options: nosniff
🚀 Rocket has launched from http://127.0.0.1:8000
```

Then access Access `http://localhost:8000` or via `http://$DOMAIN` if using a reverse proxy
![](/img/almalinux8-rust-rp.jpg)<br/>

### Systemd Service for Rust Applications

Make sure you've followed the instructions in the Rust reverse proxy section above, as we'll be compiling the application into a binary. Run the following commands to build and compile the Rust app you've created:
```
cd /var/www/focusnic.biz.id/web-rust
cargo build --release
```

Then copy the `web-rust` binary file to the `/usr/local/bin` directory:
```
cp target/release/web-rust /usr/local/bin/
chmod +x /usr/local/bin/web-rust
```

Create a systemd service:

:::info
This is the recommended approach when running Rust applications in production by creating a `systemd` service. This way, when the server is rebooted, the Rust program will run automatically.
:::

```
nano /etc/systemd/system/rustapp.service
```

Fill in the following parameters:

:::info
In the `Environment` section the Rust environment path must be added, which can be searched using the `which rustc` command.
:::

```jsx showLineNumbers title="/etc/systemd/system/rustapp.service"
[Unit]
Description=Rust App
After=network.target

[Service]
ExecStart=/usr/local/bin/web-rust
Restart=always
User=root
Group=root
Environment="PATH=/root/.cargo/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

[Install]
WantedBy=multi-user.target
```

Reload daemon and enable service:

:::info
If you encounter an error when restarting Go in systemd, please disable SELinux with the command `setenforce 0`.
:::

```
systemctl daemon-reload
systemctl enable --now rustapp
systemctl status rustapp
```

Here is an example of the output:
```
● rustapp.service - Rust App
   Loaded: loaded (/etc/systemd/system/rustapp.service; enabled; vendor preset: disabled)
   Active: active (running) since Thu 2025-07-17 18:16:42 WIB; 3min 17s ago
 Main PID: 744 (web-rust)
    Tasks: 3 (limit: 11143)
   Memory: 148.3M
   CGroup: /system.slice/rustapp.service
           └─744 /usr/local/bin/web-rust

Jul 17 18:16:42 localhost.localdomain systemd[1]: Started Go App.
Jul 17 18:16:42 localhost.localdomain web-rust[744]: Rocket has launched from http://127.0.0.1:8000
```

Then please access it via browser by typing the IP address or domain if using a reverse proxy.

## Troubleshooting

1. Error: 500 Internal Server Error (CGI) <br/>

The output from the Rust program does not print valid HTTP headers. Make sure the Rust program's stdout prints:
```
println!("Content-Type: text/html\n");
```

2. Apache Log: malformed header from script 'hello.cgi': Bad header: Hello, world! <br/>

Add the CGI Content-Type header as the first line of the output as above.

3. Rust CGI cannot fetch and display `rustc` version <br/>

Apache (or systemd) environment path does not recognize `/root/.cargo/bin`. Add PATH to the systemd unit file:
```
Environment="PATH=/root/.cargo/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
```

Or use absolute path:
```
Command::new("/root/.cargo/bin/rustc")
```

4. When accessing Reverse Proxy only displays RAW HTML<br/>

The server doesn't set the Content-Type: text/html header, so the browser displays it as plaintext. Use the `ContentType::HTML` response type in Rocket:
```
use rocket::response::content::RawHtml;

#[get("/")]
fn index() -> RawHtml<String> {
    RawHtml(format!("..."))
}

```

5. CGI cannot execute external commands (rustc, uname, etc.) <br/>

The command is not recognized or does not have permissions. Use an absolute path and ensure the binary is accessible to CGI users (www-data/apache).

## Conclusion

By following this guide, we've successfully installed Rust and integrated it into the Apache Web Server on an AlmaLinux 8 system, both as a CGI application and as a backend via a reverse proxy. Rust offers excellent performance and high system reliability, making it ideal for developing modern server applications.

- **Rust** can be used to create **CGI-based** applications and **reverse proxies** with frameworks like **Rocket**.
- CGI in Apache requires a **strict output header format** (`Content-Type:`).
- When using **systemd**, ensure the `PATH` variable is explicitly set if binaries (such as `rustc`) are not in the standard location.
- For Rust-based reverse proxies, use `rocket::response::content::RawHtml` to ensure HTML is displayed correctly by the browser.

Q: Why does my Rust CGI fail even though it prints output to the terminal correctly? <br/>
A: Because Apache doesn't receive valid HTTP headers before the content. Make sure there's `Content-Type:` and a single empty `newline` before the HTML body.

Q: Does `cargo build --release` create a hello world program by default? <br/>
A: No. If the `src/main.rs` file is unchanged from the default template, it will simply print `Hello, world!`. Make sure you have edited `main.rs` and saved it before compiling.

Q: Why can't `systemd` run `rustc`? <br/>
A: Because `systemd`'s default PATH doesn't contain directories like `/root/.cargo/bin`. The solution:

- Add `Environment="PATH=/root/.cargo/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"` on the unit file `systemd`
- Or use an absolute path like `Command::new("/root/.cargo/bin/rustc")`

Q: What is the best directory structure for a production Rust project? <br/>
A: 
```
my_rust_app/
├── src/
│   └── main.rs
├── static/           # optional: assets
├── templates/        # optional: Tera/Handlebars HTML
├── Cargo.toml
├── systemd/          # unit file custom
└── README.md
```
