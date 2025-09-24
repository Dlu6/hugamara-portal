## MCP Server Connection (EC2 - Call Center VM)

- Host: `ec2-13-234-18-2.ap-south-1.compute.amazonaws.com`
- User: `admin`
- Key: `~/Downloads/hugamara.pem`

### Connect

```bash
ssh -i ~/Downloads/hugamara.pem admin@ec2-13-234-18-2.ap-south-1.compute.amazonaws.com
```

### Elevate to root

```bash
sudo -i
```

### One-liner to deploy/update (admin)

```bash
scp -i ~/Downloads/hugamara.pem /Users/Mydhe\ Files/Hugamara/deploy-to-ec2-admin.sh admin@ec2-13-234-18-2.ap-south-1.compute.amazonaws.com:/home/admin/
ssh -i ~/Downloads/hugamara.pem admin@ec2-13-234-18-2.ap-south-1.compute.amazonaws.com "chmod +x /home/admin/deploy-to-ec2-admin.sh && sudo /home/admin/deploy-to-ec2-admin.sh"
```

### Call Center service locations

- Repo: `/home/admin/hugamara`
- Mayday slave backend (PM2): `/home/admin/hugamara/mayday/slave-backend`
- Nginx site: `/etc/nginx/sites-available/hugamara`

### Quick checks

```bash
pm2 status
curl -sSf http://127.0.0.1:5001/api/health # Check call center backend
sudo nginx -t
sudo systemctl status nginx
```

### MySQL (root) quick checks

```bash
sudo mysql -uroot -e "SHOW DATABASES; USE asterisk; SELECT DATABASE();"
```

### Fix duplicate indexes (Too many keys)

```bash
# Run this script on the VM as root if you see ER_TOO_MANY_KEYS

# --- Fix for dialplan_contexts ---
DB=asterisk
TBL=dialplan_contexts
COL=name
mysql -uroot -N -e "SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA='${DB}' AND TABLE_NAME='${TBL}' AND COLUMN_NAME='${COL}' AND INDEX_NAME NOT IN ('PRIMARY', 'ux_${TBL}_${COL}');" | while read idx; do
  if [ -n "$idx" ]; then
    echo "Dropping index: $idx from ${TBL}"
    mysql -uroot "$DB" -e "ALTER TABLE ${TBL} DROP INDEX \`$idx\`"
  fi
done
mysql -uroot "${DB}" -e "CREATE UNIQUE INDEX ux_${TBL}_${COL} ON ${TBL} (${COL});" || echo "Index on ${TBL} already exists."

# --- Fix for client_session ---
TBL=client_session
COL=session_token
mysql -uroot -N -e "SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA='${DB}' AND TABLE_NAME='${TBL}' AND COLUMN_NAME='${COL}' AND INDEX_NAME <> 'PRIMARY';" | while read idx; do
  if [ -n "$idx" ]; then
    echo "Dropping index: $idx from ${TBL}"
    mysql -uroot "$DB" -e "ALTER TABLE ${TBL} DROP INDEX \`$idx\`"
  fi
done
mysql -uroot "${DB}" -e "CREATE UNIQUE INDEX ux_${TBL}_${COL} ON ${TBL} (${COL}(255));" || echo "Index on ${TBL} already exists."
```
