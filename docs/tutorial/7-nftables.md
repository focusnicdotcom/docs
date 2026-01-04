---
title: nftables
description: Pengertian dan Tutorial Konfigurasi nftables di Linux
sidebar_position: 106
sidebar_label: nftables
---

`nftables` adalah framework firewall modern yang dikembangkan oleh tim Netfilter (sama seperti `iptables`) dan mulai menggantikan:

- `iptables`
- `ip6tables`
- `arptables`
- `ebtables`

`nftables` dirancang untuk:

- Lebih cepat dan efisien
- Lebih konsisten untuk IPv4 dan IPv6
- Lebih fleksibel dan mudah dikelola
- Hanya menggunakan **1 tool utama:** `nft`

## Konsep Dasar nftables
`nftables` berbasis pada struktur hierarki berikut:

| Istilah | Fungsi |
| --- | --- |
| **Table** | Menampung chains dan aturan (default: `inet`, `ip`, `ip6`) |
| **Chain** | Kumpulan aturan berdasarkan event (input, output, forward, dll) |
| **Rule** | Aturan spesifik yang diterapkan (izinkan, tolak, dll) |

Family nftables adalah kelompok protokol yang menentukan bagaimana nftables memproses paket. Berikut adalah daftar family yang tersedia dan fungsinya:

| Family | Protokol yang Didukung | Digunakan Untuk |
| --- | --- | --- |
| `ip` | IPv4 | Filter & NAT untuk IPv4 |
| `ip6` | IPv6 | Filter & NAT untuk IPv6 |
| `inet` | IPv4 dan IPv6 (gabungan) |  **Umumnya digunakan dan rekomendasi** |
| `arp` | ARP | Filtering ARP packet |
| `bridge` | Ethernet Bridge (Layer 2) | Filtering antar bridge |
| `netdev` | Interface level (raw paket) | Early packet filtering, tidak pakai hook |

Penjelasan family `nftables`:
- `ip` khusus untuk IPv4 dan setara dengan `iptables` atau `iptables -4`. Contoh `nft add table ip mytable`
- `ip6` khusus untuk IPv6 dan setara dengan `ip6tables`. Contoh `nft add table ip6 mytable`
- `inet` mendukung IPv4 dan IPv6 secara bersamaan dan sangat direkomendasikan. Contoh `nft add table inet mytable`
- `arp` digunakan untuk filtering ARP (Address Resolution Protocol) dan digunakan pada environment Layer 2 tingkat lanjut
- `bridge` digunakan untuk filtering paket di bridge Ethernet (br0, dll.). Berguna di sistem yang menggunakan bridge antar VM atau container
- `netdev` ada pada tingkat interface dan cocok untuk firewall yang ringan atau DDoS filter

### Tables

- Tabel adalah **wadah utama** yang berisi kumpulan `chains`.
- Setiap tabel beroperasi di **satu keluarga protokol**:
    - `ip` = IPv4
    - `ip6` = IPv6
    - `inet` = gabungan `ip` dan `ip6` (umum digunakan)
    - `arp`, `bridge`, `netdev` = untuk kasus khusus

Contoh:
```
nft add table inet mytable
```

### Chains

- Chain berisi kumpulan `rule`.
- Chain bisa bersifat:
    - **Hooked**: terhubung ke kernel (misalnya untuk INPUT/OUTPUT/FORWARD)
    - **Regular**: tidak otomatis dipanggil, tapi bisa dipanggil oleh rule lain (seperti fungsi)

Hook utama yang digunakan:
| Hook | Fungsi |
| --- | --- |
| `prerouting` | Saat paket pertama kali masuk (digunakan di NAT) |
| `input` | Untuk paket **menuju sistem lokal** (server menerima data) |
| `forward` | Untuk paket yang **melewati sistem** (router) |
| `output` | Untuk paket yang **keluar dari sistem lokal** |
| `postrouting` | Sebelum paket keluar ke jaringan (biasanya untuk SNAT) |

Contoh:
```
nft add chain inet mytable input_chain { type filter hook input priority 0 \; }
```

### Rules
- Rule menentukan tindakan pada paket yang cocok.
- Ditempatkan dalam chain.
- Bisa berupa:
    - **match** (mencocokkan kondisi)
    - **action** (terima, tolak, log, redirect, dll.)

