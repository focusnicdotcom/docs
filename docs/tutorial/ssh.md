---
title: SSH
description: Tutorial dan Konfigurasi SSH di Server Linux
sidebar_position: 100
sidebar_label: SSH
---

SSH (Secure Shell) adalah protokol jaringan yang digunakan untuk mengakses dan mengelola server secara remote dan aman. SSH mengenkripsi komunikasi antara klien dan server, menggantikan protokol lama seperti Telnet dan Rlogin.

## Konfigurasi Dasar SSH
:::info
Jika Anda menggunakan sistem operasi seperti Redhat dan turunannya, atau AlmaLinux atau RockyLinux, maka pastikan SELinux dalam keadaan `Permissive` atau `Disabled`. Atau bisa jalankan perintah berikut untuk mengecek `getenforce` apabila outputnya `Enforcing` maka silahkan disable sementara menggunakan perintah berikut `setenforce 0`.
:::
Edit file konfigurasi utama SSH
```
nano /etc/ssh/sshd_config
```
Isi parameter dibagian paling bawah
```jsx showLineNumbers title="/etc/ssh/sshd_config"
Port 22                     # Ubah jika ingin pakai port custom (misalnya 2222)
PermitRootLogin yes          # Disarankan untuk keamanan bisa diubah ke "no"
PasswordAuthentication yes  # Bisa ubah ke "no" jika hanya ingin key-based login
```
Lalu rekomendasi apabila menggunakan VPS tanpa firewall dari cloud platform, atau tidak ada firewall di dalam server maka bisa tambahkan parameter berikut untuk mengizinkan `root` hanya dapat login melalui IP yang ada dalam daftar ini. Silahkan tambahkan dan ubah sesuai IP yang ingin digunakan

:::info
Ketika Anda mengaplikasikan parameter ini, asumsinya adalah IP tersebut statik/tidak berubah.
:::

```jsx showLineNumbers title="/etc/ssh/sshd_config"
# IP Kantor
AllowUsers root@192.168.1.0/28,192.168.23.4
# Tunnel
AllowUsers root@192.168.1.115,192.168.3.113,192.163.1.3
```

## Generate SSH Key
Cara ini sangat bermanfaat ketika antara `server-client` atau `client-server` ingin berkomunikasi tanpa password. Pada contoh ini saya perlihatkan pada `server-client`. Silahkan jalankan perintah ini pada server untuk men-generate `private key` dan `public key`
```
ssh-keygen
```
Kemudian salin `public key` ke client menggunakan perintah berikut, lalu masukkan password client
```
ssh-copy-id root@$IP_ADDRESS_CLIENT
```
Untuk verifikasi dari server ke client jalankan perintah berikut, apabila Anda tidak muncul prompt password maka konfigurasi sudah benar
```
ssh root@$IP_ADDRESS_CLIENT
```

Namun, dalam beberapa situasi, Anda atau rekan Anda mungkin hanya memiliki `public key` dari sisi klien atau server, dan perlu mengirimkannya secara manual. Misalnya, dalam skenario di mana kita ingin melakukan remote ke server milik klien, maka langkah pertama adalah membuat SSH key di sisi kita, lalu mengirimkan public key tersebut kepada klien untuk disimpan di server mereka.

Sekarang kita anggap Anda sudah memiliki `public key` yang telah dibuat sebelumnya, dan saatnya untuk mengeksekusinya di sisi klien/server tujuan.

:::info
Konfigurasi ini sepenuhnya hanya dilakukan pada sisi client dengan asumsi kita hanya memiliki `public key`. Lokasi `public key` biasanya ada di direktori home user atau ada di `~/.ssh/id_rsa.pub`.
:::
Silahkan cek atau buat file berikut apabila belum ada. Lalu isi dengan dengan file `public key` yang didapat sebelumnya
```
nano ~/.ssh/authorized_keys
```

Jika sudah maka ubah permission sebagai berikut
```
chmod 0600 ~/.ssh/authorized_keys
```

Kemudian setelah menempelkan `public key` pada device client, maka selanjutnya server yang memiliki `private key` bisa me-remote client ini.

## Port Forwarding
### Local Forwarding
Forward port lokal ke remote (local forwarding). Meneruskan port dari komputer lokal ke server remote. Cocok digunakan untuk mengakses layanan internal server remote yang tidak diekspos ke publik. Contoh: Anda memiliki server `192.168.100.10` yang menjalankan aplikasi web di port `80`, namun port `80` hanya bisa diakses dari `localhost` server tersebut (tidak bisa diakses langsung dari internet).
:::info
Jika Anda menggunakan Windows Desktop, maka silahkan gunakan PuTTY masuk ke tab `Connection > SSH > Tunnels` lalu isi `Source Port: 8080` dan `Destination: localhost:80` lalu klik `Add`. Kemudian kembali ke tab `Session` silahkan isi IP dan port server lalu login, apabila login berhasil silahkan akses resource yang ada di server pada port `80` melaui port `8080` di Windows Desktop Anda.
:::

```
ssh -L 8080:localhost:80 user@remote-server
```

- `8080`: port lokal di laptop Anda.

- `localhost:80`: tujuan forwarding di dalam server.

- `user@192.168.100.10`: login SSH ke server target.

Sekarang Anda bisa membuka browser di laptop: `http://localhost:8080`. Anda akan melihat tampilan web dari `http://localhost` di server `192.168.100.10`.
### Remote Forwarding
Meneruskan port dari komputer server ke klien SSH. Cocok digunakan saat Anda ingin membuka akses ke layanan di komputer lokal melalui server. Komputer lokal Anda (client) memiliki aplikasi web di `localhost:3000`. Anda ingin seseorang di server remote bisa mengakses aplikasi ini.
```
ssh -R 8080:localhost:3000 user@remote-server.com
```

- `8080`: port yang terbuka di server remote.

- `localhost:3000`: layanan yang berjalan di komputer lokal (klien SSH).

- `user@remote-server.com`: SSH ke server remote.

Di server remote, siapa pun yang mengakses: `http://localhost:8080` Akan diarahkan ke aplikasi web yang berjalan di `localhost:3000` di komputer Anda. Pastikan `GatewayPorts yes` diset di server remote jika ingin diakses dari luar `localhost`.

## Finish Config
:::info
Pastikan sesi SSH tetap terbuka saat mengubah konfigurasi. Jika terjadi kesalahan, Anda masih bisa membatalkan atau menyesuaikan konfigurasi sebelum koneksi terputus.
:::

Untuk menyimpan perubahan dan mengaplikasikan perubahan silahkan restart SSH
```
systemctl restart sshd
```
Cek status SSH
```
systemctl status sshd
```
