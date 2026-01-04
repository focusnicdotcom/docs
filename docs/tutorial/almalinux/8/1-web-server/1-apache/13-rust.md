---
title: Rust
description: Cara Install dan Menggunakan Rust pada Apache di AlmaLinux 8
sidebar_position: 13
sidebar_label: Rust
---

Dalam era digital yang semakin berkembang, kebutuhan akan **bahasa pemrograman modern dan efisien** semakin meningkat. Salah satu bahasa yang mendapat banyak perhatian adalah **Rust**—sebuah bahasa sistem tingkat rendah yang dikenal dengan **keamanan memori** dan **performa tinggi**. Panduan ini akan membahas secara lengkap **cara install Rust di Apache Web Server pada sistem operasi AlmaLinux 8**, sebuah sistem yang menjadi favorit banyak sys admin karena kestabilannya.

Rust kini banyak digunakan dalam pengembangan **web backend, CLI tool, hingga sistem embedded**, dan mampu bersaing dengan C/C++ dalam hal performa namun jauh lebih aman. Integrasi dengan Apache di server AlmaLinux membuka banyak peluang baru, terutama bagi Anda yang ingin membangun **aplikasi web yang efisien, aman, dan cepat**.


## Prerequisite

- Akses full `root`
- Apache/HTTPD sudah terinstall
- Basic Linux Command Line
- Security
- Domain (opsional)

## Install Rust
Sebelum memulai instalasi, pastikan sistem Anda dalam keadaan terbaru dan stabil. Jalankan perintah berikut untuk memperbarui semua paket:
```
dnf update -y
dnf install epel-release -y
```
Lanjutkan dengan memasang dependensi dasar yang akan digunakan selama proses instalasi:
```
dnf groupinstall "Development Tools" -y
dnf install gcc make openssl-devel wget curl -y
```

Cara paling efisien dan resmi untuk memasang Rust adalah dengan menggunakan Rustup, alat manajemen versi yang disediakan oleh tim pengembang Rust:
```
curl https://sh.rustup.rs -sSf | sh
```
Contoh output:
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
Setelah itu ikuti petunjuk di layar dan pilih opsi default. Setelah selesai, aktifkan environment Rust:
```
source $HOME/.cargo/env
```

Verifikasi instalasi Rust:
```
rustc --version
```

Contoh output:
```
rustc 1.88.0 (6b00bc388 2025-06-23)
```

## Rust Apache Virtualhost

Apache merupakan salah satu web server paling populer dan andal untuk kebutuhan hosting di Linux. Jalankan perintah berikut untuk memasang Apache:
```
dnf install httpd -y
systemctl enable --now httpd
```

Jika firewall aktif, jangan lupa membuka port 80 dan 443:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

### Menjalankan Rust via CGI
Apache membutuhkan modul `mod_cgi` agar dapat menjalankan program Rust via CGI dan biasanya sudah terinstall pada Apache. Verifikasi modul CGI terlebih dahulu:
```
httpd -M | grep cgi
```

Contoh output:
```
cgid_module (shared)
```

Buat virtualhost untuk Rust via CGI:
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
Kemudian buat direktori dengan perintah berikut:
```
mkdir -p /var/www/focusnic.biz.id/public_html/rust-cgi/
```
Restart Apache:
```
apachectl configtest
systemctl restart httpd
```

Kemudian proyek Rust:
```
cd /var/www/focusnic.biz.id/public_html/rust-cgi/
cargo new hello-cgi
cd hello-cgi
nano src/main.rs
```

Isi file `main.rs` dengan skrip berikut:
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
Tambahkan dependensi `chrono` di file `Cargo.toml`:
```
nano Cargo.toml
```
Isi parameter berikut:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/public_html/rust-cgi/hello-cgi/Cargo.toml"
[dependencies]
chrono = "0.4"
```

Build proyek, salin dan sesuaikan permission:
```
cargo build --release
cp target/release/hello-cgi /var/www/focusnic.biz.id/public_html/rust-cgi/hello-cgi.cgi
chmod +x /var/www/focusnic.biz.id/public_html/rust-cgi/hello-cgi.cgi
chown -R apache:apache /var/www/focusnic.biz.id
```

Lalu akses melalui browser `http://$DOMAIN`<br/>
![](/img/almalinux8-rust-cgi.jpg)<br/>

Saat Rust dijalankan sebagai CGI di bawah Apache, banyak environment yang dibatasi. Berikut contoh jika app Rust dijalankan menggunakan user root:
```
./hello-cgi.cgi 
```
Contoh output:
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

### Menjalankan Rust via Reverse Proxy Apache
Jika ingin menjalankan aplikasi web Rust sebagai layanan tersendiri (seperti dengan framework Rocket atau Actix-web), Anda bisa menggunakan Apache sebagai reverse proxy.

Apache membutuhkan modul `proxy_module` agar dapat menjalankan program Rust via CGI dan biasanya sudah terinstall pada Apache. Verifikasi modul CGI terlebih dahulu:
```
httpd -M | grep proxy
```

Contoh output:
```
proxy_module (shared)
proxy_http_module (shared)
```

Buat virtualhost reverse proxy untuk Rust:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```
Isi parameter berikut:
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

Buat virtualhost untuk menyimpan proyek Rust:
```
mkdir -p /var/www/focusnic.biz.id/
cd /var/www/focusnic.biz.id
cargo new web-rust --bin
cd web-rust
nano src/main.rs
```

Isi skrip berikut:
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

Tambahkan dependency `rocket` dan `chrono` di file `Cargo.toml`:
```
nano Cargo.toml
```

Isi parameter berikut:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/web-rust"
[dependencies]
rocket = "0.5.0-rc.2"
chrono = "0.4"
```

