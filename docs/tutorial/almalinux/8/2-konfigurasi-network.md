---
title: Konfigurasi Networking
description: Tutorial Cara Konfigurasi Networking di AlmaLinux 8
sidebar_position: 2
sidebar_label: Konfigurasi Networking
---

Pada AlmaLinux 8, konfigurasi jaringan dapat dilakukan melalui beberapa metode, yaitu menggunakan **nmcli** (command-line), **nmtui** (berbasis antarmuka teks), atau langsung mengedit file konfigurasi **ifcfg**. Setiap metode memiliki kelebihan masing-masing, seperti kemudahan penggunaan, fleksibilitas, atau aksesibilitas. Berikut ini adalah langkah-langkah untuk mengatur jaringan baik menggunakan **Static IP** maupun **DHCP** dengan semua metode tersebut.

## Cara Cek Interface

Menggunakan nmcli

```
nmcli connection show
```

Menggunakan ip link

```
ip link
```

Atau

```
ip a
```

Cara diatas juga bisa digunakan untuk verifikasi konfigurasi atau cek interface dan juga status IP address yang di <i>assign</i> ke server.

## Setting via NMCLI

### Static IP

Static IP digunakan saat Anda ingin memastikan perangkat selalu menggunakan alamat IP tertentu. Hal ini penting untuk server atau perangkat dengan peran spesifik seperti database, gateway, atau file server.

```
nmcli connection add type ethernet ifname eth0 con-name StaticIP ipv4.method manual ipv4.addresses 192.168.10.100/24 ipv4.gateway 192.168.10.1 ipv4.dns "1.1.1.1,8.8.8.8"
nmcli connection modify StaticIP connection.autoconnect yes
nmcli connection up StaticIP
```

- `type ethernet`: Jenis koneksi yang akan dibuat (dalam hal ini Ethernet).

- `ifname eth0`: Interface jaringan yang digunakan (ubah sesuai interface Anda).

- `ipv4.addresses`: Alamat IP dan subnet mask.

- `ipv4.gateway`: Alamat gateway untuk keluar ke jaringan lain.

- `ipv4.dns`: DNS server untuk resolusi nama domain.

Jika sudah memiliki existing interface (biasanya nama interface mengikut nama interface fisik)  maka silahkan jalankan perintah berikut:
```
nmcli connection modify eth0 ipv4.method manual ipv4.addresses 192.0.2.1/24 ipv4.gateway 192.168.2.1 ipv4.dns "1.1.1.1,8.8.8.8"
nmcli connection modify eth0 connection.autoconnect yes
nmcli connection up eth0
```

### DHCP IP

DHCP digunakan jika Anda ingin alamat IP ditetapkan secara otomatis oleh server DHCP, misalnya pada jaringan dinamis.

Jalankan perintah berikut untuk menambahkan profile DHCP
```
nmcli connection add type ethernet ifname eth0 con-name DynamicIP ipv4.method auto
nmcli connection modify DynamicIP connection.autoconnect yes
nmcli connection up DynamicIP
```

Jika sudah memiliki existing interface (biasanya nama interface mengikut nama interface fisik)  maka silahkan jalankan perintah berikut:
```
nmcli connection modify eth0 ipv4.method auto
nmcli connection modify eth0 connection.autoconnect yes
nmcli connection up eth0
```

## Setting via file ifcfg

### Static IP

Anda bisa mengedit file pada `/etc/sysconfig/network-scripts/ifcfg-eth0`

```
nano /etc/sysconfig/network-scripts/ifcfg-eth0
```

Kemudian tambahkan parameter berikut

```jsx showLineNumbers title="/etc/sysconfig/network-scripts/ifcfg-eth0"
DEVICE=eth0
ONBOOT=yes
BOOTPROTO=none
IPADDR=192.168.10.100
PREFIX=24
GATEWAY=192.168.10.1
DNS1=8.8.8.8
```

- `DEVICE`: Nama interface.

- `ONBOOT`: Apakah interface aktif saat boot.

- `BOOTPROTO`: Metode IP (`none` berarti static).

- `PREFIX`: Subnet mask dalam format CIDR (contoh: `/24` untuk 255.255.255.0).

- `GATEWAY`: Default gateway.

- `DNS1`: DNS server pertama.

Aktifkan konfigurasi:

```
systemctl restart NetworkManager
```

### DHCP IP

Anda bisa mengedit file pada `/etc/sysconfig/network-scripts/ifcfg-eth0`

```
nano /etc/sysconfig/network-scripts/ifcfg-eth0
```

Tambahkan parameter berikut:
```jsx showLineNumbers title="/etc/sysconfig/network-scripts/ifcfg-eth0"
DEVICE=eth0
ONBOOT=yes
BOOTPROTO=dhcp
```

Aktifkan konfigurasi:

```
systemctl restart NetworkManager
```

## Setting via NMTUI

`nmtui` adalah alat berbasis teks (Text User Interface) yang mempermudah pengaturan jaringan menggunakan GUI.

Jalankan `nmtui`:

```
nmtui
```

Pilih menu:

- **Edit a connection** untuk mengubah konfigurasi koneksi.

- **Activate a connection** untuk mengaktifkan koneksi jaringan.

- **Set system hostname** untuk mengatur nama host sistem.

Silahkan klik `Edit a connection` untuk mengkonfigurasi IP. Berikut adalah konfigurasi IP DHCP<br/>
![](/img/almalinux-dhcp.jpg)

Berikut adalah konfigurasi IP Static<br/>
![](/img/almalinux-static.jpg)

Jika sudah memilih mode distribusi IP, maka selanjutnya adalah ke menu `Activate a connection` silahkan tekan `ESC` pada keyboard untuk kembali ke menu sebelumnya<br/>
![](/img/almalinux-nmtui-enable-disable.jpg)

## Enable dan Disable Interface

Enable Interface Menggunakan `nmcli`

```
nmcli device connect eth0
```

Menggunakan `ip`

```
ip link set eth0 up
```

Disable Interface Menggunakan `nmcli`

```
nmcli device disconnect eth0
```

Menggunakan `ip`

```
ip link set eth0 down
```
