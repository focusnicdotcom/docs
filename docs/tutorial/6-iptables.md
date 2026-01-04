---
title: iptables
description: Pengertian dan Tutorial Konfigurasi iptables di Linux
sidebar_position: 105
sidebar_label: iptables
---

`iptables` adalah tool baris perintah di Linux untuk mengatur firewall berdasarkan **filtering paket jaringan**. Ia bekerja di atas **netfilter**, bagian dari kernel Linux, dan bisa digunakan untuk:

- Mengizinkan atau memblokir koneksi.
- Membatasi akses port/IP.
- Mencegah serangan DDoS/syn flood.
- Melakukan NAT (Network Address Translation).

Ada beberapa tabel yang bisa dipakai, dan setiap tabel punya beberapa chain bawaan. Kita juga bisa bikin chain sendiri. Setiap chain itu seperti daftar aturan yang bisa cocok sama paket-paket tertentu. Setiap aturan itu ngasih tau apa yang harus dilakukan sama paket yang cocok. Ini disebut *target*, yang bisa jadi lompatan ke chain yang kita buat sendiri di tabel yang sama.

iptables menggunakan aturan untuk menentukan apa yang harus dilakukan dengan paket jaringan. Utilitas ini terdiri dari komponen-komponen berikut:

- Tables: Tables adalah berkas yang mengelompokkan rules yang serupa. Tabel terdiri dari beberapa rules chains.
- Chains: Chains adalah serangkaian aturan. Saat paket diterima, iptables menemukan tabel yang sesuai dan memfilternya melalui rantai aturan hingga menemukan kecocokan.
- Rules: Rules adalah pernyataan yang menentukan kondisi untuk mencocokkan paket, yang kemudian dikirim ke target.
- Target: Target adalah keputusan tentang apa yang harus dilakukan dengan paket. Paket tersebut diterima, dibuang, atau ditolak.

## Konsep iptables
iptables memiliki beberapa jenis tabel:

| Tabel | Fungsi |
| --- | --- |
| `filter` | Default, digunakan untuk mengizinkan atau memblokir traffic |
| `nat` | Untuk Network Address Translation |
| `mangle` | Untuk memodifikasi paket |
| `raw` | Untuk kontrol low-level, biasanya digunakan dengan connection tracking |

Chain dalam iptables, yang menentukan kapan aturan dijalankan:

| Chain | Fungsi |
| --- | --- |
| `INPUT` | Traffic masuk ke sistem |
| `OUTPUT` | Traffic keluar dari sistem |
| `FORWARD` | Traffic yang melewati sistem (routing) |
| `PREROUTING` | Untuk NAT atau modifikasi sebelum routing |
| `POSTROUTING` | Untuk NAT setelah routing |

### Filter Table (`iptables -t filter`). 
Table utama dan default, digunakan untuk mengontrol apakah suatu paket diizinkan atau ditolak.
| Chain | Fungsi |
| --- | --- |
| `INPUT` | Paket masuk ke sistem lokal (misalnya SSH, HTTP ke server itu sendiri) |
| `FORWARD` | Paket **yang diteruskan** (bukan untuk host ini) |
| `OUTPUT` | Paket **keluar dari sistem lokal** |

### NAT Table (`iptables -t nat`)
Digunakan untuk Network Address Translation (NAT), misalnya masquerade, DNAT, dan SNAT.
| Chain | Fungsi |
| --- | --- |
| `PREROUTING` | Memodifikasi paket sebelum routing (misalnya DNAT) |
| `INPUT` | Untuk paket NAT masuk ke sistem (jarang digunakan) |
| `OUTPUT` | NAT untuk paket yang berasal dari host itu sendiri |
| `POSTROUTING` | NAT setelah routing selesai (misalnya SNAT/masquerade) |

### Mangle Table (`iptables -t mangle`)
Digunakan untuk modifikasi paket, seperti TTL, TOS, marking, dan QoS.
| Chain | Fungsi |
| --- | --- |
| `PREROUTING` | Sebelum routing |
| `INPUT` | Paket yang ditujukan ke sistem lokal |
| `FORWARD` | Paket yang diteruskan |
| `OUTPUT` | Paket yang keluar dari sistem lokal |
| `POSTROUTING` | Setelah routing |