Contoh:
```
nft add rule inet mytable input_chain ip saddr 192.168.1.100 tcp dport 22 accept
```

Rule diatas artinya: jika paket berasal dari IP 192.168.1.100 dan menuju port 22, maka izinkan (accept).

### Alur pada nftables
Berikut untuk alur packet incoming (dari luar ke server):
```
[ Paket Masuk ]
      ↓
+--------------------+
| Kernel Networking  |
+--------------------+
      ↓
[ Hook: prerouting ] → untuk NAT dst
      ↓
[ Hook: input ] → untuk paket masuk ke server (ssh, web, dsb)
      ↓
[ Rule matching di chain input ]
      ↓
  (accept / drop / reject)
```

Berikut untuk alur packet outgoing (dari server ke luar):
```
[ Hook: output ]
      ↓
[ Hook: postrouting ] → NAT src, masquerade, dll
```

Penjelasan:

**1. Paket masuk ke sistem jaringan (Kernel)**:
- Semua lalu lintas jaringan, baik masuk, keluar, atau melewati sistem, akan melalui **stack jaringan Linux**.
- `nftables` akan **menyaring paket ini di berbagai titik (hook)**, tergantung pada jenis chain.

**2. Masuk ke `nftables` Table dan Chain yang terhubung ke Hook**
Setiap paket yang datang akan diarahkan ke **chain tertentu berdasarkan hook-nya**. Chain ini harus berada di dalam `table`, dan memiliki definisi seperti:
```
type filter hook input priority 0
```

**3. Diproses oleh Rule secara urut di dalam Chain**

- Chain terdiri dari **rules**.
- Setiap rule memiliki **kondisi (match)** dan **aksi (action)**.
- Evaluasi dilakukan **secara berurutan dari atas ke bawah**.
- Begitu kondisi cocok, aksi dilakukan:
    - `accept`, `drop`, `reject`, `jump`, `log`, dll.
- Jika tidak ada yang cocok dan tidak ada aksi default, maka paket akan **ditolak secara implisit**.

## Persiapan

Pada beberapa distribusi Linux telah mengadopsi `nftables` sebagai kerangka penyaringan paket default, menggantikan iptables. Ini termasuk Red Hat Enterprise Linux 8 dan yang lebih baru, Rocky Linux, dan Debian 11 dan yang lebih baru.

Cek versi `nftables` dengan perintah berikut:
```
nft -v
```
Contoh ouput:
```
nftables v1.0.4 (Lester Gooch #3)
```
Jika `nftables` belum terinstall silahkan jalankan perintah berikut untuk menginstall:
```
# Redhat distribution
dnf install nftables
systemctl enable --now nftables
systemctl status nftables
# Debian distribution
apt install nftables
systemctl enable --now nftables
systemctl status nftables
```

Apabila menggunakan `firewalld` atau `iptables` silahkan disable agar tidak konflik dengan `nftables`:
```
systemctl stop iptables firewalld
systemctl disable iptables firewalld
systemctl mask iptables firewalld
```
## Konfigurasi nftables

Berikut adalah panduan lengkap dan sistematis cara menggunakan nftables untuk membuat tables, chains, dan rules pada `nftables`.
:::info
`nftables` tidak mendukung replace parameter pada table, chains, atau rules secara langsung. Solusinya adalah re-create atau hapus item lalu buat ulang.
:::

Lihat semua table:
```
nft list tables
```
Lihat semua ruleset:
```
nft list ruleset
```

### Tables
Fungsi tables pada `iptables` adalah untuk menjadi parent atau wadah untuk chains dan rules.

Membuat table:
```
nft add table inet mytable
```
- `inet` → mendukung IPv4 & IPv6 (umumnya dipakai)
- `mytable` → nama tabel

