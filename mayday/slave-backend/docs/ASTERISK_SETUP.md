# Asterisk Configuration Setup Guide

This guide explains how to configure Asterisk manager.conf and ODBC for the Mayday Contact Center system.

## Overview

The Mayday system requires:

1. **Asterisk Manager Interface (AMI)** - for real-time call control
2. **ODBC Database Connection** - for call detail records and data storage
3. **Proper user permissions** - for AMI access

## Configuration Files

### 1. Manager Configuration (`/etc/asterisk/manager.conf`)

```ini
[general]
enabled = yes
port = 5038
bindaddr = 0.0.0.0

[admin]
secret = admin123
deny = 0.0.0.0/0.0.0.0
permit = 127.0.0.1/255.255.255.0
permit = 192.168.0.0/255.255.0.0
permit = 10.0.0.0/255.0.0.0
permit = 172.16.0.0/255.240.0.0
read = system,call,log,verbose,agent,user,config,dtmf,reporting,cdr,dialplan
write = system,call,agent,user,config,command,reporting,originate
```

### 2. ODBC Configuration (`/etc/odbc.ini`)

```ini
[general]

[asterisk]
Description = Asterisk Database Connection
Driver = MariaDB
Server = cs.hugamara.com
Port = 3306
Database = asterisk
User = hugamara_user
Password = Pasword@256
Option = 3
```

## Installation Steps

### On EC2 Server (Production)

1. **Install ODBC MariaDB Driver**

   ```bash
   sudo apt-get update
   sudo apt-get install -y unixodbc unixodbc-dev odbc-mariadb mariadb-server mariadb-client
   ```

2. **Copy Configuration Files**

   ```bash
   # Copy manager.conf
   sudo cp /path/to/mayday/slave-backend/config/asterisk/manager.conf /etc/asterisk/manager.conf
   sudo chown asterisk:asterisk /etc/asterisk/manager.conf
   sudo chmod 640 /etc/asterisk/manager.conf

   # Copy odbc.ini
   sudo cp /path/to/mayday/slave-backend/config/asterisk/odbc.ini /etc/odbc.ini
   sudo chmod 644 /etc/odbc.ini
   ```

3. **Test ODBC Connection**

   ```bash
   isql -v "asterisk"
   ```

4. **Restart Asterisk**
   ```bash
   sudo systemctl restart asterisk
   sudo systemctl status asterisk
   ```

### On Local Development Machine (macOS)

1. **Install ODBC MariaDB Driver**

   ```bash
   brew install unixodbc mariadb-connector-odbc
   ```

2. **Copy Configuration Files**

   ```bash
   # Copy manager.conf (requires sudo)
   sudo cp /path/to/mayday/slave-backend/config/local/manager.conf /etc/asterisk/manager.conf
   sudo chown root:wheel /etc/asterisk/manager.conf
   sudo chmod 640 /etc/asterisk/manager.conf

   # Copy odbc.ini
   sudo cp /path/to/mayday/slave-backend/config/local/odbc.ini /etc/odbc.ini
   sudo chmod 644 /etc/odbc.ini
   ```

3. **Test ODBC Connection**
   ```bash
   isql -v "asterisk"
   ```

## Environment Variables

The following environment variables must be set in your `.env` file:

```bash
# AMI Configuration
AMI_HOST=localhost
AMI_PORT=5038
ASTERISK_AMI_USERNAME=admin
AMI_PASSWORD=admin123

# Database Configuration
DB_HOST=cs.hugamara.com
DB_NAME=asterisk
DB_USER=hugamara_user
DB_PASSWORD=Pasword@256
DB_PORT=3306

# Security
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_here
```

## Verification

### 1. Test AMI Connection

```bash
telnet localhost 5038
# You should see: "Asterisk Call Manager/X.X"
```

### 2. Test ODBC Connection

```bash
isql -v "asterisk"
# You should see: "Connected!"
```

### 3. Check Asterisk Logs

```bash
# On Linux
sudo journalctl -u asterisk -f

# On macOS
tail -f /var/log/asterisk/full
```

## Troubleshooting

### Common Issues

1. **AMI Connection Failed**

   - Check if Asterisk is running: `systemctl status asterisk`
   - Verify manager.conf syntax: `asterisk -T -c`
   - Check firewall settings: `ufw status`

2. **ODBC Connection Failed**

   - Verify database credentials
   - Check network connectivity to database server
   - Ensure ODBC driver is installed: `odbcinst -q -d`

3. **Permission Denied**
   - Check file ownership: `ls -la /etc/asterisk/manager.conf`
   - Verify asterisk user exists: `id asterisk`

### Debug Commands

```bash
# Check Asterisk configuration
asterisk -T -c

# Test ODBC drivers
odbcinst -q -d

# Check ODBC data sources
odbcinst -q -s

# Test specific ODBC connection
isql -v "asterisk" -b
```

## Security Notes

- Change default passwords in production
- Restrict AMI access to specific IP ranges
- Use strong JWT secrets
- Regularly update Asterisk and ODBC drivers
- Monitor AMI access logs

## Next Steps

After successful configuration:

1. Start the Mayday backend service
2. Verify AMI connection in logs
3. Test call monitoring features
4. Configure additional Asterisk modules as needed
