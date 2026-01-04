---
title: firewalld
description: Tutorial Firewalld on Linux
sidebar_position: 104
sidebar_label: firewalld
---
Firewalld is an iptables/nftables-based firewall management frontend, which provides dynamic network access control (without service restart) using zones and services
. Firewalld replaces the old way of manually managing firewalls using iptables.

## Firewalld Concept
Firewall zones determine the trust level of network connections based on the interface.

| Zone | Description | Default Policy | When to Use |
| --- | --- | --- | --- |
| 🔒 `block` | All **inbound connections are blocked**, **except** outbound connections. | **DROP** | For highly untrusted interfaces. |
| 🛑 `drop` | All incoming connections are discarded without notice**. | **DROP** | Maximum security, stealth mode (invisible to attackers). |
| 🧱 `dmz` (Demilitarized Zone) | For servers in the DMZ; only certain services are allowed. | **DROP** | If the host is on a semi-public network, such as a web/mail server. |
| 🌐 `external` | For public-facing interfaces. Usually used with NAT. | **DROP** | A gateway server or router that forwards connections to the LAN. |
| 🏠 `home` | For most trusted networks (home, private Wi-Fi). | **ACCEPT** | Personal PC/laptop on home network. |
| 🏢 `internal` | Internal company/organization network. | **ACCEPT** | Servers or workstations on a trusted local LAN. |
| 🔁 `nm-shared` | Used by **NetworkManager** for connections that are *shared* between devices. | **ACCEPT** | If the connection is shared via hotspot/tethering from the host. |
| 🌎 `public` (Default) | The assumption is that the network is **not trusted**. | **DROP** | For all public/internet connections (default on many systems). |
| ✅ `trusted` | **All connections are allowed** without filters. | **ACCEPT ALL** | Use only for truly secure interfaces. |
| 🧑‍💻 `work` || A trusted work network, stricter than trusted. | **ACCEPT** | Office laptops/PCs on the company LAN. |

Example of using zone firewalld
| Zones | Trust | Entry Access | Usage Examples |
| --- | --- | --- | --- |
| `trusted` | 🔓 Very high | All permitted | Isolated private network |
| `home` | 👍 High | Default + sharing | Home Wi-Fi |
| `work` | 👍 High | Default + ssh/samba | Office LAN |
| `internal` | 👍 High | Limited service access | Internal VLAN, backend server |
| `public` | ⚠️  Low | Only authorized | Internet/public LAN |
| `dmz` | ⚠️  Low | Specific services only | DMZ servers (web/mail) |
| `external` | ⚠️  Low | NAT routing, limited | NAT router/gateway  |
| `block` | ❌ Untrusted | Drop all connections | Connections from risky sources |
| `drop` | ❌ Untrusted | Silent drop (stealth) | Servers that don't want to be detected |
| `nm-shared` | 🔄 Special | Auto-configured | NetworkManager shared connection |

Firewalld uses predefined service names (for example: `ssh`, `http`, `https`) to open ports. Here is the list of default services from firewalld:
```
RH-Satellite-6 RH-Satellite-6-capsule amanda-client amanda-k5-client amqp amqps apcupsd audit bacula bacula-client bb bgp bitcoin bitcoin-rpc bitcoin-testnet bitcoin-testnet-rpc bittorrent-lsd ceph ceph-mon cfengine cockpit collectd condor-collector ctdb dhcp dhcpv6 dhcpv6-client distcc dns dns-over-tls docker-registry docker-swarm dropbox-lansync elasticsearch etcd-client etcd-server finger foreman foreman-proxy freeipa-4 freeipa-ldap freeipa-ldaps freeipa-replication freeipa-trust ftp galera ganglia-client ganglia-master git grafana gre high-availability http https imap imaps ipp ipp-client ipsec irc ircs iscsi-target isns jenkins kadmin kdeconnect kerberos kibana klogin kpasswd kprop kshell kube-apiserver ldap ldaps libvirt libvirt-tls lightning-network llmnr managesieve matrix mdns memcache minidlna mongodb mosh mountd mqtt mqtt-tls ms-wbt mssql murmur mysql nbd nfs nfs3 nmea-0183 nrpe ntp nut openvpn ovirt-imageio ovirt-storageconsole ovirt-vmconsole plex pmcd pmproxy pmwebapi pmwebapis pop3 pop3s postgresql privoxy prometheus proxy-dhcp ptp pulseaudio puppetmaster quassel radius rdp redis redis-sentinel rpc-bind rquotad rsh rsyncd rtsp salt-master samba samba-client samba-dc sane sip sips slp smtp smtp-submission smtps snmp snmptrap spideroak-lansync spotify-sync squid ssdp ssh steam-streaming svdrp svn syncthing syncthing-gui synergy syslog syslog-tls telnet tentacle tftp tftp-client tile38 tinc tor-socks transmission-client upnp-client vdsm vnc-server wbem-http wbem-https wsman wsmans xdmcp xmpp-bosh xmpp-client xmpp-local xmpp-server zabbix-agent zabbix-server
```