Verifikasi table:
```
nft list tables
```
Contoh output:
```
table inet mytable
```
Menghapus table:
```
nft delete table inet mytable
```
Delete/flush rules di dalam table:
```
nft flush table inet mytable
````
### Chains
Fungsi chain pada `nftables` adalah untuk menampung rules (aturan), dan terhubung dengan hook seperti `input`, `ouput`, dsb.

Membuat chain:
```
nft add chain inet mytable input_chain { type filter hook input priority 0\; policy drop\; }
```
- `type filter` → jenis chain
- `hook input` → menangani trafik masuk
- `priority 0` → urutan eksekusi
- `policy drop` → default action jika tidak ada rule cocok

Cek daftar chain di dalam table:
```
nft list table inet mytable
```
Contoh output:
```
table inet mytable {
        chain input_chain {
                type filter hook input priority filter; policy drop;
        }
}
```
Menghapus chain. Pastikan chain dalam keadaan kosong (tidak ada rule) sebelum dihapus:
```
nft delete chain inet mytable input_chain
```
Delete/flush rules di dalam table:
```
nft flush chain inet mytable input_chain
````
### Rules
Rules pada `nftables` singkatnya untuk memproses packet seperti: accept, drop, log, dsb.

Menambah rule. Contoh rule untuk mengizinkan SSH (port 22):
```
nft add rule inet mytable input_chain tcp dport 22 accept
```
Verifikasi:
```
nft list chain inet mytable input_chain
```
Contoh output:
```
table inet mytable {
        chain input_chain {
                type filter hook input priority filter; policy drop;
                tcp dport 22 accept
        }
}
```
Verifikasi list ruleset dengan format numbering:
```
nft -a list ruleset
```
atau 
```
nft -a list chain inet table_name chain_name
nft -a list chain inet mytable input
```
Contoh output:
```
table inet myfilter { # handle 7
        chain input { # handle 1
                type filter hook input priority filter; policy drop;
                ct state established,related accept # handle 3
                tcp dport 22 accept # handle 13
                iif "lo" accept # handle 4
                ip protocol icmp accept # handle 5
                udp dport 53 accept # handle 8
                tcp dport 50000-51000 accept # handle 9
                tcp dport { 21-22, 25, 53, 80, 443, 465, 5222, 5269, 5280, 8999-9003 } accept # handle 12
        }

        chain forward { # handle 2
                type filter hook forward priority filter; policy drop;
        }
}
```

Menghapus rule berdasarkan number handler:
```
nft delete rule inet mytable input handle number
nft delete rule inet mytable input handle 12
```
Mengubah urutan rule. Berikut contoh rule saat ini:
```
table inet myfilter { # handle 7
        chain input { # handle 1
                type filter hook input priority filter; policy drop;
                ct state established,related accept # handle 3
                iif "lo" accept # handle 4
                ip protocol icmp accept # handle 5
                udp dport 53 accept # handle 8
                tcp dport 50000-51000 accept # handle 9
                tcp dport { 21-22, 25, 53, 80, 443, 465, 5222, 5269, 5280, 8999-9003 } accept # handle 12
        }

        chain forward { # handle 2
                type filter hook forward priority filter; policy drop;
        }
}
```
Misalkan untuk menambahkan rule baru menjadi posisi urutan ke-3 berikut caranya:
```
nft add rule inet myfilter input  position 3 tcp dport 22 accept 
```
Berikut contoh outputnya:
```
table inet myfilter { # handle 7
        chain input { # handle 1
                type filter hook input priority filter; policy drop;
                ct state established,related accept # handle 3
                tcp dport 22 accept # handle 13
                iif "lo" accept # handle 4
                ip protocol icmp accept # handle 5
                udp dport 53 accept # handle 8
                tcp dport 50000-51000 accept # handle 9
                tcp dport { 21-22, 25, 53, 80, 443, 465, 5222, 5269, 5280, 8999-9003 } accept # handle 12
        }

        chain forward { # handle 2
                type filter hook forward priority filter; policy drop;
        }
}
```
rule tersebut muncul di posisi ke-3, namun handle tetap menjadi 13, dan ini adalah perilaku yang sepenuhnya normal dan by design di nftables. Singkatnya seperti berikut:
- `position` menentukan **urutan eksekusi rule dalam chain**.
- `handle` adalah **nomor unik permanen yang ditetapkan oleh kernel saat rule dibuat**, dan **tidak pernah didasarkan pada posisi**.

### Simpan Konfigurasi
Jika menggunakan `nftables.service` konfigurasi sudah otomatis di simpan secara permanen. Silahkan cek dengan perintah berikut jika service `nftables` sudah terinstall
```
systemctl status nftables
```
Contoh output:
```
● nftables.service - Netfilter Tables
   Loaded: loaded (/usr/lib/systemd/system/nftables.service; enabled; vendor preset: disabled)
   Active: active (exited) since Mon 2025-07-07 22:37:07 WIB; 3min 2s ago
...
..
.
```
Lalu, jika sudah aktif silahkan jalankan perintah berikut setiap kali membuat perubahan pada `nftables`.

