# Fix MongoDB Connection DNS Timeout Error

## Problem

The error `queryTxt ETIMEOUT project.e5k7hmj.mongodb.net` means your DNS server cannot resolve MongoDB Atlas addresses.

## Solution 1: Change DNS to Google DNS (Recommended)

### Steps:

1. Press `Win + R`, type `ncpa.cpl`, press Enter
2. Right-click your active network adapter (Wi-Fi or Ethernet)
3. Click **Properties**
4. Select **Internet Protocol Version 4 (TCP/IPv4)**
5. Click **Properties**
6. Select **Use the following DNS server addresses**
7. Enter:
   - Preferred DNS: `8.8.8.8`
   - Alternate DNS: `8.8.4.4`
8. Click **OK** on all dialogs
9. Open Command Prompt as Admin and run: `ipconfig /flushdns`
10. Try running your server again: `npm run dev`

---

## Solution 2: Use Non-SRV Connection String

If you can't change DNS, use a direct connection string instead of the `mongodb+srv://` format.

### Steps:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. In the driver dropdown, select **Node.js** version **2.2.12 or later**
5. Copy the connection string that starts with `mongodb://` (NOT `mongodb+srv://`)
6. It will look like: `mongodb://mahar:mahar@ac-xxx-shard-00-00.e5k7hmj.mongodb.net:27017,...`
7. Update your `.env` file with this new connection string

---

## Solution 3: Flush DNS Cache

Run this command in Command Prompt (Admin):

```
ipconfig /flushdns
```

---

## Solution 4: Use Mobile Hotspot

If you're on a restricted network (work/school):

1. Connect to your phone's mobile hotspot
2. Try running the server again

---

## Quick Test After Fixing

Run this command to test the connection:

```
node test-mongodb.js
```