In the firewall management system firewalld, rules can be classified into two types: permanent and temporary. When a rule is added or modified, the behavior of the currently active firewall will be updated immediately. However, it is important to note that upon the next reboot, all these temporary changes will be ignored, and the previously set
rules will be applied again.

Most operations performed using `firewall-cmd` can utilize the `-permanent` flag. This flag indicates that the modifications made are permanent
, so that the changes will remain even after the system is rebooted. This separation between permanent and immediate rules provides flexibility, allowing administrators
 to test various rules in an active firewall environment without the risk of losing previously set configurations. If problems are found, administrators can de
easily reload the configuration with no long-term impact.

In addition, the `--permanent` flag can be used to build and structure the entire rule set incrementally. This way, all changes can be applied at once when the reload command is executed, ensuring that all new rules function coherently and as expected. This method not only optimizes fir
ewall rule management, but also improves overall system reliability and security.

## Check Firewalld
Run the following command to check the status of firewalld:
```
firewall-cmd --state
```
Sample output:
```
running
```
Install firewalld if not already installed
:::info
Use the package manager according to your Linux operating system distribution.
:::
```
dnf install firewalld
systemctl enable --now firewalld
```
Check the default zone
```
firewall-cmd --get-default-zone
```
Sample output:
```
public
```
Check the active zone:
```
firewall-cmd --get-active-zones
```
Sample output:
```
public
  interfaces: ens18
```
Check the other zones available:
```
firewall-cmd --get-zones
```
Sample output:
```
block dmz drop external home internal nm-shared public trusted work
```
Check the rule applied to the `public` zone:
```
firewall-cmd --list-all --zone=public
```
Sample output:
```
public (active)
  target: default
  icmp-block-inversion: no
  interfaces: ens18
  sources: 
  services: cockpit dhcpv6-client ssh
  ports: 
  protocols: 
  forward: no
  masquerade: no
  forward-ports: 
  source-ports: 
  icmp-blocks: 
  rich rules: 
```
Check ports/services in firewalld, can use the `--zone=$NAME_ZONE` option if you want to be specific:
```
firewall-cmd --list-ports
firewall-cmd --list-services
```
Check all the zones and rules that apply:
```
firewall-cmd --list-all-zones
```
You can also use `less` to easily see the list that appears
```
firewall-cmd --list-all-zones | less
```
## Configure Firewalld
In the firewall management system `firewalld`, when a `port` or `service` is added, it means that access for incoming and outgoing connections through 
that port is allowed. This addition automatically opens a communication path for the service in question, allowing interaction with outside applications and users.

However, if a port or service is not added or defined in firewalld, it will remain closed and blocked by default. In this
situation, only outgoing connections from the server are allowed, so the server can send data outward without problems, but cannot receive connections from external sources.
 This creates an additional layer of security, as only explicitly authorized services can interact with the system.

As such, port and service management within the firewalld becomes extremely important to ensure that only necessary communications are allowed, while maintaining the integrity and security of the server from potential threats originating from unauthorized connections.

### Add Port/Service
The command to add port `8080` temporarily until the next reboot:
```
firewall-cmd --add-port=8080/tcp
```
Command to add port `8080` permanently:
```
firewall-cmd --add-port=8080/tcp --permanent
```
Command to add `http` service temporarily until the next reboot:
:::info
To add a service to firewalld, it is assumed that the service already exists in the firewalld predefined service, if not then just add the port.
:::
```
firewall-cmd --add-service=http
```
Command to add `http` service permanently:
```
firewall-cmd --add-service=http --permanent
```
If all ports/services have been added, then the next step is to reload firewalld:
```
firewall-cmd --reload
```
Then verify ports/services globally
```
firewall-cmd --list-ports
firewall-cmd --list-services
```
Verify permanently set ports/services
```
firewall-cmd --list-ports --permanent
firewall-cmd --list-services --permanent
```

### Delete Port/Service
Command to remove port `8080` temporarily until the next reboot:
```
firewall-cmd --remove-port=8080/tcp
```
Command to permanently delete port `8080`:
```
firewall-cmd --remove-port=8080/tcp --permanent
``` 
Command to remove the `httpd` service temporarily until the next reboot:
```
firewall-cmd --remove-service=http
```
Command to remove the `httpd` service by default:
```
firewall-cmd --remove-service=http --permanent
```
### Add Zone in Firewalld
Although this method is rarely implemented, creating zones in Firewalld provides the flexibility of more segmented and structured network security control, especially 
when the server or host has multiple interfaces, subnets, or as a network gateway.

