---
title: Go
description: Cara Install dan Menggunakan Go (Golang) pada Apache di AlmaLinux 8
sidebar_position: 12
sidebar_label: Go
---

Dalam era modernisasi teknologi server-side, penggunaan bahasa pemrograman **Go (Golang)** semakin populer karena efisiensinya yang tinggi dan performa runtime yang sangat cepat. Bagi pengguna sistem operasi berbasis enterprise seperti **AlmaLinux 8**, mengintegrasikan **Go** ke dalam lingkungan **Apache Web Server** dapat membuka banyak peluang dalam pengembangan aplikasi web yang scalable, ringan, dan aman. Panduan ini akan memberikan panduan lengkap mulai dari instalasi, konfigurasi, hingga praktik terbaik menjalankan aplikasi Go di atas Apache.

## Prerequisite
- Akses full `root`
- Apache/HTTPD sudah terinstall
- Basic Linux Command Line
- Security
- Domain (opsional)

## Install Go

Sebelum memulai proses instalasi, pastikan bahwa sistem operasi AlmaLinux 8 telah diperbarui ke versi terbaru dan memiliki hak akses root atau menggunakan akun dengan hak sudo:
:::info
Langkah ini akan memastikan sistem memiliki dependensi dasar untuk mengompilasi aplikasi Go dan mendukung modul Apache jika diperlukan.
:::
```
dnf update -y
dnf groupinstall "Development Tools" -y
```
AlmaLinux 8 tidak menyediakan paket Go versi terbaru dalam repository default. Oleh karena itu, kita perlu mengunduhnya langsung dari situs resmi:
```
wget https://go.dev/dl/go1.24.5.linux-amd64.tar.gz
```
Ekstrak dan set PATH Environment:
```
tar -C /usr/local -xzf go1.24.5.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
source ~/.bash_profile
```
Verifikasi instalasi:
```
go version
```
Contoh ouput:
```
go version go1.24.5 linux/amd64
```

## Konfigurasi Apache Reverse Proxy untuk Go
:::info
Apache secara default tidak dapat langsung menjalankan aplikasi Go seperti halnya PHP atau Python. Oleh karena itu, kita perlu menggunakan reverse proxy melalui `mod_proxy` atau memanfaatkan `CGI` (Common Gateway Interface) untuk menjembatani eksekusi aplikasi Go dengan Apache.
:::
Pastikan Apache sudah terinstall, apabila belum terinstall silahkan jalankan perintah berikut:
```
dnf install httpd -y
systemctl enable --now httpd
```

Pastikan port 80/443 dibuka apabila menggunakan firewalld jalankan perintah berikut:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

Verifikasi module proxy Apache:
```
apachectl -M | grep proxy
```

Contoh output:
```
proxy_module (shared)
proxy_http_module (shared)
```

Buat virtualhost untuk aplikasi Go:
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

Struktur direktori dan penempatan file dalam project Go sangat penting untuk mempermudah pengelolaan, pengembangan, dan deployment — terutama jika Anda ingin menjalankan aplikasi Go di bawah Apache menggunakan reverse proxy.
```
/var/www/focusnic.biz.id
├── go.mod
├── go.sum
├── hello.go
├── hello         # ← binary build
```

| File/Folder | Keterangan |
| --- | --- |
| `/var/www/focusnic.biz.id` | Direktori root project aplikasi Go |
| `hello.go` | File sumber utama Go Anda (berisi kode `http.HandleFunc`) |
| `hello` | Binary hasil build dari `go build -o hello hello.go` |
| `go.mod` | File module Go (otomatis dibuat dengan `go mod init`) |


Buat direktori pada virtualhost diatas untuk menyimpan source code Go:
```
mkdir -p /var/www/focusnic.biz.id
```

Restart Apache:
```
systemctl restart httpd
```
## Menyiapkan Aplikasi Sederhana Go

Berikut adalah **aplikasi sederhana menggunakan Go (Golang)** yang dapat diakses melalui **Apache Web Server** (menggunakan reverse proxy) dan menampilkan:

- **Server time (waktu saat ini)**
- **Sistem operasi**
- **Versi Go yang digunakan**


Buat file `hello.go` pada direktori yang telah dibuat sebelumnya:
```
cd /var/www/focusnic.biz.id
nano hello.go
```

Isi skrip berikut:
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

Kemudian build aplikasinya dengan menjalankan perintah berikut:
```
go build -o hello hello.go
```

Lalu jalankan aplikasi Go yang telah menjadi binary bernama `hello`:
```
./hello
```