### Raw Table (`iptables -t raw`)
Digunakan untuk menonaktifkan koneksi tracking (conntrack) pada paket tertentu.
| Chain | Fungsi |
| --- | --- |
| `PREROUTING` | Sebelum conntrack aktif |
| `OUTPUT` | Paket yang dikirim dari sistem sebelum conntrack |

### Daftar Perintah (Command Options) di iptables
| Option | Full Command | Fungsi / Keterangan |
| --- | --- | --- |
| `-A` | `--append` | Menambahkan rule ke akhir chain |
| `-I` | `--insert` | Menyisipkan rule ke posisi tertentu dalam chain |
| `-D` | `--delete` | Menghapus rule dari chain, berdasarkan nomor atau isi rule |
| `-R` | `--replace` | Mengganti rule yang ada di chain dengan rule baru |
| `-L` | `--list` | Menampilkan daftar rules dalam chain tertentu (default: semua chain) |
| `-F` | `--flush` | Menghapus semua rules dari chain tertentu (atau semua chain jika tidak ditentukan) |
| `-Z` | `--zero` | Reset hit counter pada semua rules |
| `-N` | `--new-chain` | Membuat custom chain baru |
| `-X` | `--delete-chain` | Menghapus custom chain (harus kosong dulu) |
| `-P` | `--policy` | Menetapkan **default policy** untuk chain (`ACCEPT` / `DROP`) |
| `-E` | `--rename-chain` | Mengubah nama chain |

Menambahkan rule:
```
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
```
Menyisipkan rule di urutan pertama:
```
iptables -I INPUT 1 -p tcp --dport 80 -j DROP
```
Menghapus rule berdasarkan isinya:
```
iptables -D INPUT -p tcp --dport 22 -j ACCEPT
```
Menghapus rule berdasarkan nomor:
```
iptables -D INPUT 3
```
Mengganti rule ke-2:
```
iptables -R INPUT 2 -p tcp --dport 443 -j ACCEPT
```
Cek rule dengan nomor urutan:
```
iptables -L -v --line-numbers 
```

### Parameter pada iptables
| Parameter | Fungsi |
| --- | --- |
| `-p` / `--protocol` | Menentukan protokol (tcp, udp, icmp, all) |
| `-s` / `--source` | Menentukan IP sumber atau subnet (misal: `192.168.1.1/24`) |
| `-d` / `--destination` | Menentukan IP tujuan |
| `-i` / `--in-interface` | Interface masuk (misal: `eth0`) |
| `-o` / `--out-interface` | Interface keluar (misal: `eth1`) |
| `--sport` | Source port (butuh `-p tcp` atau `-p udp`) |
| `--dport` | Destination port (misal: `--dport 80`) |
| `-m` / `--match` | Menentukan modul pencocokan (misal: `state`, `conntrack`, `limit`, dll) |
| `--state` | Digunakan dengan `-m state` (misal: `--state NEW,ESTABLISHED`) |
| `--ctstate` | Digunakan dengan `-m conntrack` (pengganti modern `--state`) |
| `-j` / `--jump` | Tindakan (target): `ACCEPT`, `DROP`, `REJECT`, `LOG`, `SNAT`, dll |
| `-g` / `--goto` | Lompat ke chain lain (seperti `-j`, tapi tidak kembali setelahnya) |
| `--icmp-type` | Menentukan tipe ICMP (misal: `echo-request`) |
| `-m limit` | Digunakan untuk membatasi rate (misal: `--limit 5/min`) |
| `-m mac` | Cocok berdasarkan MAC address |
| `--mac-source` | Menentukan MAC address sumber (butuh `-m mac`) |
| `-m time` | Batasi rule berdasarkan waktu/hari (butuh modul `time`) |

