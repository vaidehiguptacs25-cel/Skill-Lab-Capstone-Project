# E-Commerce Platform - Frontend (Part 1)
Run: open `frontend/` in VS Code and use **Live Server** on `frontend/index.html`. No install needed.
Data is mock (localStorage). All data access is in `js/api.js` (`USE_MOCK`, `BASE_URL`) so the backend swap only touches that file.

Test accounts: Admin `admin@shop.com` / `Admin1234` - Customer `customer@shop.com` / `Cust1234`
Reset data: clear localStorage in DevTools.

## Backend (Part 2/3) - Node + Express + MongoDB
```
cd backend
npm install
copy .env.example to .env   (set JWT_SECRET; MONGO_URI defaults to local MongoDB)
npm run seed                (demo users, 16 products, 3 orders)
npm run dev                 (API on http://localhost:5000)
```
Then run the frontend with Live Server (port 5500). `frontend/js/api.js` now calls the API; the old localStorage version is `api.mock.js`.
Postman: import `backend/postman/ecommerce-api.postman_collection.json`, run "Login (customer)" or "Login (admin)" first (it stores the token), then try the other requests.