Setelah itu buka browser dan arahkan ke domain atau IP yang telah dibuat pada virtualhost `http://$DOMAIN`<br/>
![](/img/almalinux8-go.jpg)<br/>

### Systemd Service untuk Aplikasi Go

Agar aplikasi Go dapat dijalankan otomatis saat booting, kita bisa menambahkan `systemd service`:
```
nano /etc/systemd/system/hellogo.service
```
Isi dengan parameter berikut
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

Reload daemon dan enable service:
:::info
Jika mengalami error saat me-restart Go dalam systemd, silahkan disable SELinux dengan perintah `setenforce 0`.
:::

```
systemctl daemon-reload
systemctl enable --now hellogo
systemctl status hellogo
```

Berikut contoh outputnya:
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

1. Apache menunjukkan 502 Bad Gateway <br/>

Pastikan binary sudah dijalankan ./hellogo dan listen di `localhost:8080`. Cek dengan `ss -tuln`.

2. Aplikasi tidak bisa dijalankan oleh systemd saat SELinux aktif <br/>

Disable SELinux sementara dengan perintah `setenforce 0` atau gunakan `chcon -t bin_t /var/www/focusnic.biz.id/hello` atau pindahkan ke `/usr/local/bin`

3. Service `hellogo` tidak otomatis jalan setelah reboot <br/>

Jalankan perintah `systemctl enable --now hellogo`

4. Port 8080 tidak bisa diakses <br/>

Izinkan port 8080 pada firewalld:
```
firewall-cmd --add-port=8080/tcp --permanent 
firewall-cmd --reload
```

5. Apache tidak meneruskan request ke Go <br/>

Pastikan sudah ada `LoadModule proxy_module` dan `LoadModule proxy_http_module` di konfigurasi Apache

6. Aplikasi crash saat dijalankan langsung <br/>

Berikan permission excute dengan perintah berikut `chmod +x hello` dan pastikan dijalankan dengan user non-root yang punya akses. Cek log `journalctl -xe` untuk error systemd

7. Perubahan Go tidak tampil <br/>

Pastikan untuk mengkompilasi ulang file `hello.go` sebelum restart service

## Kesimpulan

Menjalankan aplikasi Go (Golang) di atas Apache Web Server di AlmaLinux 8 memberikan banyak keuntungan: kecepatan tinggi, ringan, dan fleksibel. Dengan pendekatan reverse proxy, kita dapat memisahkan workload antara Go sebagai server aplikasi dan Apache sebagai frontend web server.

Q: Kenapa aplikasi Go saya jalan jika SELinux mati, tapi error saat hidup? <br/>
A: `SELinux` memblokir eksekusi binary dari direktori seperti `/var/www`. Anda harus mengubah label file ke `bin_t` atau pindahkan ke `/usr/local/bin`.

Q: Apakah aplikasi Go bisa langsung diakses oleh Apache tanpa reverse proxy? <br/>
A: Tidak bisa langsung seperti PHP. Apache tidak memiliki interpreter Go, jadi perlu reverse proxy ke port aplikasi Go.

Q: Bagaimana cara melihat apakah aplikasi Go saya sedang berjalan? <br/>
A: Gunakan perintah `ps aux | grep hellogo` atau `systemctl status hellogo` jika memakai service systemd.

Q: Apakah saya harus menaruh file binary Go di `/var/www`? <br/>
A: Tidak wajib. Lokasi terbaik adalah `/usr/local/bin`, karena direktori tersebut didesain untuk binary custom dan SELinux tidak akan memblokirnya.

Q: Apakah saya perlu web framework seperti Gin/Echo untuk produksi? <br/>
A: Untuk aplikasi besar, ya. Tapi untuk aplikasi sederhana seperti info server, cukup menggunakan net/http standar Go.

Q: Kenapa Apache tetap menampilkan 502 padahal aplikasi Go sudah jalan? <br/>
A: Pastikan port dan IP aplikasi Go `localhost:8080` match dengan `ProxyPass` di konfigurasi Apache.

Q: Apakah saya harus restart Apache setiap kali ubah file Go? <br/>
A: Tidak, Anda hanya perlu build ulang aplikasi Go, dan restart proses aplikasinya saja `systemctl restart hellogo`.

Q: Bagaimana cara logging aplikasi Go di production? <br/>
A: Redirect log ke file atau gunakan `systemd journal`, dan pastikan gunakan `log.Println()` dalam aplikasi untuk pencatatan error/debug.