Terima koneksi TCP dari 192.168.1.100 ke port 22 (SSH):
```
iptables -A INPUT -p tcp --dport 22 -s 192.168.1.100 -j ACCEPT
```
Drop semua ping (ICMP request) ke server:
```
iptables -A INPUT -p icmp --icmp-type echo-request -j DROP
```
Terima koneksi baru ke port 80:
```
iptables -A INPUT -p tcp --dport 80 -m state --state NEW -j ACCEPT
```
### Target (`-j` options)
| Target | Fungsi |
| --- | --- |
| `ACCEPT` | Izinkan paket |
| `DROP` | Buang paket tanpa respon |
| `REJECT` | Buang paket dan kirim respon (ICMP/RESET) |
| `LOG` | Log informasi paket ke `syslog` |
| `SNAT` | Source NAT |
| `DNAT` | Destination NAT |
| `MASQUERADE` | NAT otomatis untuk koneksi internet sharing |
| `RETURN` | Kembali ke chain sebelumnya |

## Persiapan
Paket `iptables` biasanya sudah terinstall secara default pada semua distro Linux. Cek `iptables` dengan perintah berikut:
```
iptables --version
```
Contoh output:
```
iptables v1.8.5 (nf_tables)
```

Kemudian install `iptables-persistent` fungsinya agar iptables rules tidak hilang ketika server di reboot:
```
# Redhat ditribution
dnf install iptables iptables-services
# Debian distribution
apt install iptables iptables-persistent
```

Enable service:

```
# Redhat distribution
systemctl enable --now iptables
systemctl status iptables
# Debian distribution
systemctl enable --now netfilter-persistent
systemctl status netfilter-persistent
```

Jika menggunakan turunan dari Redhat, matikan firewalld agar tidak konflik dengan iptables:
```
systemctl stop firewalld
systemctl disable firewalld
systemctl mask firewalld
```

## Konfigurasi iptables
Sebagai catatan, perlu diingat bahwa dokumentasi ini akan mengkonfigurasi IPv4 saja karena untuk IPv6 perlu di konfigurasi secara independen dan tidak bisa bekerja bersama dengan rules IPv4.

Melihat rule aktif saat ini:
```
iptables -L -n -v
```
Contoh output:
```
Chain INPUT (policy ACCEPT 580 packets, 43926 bytes)
 pkts bytes target     prot opt in     out     source               destination         

Chain FORWARD (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         

Chain OUTPUT (policy ACCEPT 819 packets, 65227 bytes)
 pkts bytes target     prot opt in     out     source               destination 
```

Izinkan Loopback atau IP localhost:
```
iptables -A INPUT -i lo -j ACCEPT
```
Izinkan ping atau ICMP:
```
iptables -A INPUT -p icmp -j ACCEPT
```
Izinkan DNS (53 TCP/UDP):
```
iptables -A INPUT -p tcp -m multiport --destination-ports 53 -j ACCEPT
iptables -A INPUT -p udp -m multiport --destination-ports 53 -j ACCEPT
```
Izinkan port tertentu, contohnya izinkan SSH (22):
```
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
```
Izinkan akses server dari IP tertentu:
```
iptables -A INPUT -s 192.168.1.100 -j ACCEPT
```
Blokir IP:
```
iptables -A INPUT -s 192.168.1.200 -j DROP
```

Berikut adalah firewall iptables basic:
```
iptables -F
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -i lo -m comment --comment "Allow loopback or localhost" -j ACCEPT
iptables -A INPUT -p icmp -m comment --comment "Allow Ping" -j ACCEPT
iptables -A INPUT -p tcp -m multiport --destination-ports 22,25,53,80,443,465,5222,5269,5280,8999:9003 -j ACCEPT
iptables -A INPUT -p udp -m multiport --destination-ports 53 -j ACCEPT
iptables -P INPUT DROP
iptables -P FORWARD DROP
```

