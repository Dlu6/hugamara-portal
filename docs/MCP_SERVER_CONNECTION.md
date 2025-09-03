## MCP Server Connection (EC2)

- Host: `ec2-3-108-42-65.ap-south-1.compute.amazonaws.com`
- User: `admin`
- Key: `~/Downloads/hugamara.pem`

### Connect
```bash
ssh -i ~/Downloads/hugamara.pem admin@ec2-3-108-42-65.ap-south-1.compute.amazonaws.com
```

### Elevate to root
```bash
sudo -i
```

### One-liner to deploy/update (admin)
```bash
scp -i ~/Downloads/hugamara.pem /Users/Mydhe\ Files/Hugamara/deploy-to-ec2-admin.sh admin@ec2-3-108-42-65.ap-south-1.compute.amazonaws.com:/home/admin/
ssh -i ~/Downloads/hugamara.pem admin@ec2-3-108-42-65.ap-south-1.compute.amazonaws.com "chmod +x /home/admin/deploy-to-ec2-admin.sh && sudo /home/admin/deploy-to-ec2-admin.sh"
```

### Service locations
- App repo: `/home/admin/hugamara`
- Frontend build: `/home/admin/hugamara/client/build`
- Backend: `/home/admin/hugamara/backend` (PM2 name: `hugamara-backend`)
- Nginx site: `/etc/nginx/sites-available/hugamara`

### Quick checks
```bash
pm2 status
curl -sSf http://127.0.0.1:5000/health
sudo nginx -t
sudo systemctl status nginx
```