Use case
| Use Case | Zone Name | Function |
| --- | --- | --- |
| 🔌 Server with 2 NICs (1 to internet, 1 to LAN) | `lan` and `wan` | `wan` only open 80/443, `lan` can access 22 and DB |
| 🌐 Web server that is also a VPN endpoint | `vpn` and `public` | `vpn` can access everything, `public` only 80/443 |
| 🧪 KVM Lab / Docker host | `lab-internal`, `external` | Only certain IPs in `lab-internal` can SSH to host |
| 🏢 Offices with different VLANs | `hr-zone`, `it-zone`, `guest-zone` | Each zone has different access (e.g. `hr-zone` can go to payroll, `guest-zone` can't) |
| 📦 Isolate critical services | `db-zone`, `web-zone` | `db-zone` only accepts from `web-zone`, not public |

Create a new zone:
```
firewall-cmd --permanent --new-zone=internal-lan
```
Add interface `ens18` to this zone:
```
firewall-cmd --permanent --zone=internal-lan --add-interface=ens18
```
Add the service/port to this zone:
```
firewall-cmd --permanent --zone=internal-lan --add-service=ssh
firewall-cmd --permanent --zone=internal-lan --add-port=8080/tcp
```
Reload firewalld so that the rule activates immediately:
```
firewall-cmd --reload
```
Verify:
```
firewall-cmd --get-active-zones
```
Sample output:
```
internal-lan
  interfaces: ens18
```
### Change Default Zone
Check the current default zone:
```
firewall-cmd --get-default-zone
```
Sample output:
```
public
```
Change the default zone to `home`:
```
firewall-cmd --set-default-zone=home
```
If you have more than one interface, you can also apply zones specifically to interfaces:
```
firewall-cmd --zone=home --change-interface=ens18 --permanent
firewall-cmd --reload
```
Then verify:
```
firewall-cmd --get-active-zones
```
Sample output:
```
home
  interfaces: ens18
```
### Whitelist and Blocklist IPs Using rich-rule
#### Whitelist
Allowing only certain IPs (e.g. 192.168.167.12) to access SSH (port 22) on firewalld and blocking all other IPs, you can use rich rules.

Remove the service or ssh port and reload firewalld:
```
firewall-cmd --remove-port=22/tcp --permanent
firewall-cmd --remove-service=ssh --permanent
firewall-cmd --reload
```

Add a rule to allow `SSH` access from a specific IP and reload firewalld:
:::info
Do not add `--add-service=http` or `https`, as that will open the port to all IPs. Use port only.
:::

```
firewall-cmd --permanent --add-rich-rule='rule family=ipv4 source address=192.168.167.12 port port=22 protocol=tcp accept' ## per IP
firewall-cmd --permanent --add-rich-rule='rule family=ipv4 source address=192.168.162.0/24 port port=22 protocol=tcp accept' ## per subnet
firewall-cmd --reload
```

Then verify:
```
firewall-cmd --list-rich-rules
```

Sample output:
```
rule family="ipv4" source address="192.168.167.12" port port="22" protocol="tcp" accept
```

The command to remove firewalld rich rules:
```
firewall-cmd --permanent --remove-rich-rule='rule family=ipv4 source address=192.168.167.12 port port=22 protocol=tcp accept'
firewall-cmd --reload
```
#### Blacklist
Deny or drop certain IPs (e.g. 192.168.167.12) accessing SSH (port 22) in firewalld and block all other IPs, you can use rich rules.

Add a rule to allow `SSH` access from a specific IP and reload firewalld:

```
firewall-cmd --permanent --add-rich-rule='rule family=ipv4 source address=192.168.167.12 port port=22 protocol=tcp drop' ## per IP
firewall-cmd --permanent --add-rich-rule='rule family=ipv4 source address=192.168.162.0/24 port port=22 protocol=tcp drop' ## per subnet
firewall-cmd --reload
```

Then verify:
```
firewall-cmd --list-rich-rules
```

Sample output:
```
rule family="ipv4" source address="192.168.167.12" port port="22" protocol="tcp" drop
```

The command to remove firewalld rich rules:
```
firewall-cmd --permanent --remove-rich-rule='rule family=ipv4 source address=192.168.167.12 port port=22 protocol=tcp drop'
firewall-cmd --reload
```
## Conclusion
Using Firewalld, we can manage firewall rules in Linux in a more dynamic, structured, and easy-to-understand way. The zone concept allows 
administrators to group interfaces based on trust levels and provide more flexible and secure access control.

Firewalld also supports real-time configuration without having to break active connections, and provides rich rule features for more detailed security needs. This makes it
an excellent choice for use in production server, desktop, and network gateway environments.

Summary of firewalld commands:

| Details | Command |
| --- | --- |
| Check firewall status | `firewall-cmd --state` |
| Add permanent port | `--add-port=xxxx/proto --permanent` |
| Add permanent service | `--add-service=ssh --permanent` |
| Reload rules | `firewall-cmd --reload` |
| View active rules | `firewall-cmd --list-all` |
| Change default zone | `--set-default-zone=home` |