Penjelasan perintah diatas:
- Flush/reset semua rules dalam semua chains (INPUT, FORWARD, OUTPUT) di tabel filter.
- Izinkan paket yang merupakan bagian dari koneksi yang sudah ada (ESTABLISHED) atau berkaitan (RELATED). 
- Izinkan semua koneksi dari interface lo (localhost 127.0.0.1).
- Izinkan semua paket ICMP, misalnya ping (echo-request & echo-reply)
- Menggunakan -m multiport untuk efisiensi satu rule
- Izinkan UDP port 53 (DNS)
- Semua koneksi masuk dan paket yang diteruskan akan diblokir secara default kecuali dinyatakan sebaliknya. Dengan menggunakan opsi default DROP akan menambahkan lapisan keamanan karena setiap port atau service yang ada di server harus dimasukkan kedalam iptables agar dapat di akses dari luar jaringan.

### Contoh Skenario iptables
Server hanya boleh diakses via SSH dari kantor (192.168.100.10), IP lainnya ditolak
```
iptables -P INPUT DROP
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -p tcp -s 192.168.100.10 --dport 22 -j ACCEPT
iptables -A INPUT -i lo -j ACCEPT
```
Blokir IP 172.16.15.14 yang dicurigai melakukan brute force
```
iptables -A INPUT 1 -s 172.16.15.14 -j DROP
```
Blokir semua akses kecuali web (80, 443)
```
iptables -P INPUT DROP
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -i lo -j ACCEPT
```
Rate-Limit SSH untuk hindari Brute Force. Maksimal 3 koneksi SSH baru per menit per IP
```
iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW \
  -m recent --set
iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW \
  -m recent --update --seconds 60 --hitcount 3 -j DROP
```
Forwarding NAT untuk Gateway
```
# Enable IP forwarding
echo 1 > /proc/sys/net/ipv4/ip_forward

# NAT (masquerade) koneksi keluar
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

# Izinkan forwarding
iptables -A FORWARD -i eth1 -o eth0 -j ACCEPT
iptables -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
```

Fakta penting: iptables membaca rule dari atas ke bawah (top-down matching). Begitu satu rule cocok (match), tindakan (ACCEPT, DROP, dll.) langsung dieksekusi, dan tidak lanjut ke rule berikutnya.

Ada satu kasus dimana IP dicurigai bruteforce SSH ke server, dan setelah di cek iptables ternyata default service SSH sudah auto accept. Artinya: semua IP diizinkan mengakses port 22 (SSH).
```
Chain INPUT (policy DROP 0 packets, 0 bytes)
num   pkts bytes target     prot opt in     out     source               destination         
1      245   12K ACCEPT     tcp  --  anywhere       anywhere             tcp dpt:ssh
2        0     0 ACCEPT     all  --  lo     any     anywhere             anywhere             /* Allow loopback or localhost */
3        2   168 ACCEPT     icmp --  any    any     anywhere             anywhere             /* Allow Ping */
```
Jika menambahkan rule DROP untuk IP tersebut setelah rule ACCEPT, maka tidak akan pernah dijalankan karena sudah lolos di rule pertama (ACCEPT semua IP untuk SSH). Solusinya adalah tambahkan rule DROP diatas rule ACCEPT
```
iptables -I INPUT 1 -p tcp -s 192.168.167.12 --dport 22 -j DROP
```
Kenapa `-I INPUT 1`?

- `I` berarti **insert** (menyisipkan).
- `1` berarti disisipkan sebagai **rule pertama** dalam chain `INPUT`.
- Jadi iptables akan memeriksa rule ini **sebelum rule ACCEPT**.

Setelah itu verifikasi:
```
iptables -L INPUT -n --line-numbers
```
Contoh output:
```
Chain INPUT (policy DROP 0 packets, 0 bytes)
num   pkts bytes target     prot opt in     out     source               destination         
1        0     0 DROP       tcp  --  any    any     192.168.167.12       anywhere             tcp dpt:ssh
2      245   12K ACCEPT     tcp  --  anywhere       anywhere             tcp dpt:ssh
3        0     0 ACCEPT     all  --  lo     any     anywhere             anywhere             /* Allow loopback or localhost */
4        2   168 ACCEPT     icmp --  any    any     anywhere             anywhere             /* Allow Ping */

```
### Simpan Perubahan
iptables tidak secara otomatis menyimpan perubahan ketika kita melakukan modifikasi rule, jika lupa menyimpan perubahan iptables akan mengakibatkan rule tersebut hilang saat di reboot.