Jalankan perintah berikut untuk distribusi Redhat:
```
nft list ruleset >/etc/sysconfig/nftables.conf
```
Jalankan perintah berikut untuk distribusi Debian:
```
nft list ruleset > /etc/nftables.conf
```

Dengan konfigurasi diatas, konfigurasi nftables tetap akan persistent (tidak berubah) ketika server di reboot.
### Preset
Berikut preset konfigurasi `nftables` agar lebih mudah manajemen, konfigurasi ini menggunakan preset default DROP. Kebijakan *default drop* pada firewall berarti bahwa semua lalu lintas jaringan yang tidak secara eksplisit diizinkan oleh aturan firewall akan ditolak atau dibuang. Ini adalah pendekatan yang umum digunakan untuk meningkatkan keamanan jaringan. 


Preset untuk web server umum (HTTP, Email, SSH, FTP, dan DNS):
```
# 1. Flush ruleset (table, chains, dan rules) dulu agar bersih
nft flush ruleset

# 2. Buat table baru dengan family inet (IPv4 & IPv6)
nft add table inet myfilter

# 3. Buat chain input (hook input)
nft add chain inet myfilter input {type filter hook input priority 0\; policy drop\;}

# 4. Buat chain forward (juga drop)
nft add chain inet myfilter forward {type filter hook forward priority 0\; policy drop\;}

# 5. Izinkan koneksi yang sudah established/related
nft add rule inet myfilter input ct state established,related accept

# 6. Izinkan loopback interface
nft add rule inet myfilter input iif lo accept

# 7. Izinkan ICMP (ping)
nft add rule inet myfilter input ip protocol icmp accept

# 8. Izinkan koneksi TCP ke banyak port sekaligus
nft add rule inet myfilter input tcp dport {21, 22, 25, 53, 80, 443, 465, 5222, 5269, 5280, 8999-9003} accept

# 9. Izinkan koneksi UDP ke port 53 (DNS)
nft add rule inet myfilter input udp dport 53 accept

# 10. FTP passive data port range (50000-51000)
nft add rule inet myfilter input tcp dport 50000-51000 accept
```
Verifikasi:
```
nft list ruleset
```
Contoh output:
```
table inet myfilter {
        chain input {
                type filter hook input priority filter; policy drop;
                ct state established,related accept
                iif "lo" accept
                ip protocol icmp accept
                tcp dport { 21-22, 25, 53, 80, 443, 465, 5269, 5280, 5522, 8999-9003 } accept
                udp dport 53 accept
                tcp dport 50000-51000 accept
        }

        chain forward {
                type filter hook forward priority filter; policy drop;
        }
}
```
Kemudian simpan konfigurasi:
```
# Jalankan perintah berikut untuk distribusi Redhat:
nft list ruleset >/etc/sysconfig/nftables.conf

# Jalankan perintah berikut untuk distribusi Debian:
nft list ruleset > /etc/nftables.conf
```

Jika menginginkan untuk whitelist IP tertentu untuk mengakses SSH, maka pastikan semua rule sudah ditambahkan sebelumnya dan kuncinya jangan masukkan port tersebut kedalam `nftables` tanpa IP. Berikut untuk whitelist SSH dengan IP:
```
nft add rule inet myfilter input ip saddr 192.168.167.12 tcp dport 22 accept
```
Verifikasi:
```
nft list ruleset
```
Contoh output:
```
table inet myfilter {
        chain input {
                type filter hook input priority filter; policy drop;
                ip saddr 192.168.167.12 tcp dport 22 accept
        }
}
```
Ijinkan IP untuk mengakses server:
```
nft add rule inet myfilter input ip saddr 192.168.167.12 accept
```

Blokir IP yang dicurigai melakukan DDoS:
```
nft add rule inet myfilter input ip saddr 192.168.167.12 drop
```

Blok TCP/UDP, misalnya attacker melakukan scan atau flood port
```
nft add rule inet myfilter input ip saddr 192.168.167.12 ip protocol tcp drop
nft add rule inet myfilter input ip saddr 192.168.167.12 ip protocol udp drop
```
