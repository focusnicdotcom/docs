---
title: Networking Configuration
description: Tutorial How to Configure Networking in AlmaLinux 8
sidebar_position: 2
sidebar_label: Networking Configuration
---

In AlmaLinux 8, network configuration can be done through several methods, namely using **nmcli** (command-line), **nmtui** (text interface-based), or directly editing the **ifcfg** configuration file. Each method has its own advantages, such as ease of use, flexibility, or accessibility. The following are the steps to set up a network using either **Static IP** or **DHCP** with any of these methods.

## How to Check Interface

Using nmcli

```
nmcli connection show
```

Using ip link

```
ip link
```

Or

```
ip a
```

The above method can also be used to verify the configuration or check the interface and also the status of the IP address that is assigned to the server.

## Setting via NMCLI

### Static IP

Static IP is used when you want to make sure the device always uses a specific IP address. This is important for servers or devices with specific roles such as a data
base, gateway, or file server.

```
nmcli connection add type ethernet ifname eth0 con-name StaticIP ipv4.method manual ipv4.addresses 192.168.10.100/24 ipv4.gateway 192.168.10.1 ipv4.dns "1.1.1.1,8.8.8.8"
nmcli connection modify StaticIP connection.autoconnect yes
nmcli connection up StaticIP
```

- `type ethernet`: The type of connection to be established (in this case Ethernet).

- `ifname eth0`: The network interface used (change according to your interface).

- `ipv4.addresses`: IP address and subnet mask.

- `ipv4.gateway`: The gateway address to exit to another network.

- `ipv4.dns`: DNS server for domain name resolution.

If you already have an existing interface (usually the interface name follows the physical interface name) then please run the following command:
```
nmcli connection modify eth0 ipv4.method manual ipv4.addresses 192.0.2.1/24 ipv4.gateway 192.168.2.1 ipv4.dns "1.1.1.1,8.8.8.8"
nmcli connection modify eth0 connection.autoconnect yes
nmcli connection up eth0
```

### DHCP IP

DHCP is used if you want the IP address to be assigned automatically by a DHCP server, for example on a dynamic network.

Run the following command to add a DHCP profile
```
nmcli connection add type ethernet ifname eth0 con-name DynamicIP ipv4.method auto
nmcli connection modify DynamicIP connection.autoconnect yes
nmcli connection up DynamicIP
```

If you already have an existing interface (usually the interface name follows the physical interface name) then please run the following command:
```
nmcli connection modify eth0 ipv4.method auto
nmcli connection modify eth0 connection.autoconnect yes
nmcli connection up eth0
```

## Setting via file ifcfg

### Static IP

You can edit the file at `/etc/sysconfig/network-scripts/ifcfg-eth0`.

```
nano /etc/sysconfig/network-scripts/ifcfg-eth0
```

Then add the following parameters
```jsx showLineNumbers title="/etc/sysconfig/network-scripts/ifcfg-eth0"
DEVICE=eth0
ONBOOT=yes
BOOTPROTO=none
IPADDR=192.168.10.100
PREFIX=24
GATEWAY=192.168.10.1
DNS1=8.8.8.8
```

- `DEVICE`: Interface name.

- `ONBOOT`: Whether to set the interface is active at boot.

- `BOOTPROTO`: IP method (`none` means static).

- `PREFIX`: Subnet mask in CIDR format (example: `/24` for 255.255.255.0).

- `GATEWAY`: Default gateway.

- `DNS1`: First DNS Server.

Enable configuration:
```
systemctl restart NetworkManager
```

### DHCP IP

You can edit the file at `/etc/sysconfig/network-scripts/ifcfg-eth0`.

```
nano /etc/sysconfig/network-scripts/ifcfg-eth0
```

Add the following parameters:
```jsx showLineNumbers title="/etc/sysconfig/network-scripts/ifcfg-eth0"
DEVICE=eth0
ONBOOT=yes
BOOTPROTO=dhcp
```

Enable configuration:

```
systemctl restart NetworkManager
```

## Setting via NMTUI

`nmtui` is a text-based tool (Text User Interface) that simplifies network settings using a GUI.

Run `nmtui`:
```
nmtui
```

Pilih menu:

- **Edit a connection** to change the connection configuration.

- **Activate a connection** to activate the network connection.

- **Set system hostname** to set the system host name.

Please click `Edit a connection` to configure the IP. Here is the DHCP IP configuration<br/>
![](/img/almalinux-dhcp.jpg)

Here is the Static IP configuration<br/>
![](/img/almalinux-static.jpg)

If you have selected the IP distribution mode, then the next is to the `Activate a connection` menu, please press `ESC` on the keyboard to return to the previous menu<br/>.
![](/img/almalinux-nmtui-enable-disable.jpg)

## Enable and Disable Interface

Enable Interface using `nmcli`

```
nmcli device connect eth0
```

Using `ip`

```
ip link set eth0 up
```

Disable Interface Using `nmcli`

```
nmcli device disconnect eth0
```

Using `ip`

```
ip link set eth0 down
```