Kemudian jalankan dan compile dengan perintah berikut:
```
cargo run
```

Contoh output:
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

Lalu akses Akses `http://localhost:8000` atau via `http://$DOMAIN` jika menggunakan reverse proxy
![](/img/almalinux8-rust-rp.jpg)<br/>

### Systemd Service untuk Aplikasi Rust

Pastikan sudah mengikuti panduan pada section reverse proxy Rust diatas, karena kita akan mencompile aplikasi diatas menjadi sebuah binary. Jalankan perintah berikut untuk build dan compile app Rust yang sudah dibuat:
```
cd /var/www/focusnic.biz.id/web-rust
cargo build --release
```

Kemudian salin file binary `web-rust` ke direktori `/usr/local/bin`:
```
cp target/release/web-rust /usr/local/bin/
chmod +x /usr/local/bin/web-rust
```

Buat systemd service:

:::info
Cara ini merupakan yang direkomendasikan ketika menjalankan aplikasi Rust dalam production dengan membuat service `systemd`. Dengan cara ini ketika server di reboot maka program Rust akan dijalankan secara otomatis.
:::

```
nano /etc/systemd/system/rustapp.service
```

Isi parameter berikut:

:::info
Pada bagian `Environment` path environment Rust harus ditambahkan, dapat dicari menggunakan perintah `which rustc`
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

Reload daemon dan enable service:

:::info
Jika mengalami error saat me-restart Go dalam systemd, silahkan disable SELinux dengan perintah `setenforce 0`.
:::

```
systemctl daemon-reload
systemctl enable --now rustapp
systemctl status rustapp
```

Berikut contoh outputnya:
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

Kemudian silahkan akses melalui browser dengan mengetik alamat IP atau Domain jika menggunakan reverse proxy.

## Troubleshooting

1. Error: 500 Internal Server Error (CGI) <br/>

Output dari program Rust tidak mencetak header HTTP yang valid. Pastikan stdout program Rust mencetak:
```
println!("Content-Type: text/html\n");
```

2. Apache Log: malformed header from script 'hello.cgi': Bad header: Hello, world! <br/>

Tambahkan header CGI Content-Type sebagai baris pertama output seperti di atas.

3. Rust CGI tidak bisa mengambil dan menampilkan versi `rustc` <br/>

Environment path dari Apache (atau systemd) tidak mengenal `/root/.cargo/bin`. Tambahkan PATH pada unit file systemd:
```
Environment="PATH=/root/.cargo/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
```

Atau gunakan path absolut:
```
Command::new("/root/.cargo/bin/rustc")
```

4. Ketika Mengakses Reverse Proxy hanya menampilkan RAW HTML<br/>

Server tidak menyetel header Content-Type: text/html, sehingga browser menampilkan sebagai plaintext. Gunakan tipe response `ContentType::HTML` di Rocket:
```
use rocket::response::content::RawHtml;

#[get("/")]
fn index() -> RawHtml<String> {
    RawHtml(format!("..."))
}

```

5. CGI tidak dapat menjalankan perintah eksternal (rustc, uname, dll) <br/>

Perintah tidak dikenali atau tidak punya permission. Gunakan path absolut dan pastikan binary bisa diakses user CGI (www-data/apache).

## Kesimpulan

Dengan mengikuti panduan ini, kita telah berhasil menginstal Rust dan mengintegrasikannya ke dalam Apache Web Server di sistem AlmaLinux 8, baik sebagai aplikasi CGI maupun backend melalui reverse proxy. Rust menawarkan performa luar biasa dengan keandalan sistem yang tinggi, sangat cocok untuk pengembangan aplikasi server modern.

- **Rust** dapat digunakan untuk membuat aplikasi berbasis **CGI** maupun **Reverse Proxy** dengan framework seperti **Rocket**.
- CGI di Apache membutuhkan output header yang **ketat sesuai format** (`Content-Type:`).
- Saat menggunakan **`systemd`**, pastikan variabel `PATH` diatur secara eksplisit jika binary (seperti `rustc`) tidak berada di lokasi standar.
- Untuk reverse proxy berbasis Rust, gunakan `rocket::response::content::RawHtml` agar HTML ditampilkan dengan benar oleh browser.

Q: Kenapa CGI Rust saya gagal meskipun sudah mencetak output ke terminal dengan benar? <br/>
A: Karena Apache tidak menerima header HTTP valid sebelum konten. Pastikan ada `Content-Type:` dan satu `newline` kosong sebelum body HTML.

Q: Apakah `cargo build --release` membuat program hello world secara default? <br/>
A: Tidak. Jika file `src/main.rs` tidak diubah dari default template, maka yang dicetak hanyalah `Hello, world!`. Pastikan kamu sudah mengedit `main.rs` dan menyimpan sebelum di compile.

Q: Kenapa `systemd` tidak bisa menjalankan `rustc`? <br/>
A: Karena PATH default `systemd` tidak memuat direktori seperti `/root/.cargo/bin`. Solusinya:

- Tambahkan `Environment="PATH=/root/.cargo/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"` pada unit file `systemd`
- Atau gunakan path absolut seperti `Command::new("/root/.cargo/bin/rustc")`

Q: Apa struktur direktori terbaik untuk proyek Rust production? <br/>
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
