# Raspberry Pi Deployment Guide — Orangyy Carpels

Complete step-by-step instructions to host Orangyy Carpels on a **Raspberry Pi (Raspberry Pi OS / Ubuntu ARM64)** with **MySQL/MariaDB**, **PM2**, and **Nginx**.

---

## 1. Install System Packages & Node.js 20 LTS

On your Raspberry Pi terminal (64-bit OS / ARM64):

```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install Git, Nginx, and Build Essentials
sudo apt install -y git curl wget gnupg nginx build-essential lsb-release

# Install Node.js 20 LTS (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 Process Manager globally
sudo npm install -g pm2
```

---

## 2. Install & Configure MySQL 8.4 (LTS)

Orangyy Carpels uses **MySQL 8.4 LTS** as its backend database.

### Step 2.1: Add Official MySQL 8.4 LTS APT Repository
```bash
# Download the MySQL APT repository configuration package
wget https://dev.mysql.com/get/mysql-apt-config_0.8.33-1_all.deb

# Configure repository (Select "MySQL Server & Cluster" -> Choose "mysql-8.4-lts" -> Select "Ok")
sudo dpkg -i mysql-apt-config_0.8.33-1_all.deb

# Update package lists with MySQL 8.4 repo
sudo apt update

# Install MySQL Server 8.4 LTS
sudo apt install -y mysql-server
```

### Step 2.2: Enable Service & Create Database
```bash
# Start and enable MySQL service
sudo systemctl enable mysql
sudo systemctl start mysql

# Log in to MySQL root console
sudo mysql -u root
```

Inside the MySQL shell, execute:

```sql
CREATE DATABASE orangyycarpels CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Replace 'YourStrongPassword123!' with your desired password
CREATE USER 'orangyyapp'@'%' IDENTIFIED WITH caching_sha2_password BY 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON orangyycarpels.* TO 'orangyyapp'@'%';
FLUSH PRIVILEGES;
EXIT;
```

---

## 3. Clone Repository & Setup Environment

```bash
# Navigate to web root or home directory
sudo mkdir -p /var/www
cd /var/www
sudo git clone <YOUR_GIT_REPO_URL> orangy-carpels
sudo chown -R $USER:$USER /var/www/orangy-carpels
cd /var/www/orangy-carpels

# Configure backend .env
cd backend
cp .env.example .env
nano .env
```

Update `DATABASE_URL` in `backend/.env`:
```env
PORT=5001
HOST=0.0.0.0
COOKIE_SECRET=studio-orangy-carpels-session-security-secret-32-chars
DATABASE_URL="mysql://orangyyapp:YourStrongPassword123!@127.0.0.1:3306/orangyycarpels"
```

---

## 4. Run Automated Deployment Script

From the project root:

```bash
cd /var/www/orangy-carpels
./deploy/deploy.sh
```

This script automatically:
- Installs dependencies
- Compiles TypeScript for backend & frontend
- Syncs schema with MySQL (`prisma db push`)
- Starts the backend using **PM2**

---

## 5. Configure Nginx Reverse Proxy

```bash
# Copy Nginx template to sites-available
sudo cp deploy/nginx.conf.template /etc/nginx/sites-available/orangy-carpels

# Enable the site and remove default
sudo ln -s /etc/nginx/sites-available/orangy-carpels /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6. Enable Automatic Startup on Boot

Ensure PM2 and Nginx restart automatically if the Raspberry Pi reboots:

```bash
# Generate and configure PM2 startup script
pm2 startup
# (Run the sudo command that PM2 prints in the terminal)

# Save current PM2 process list
pm2 save

# Enable Nginx on system boot
sudo systemctl enable nginx
```

---

## 7. Accessing the Application

- **Local Network**: Open your browser and navigate to `http://<RASPBERRY_PI_IP>` (e.g. `http://192.168.1.50`).
- **Super Admin Login**:
  - **Email**: `arun@orangy.design`
  - **Employee ID**: `AODE0001`