Jalankan perintah berikut untuk distribusi Redhat:
```
service iptables save
```
Contoh output:
```
iptables: Saving firewall rules to /etc/sysconfig/iptables:[  OK  ]
```
Jalankan perintah berikut untuk distribusi Debian:
```
netfilter-persistent save
```
### Log Packet
Log Semua Paket:
```
iptables -A INPUT -j LOG --log-prefix "DROP INPUT: " --log-level 4
```
Log IP yang Mencurigakan:
```
iptables -A INPUT -s 203.0.113.45 -j LOG --log-prefix "BLOCKED IP: " --log-level 4
```
Log Semua Ping Masuk:
```
iptables -A INPUT -p icmp --icmp-type echo-request -j LOG --log-prefix "PING REQUEST: " --log-level 4
```

Cek log apabila menggunakan `syslog` maka silahkan cek berikut:
```
tail -f /var/log/messages
```
Untuk sistem berbasis journald (seperti CentOS 7+, AlmaLinux, dsb):
```
journalctl | grep "BLOCKED IP:"
```
Atau bisa menggunakan `dmesg`:
```
dmesg | grep "BLOCKED IP"
```
### Hapus Rule 
Tidak hanya menambahkan aturan (`rule`) untuk mengizinkan atau memblokir koneksi, tetapi juga perlu menghapus atau mengatur ulang aturan tersebut saat konfigurasi berubah atau tidak lagi diperlukan.

Menghapus rule iptables dapat dilakukan dengan dua cara utama:

- Berdasarkan **nomor urutan (line number)**
- Berdasarkan **isi rule itu sendiri**

Hapus berdasarkan line number. Cek rule terlebih dahulu sebelum menghapus:
```
iptables -L -v --line-numbers
```
Contoh output:
```
Chain INPUT (policy DROP 1 packets, 304 bytes)
num   pkts bytes target     prot opt in     out     source               destination         
1     1435  116K ACCEPT     all  --  any    any     anywhere             anywhere             state RELATED,ESTABLISHED
2        0     0 ACCEPT     all  --  lo     any     anywhere             anywhere             /* Allow loopback or localhost */
3        0     0 ACCEPT     icmp --  any    any     anywhere             anywhere             /* Allow Ping */
```
Untuk menghapus line nomor `2` jalankan perintah berikut:
```
iptables -D INPUT 2
```

Hapus berdasarkan isi rule. Cek rule terlebih dahulu:
```
iptables -S
```
Contoh output:
```
-P INPUT DROP
-P FORWARD DROP
-P OUTPUT ACCEPT
-A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
-A INPUT -i lo -m comment --comment "Allow loopback or localhost" -j ACCEPT
-A INPUT -p icmp -m comment --comment "Allow Ping" -j ACCEPT
```
Berikut untuk menghapus input ICMP:
```
iptables -D INPUT -p icmp -m comment --comment "Allow Ping" -j ACCEPT
```

Hapus semua rule:
```
iptables -F
```
Setelah penghapusan, pastikan untuk mengecek ulang:
```
iptables -L -n --line-numbers
```
### Policy `iptables -P INPUT DROP` vs `iptables -A INPUT -j DROP`
```
iptables -P INPUT DROP
```
- Ini menetapkan **kebijakan default (policy)** untuk chain `INPUT`.
- Artinya: **jika tidak ada rule yang cocok**, maka **paket akan DROP secara otomatis**.

```
iptables -A INPUT -j DROP
```
- Bisa terlewati jika ada rule di bawahnya (karena tidak otomatis menutup semua).
- Jika **menaruh rule `DROP` terlalu tinggi**, rule ACCEPT di bawahnya bisa **tidak pernah dijalankan**.

Jadi, mana yang lebih aman?
Gunakan `iptables -P INPUT DROP`. Ini adalah best practice dalam keamanan jaringan. Gunakan prinsip: "Default to deny, then explicitly allow."

