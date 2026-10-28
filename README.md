# ShopEasy: Full-Stack E-Commerce Platform

ShopEasy is a web application where customers can browse, search and buy products online, and sellers or admins can manage products and orders. It is modelled on platforms like Amazon and Flipkart and was built as a Skill Lab Capstone Project.

Technologies used: HTML5, CSS3, JavaScript (ES6+), Node.js, Express.js, MongoDB with Mongoose, JWT, bcrypt, Postman, Git and GitHub.

## Features

Customer features:
- Home page with a hero banner, category cards, featured products, new arrivals and a promise strip (free delivery above Rs. 500, easy returns, secure payment).
- Product listing with live search (with a short delay), category filter, price range filter, sorting (price low to high, price high to low, rating, newest), a clear filters button and pagination at 8 products per page.
- Filters are saved in the page address, so links such as products.html?category=Books work.
- Product detail page with a large image, price and discount, rating, stock status, a quantity selector limited to available stock, Add to Cart, Buy Now and related products.
- Cart saved on the server with quantity controls, remove buttons, line totals and an order summary showing subtotal, delivery fee (free above Rs. 500), 5% tax and grand total.
- Checkout with a validated shipping form, a choice of Cash on Delivery or Card/UPI (demo only), and an order confirmation showing the order id.
- Register, login, logout, profile editing and order history with colour-coded status badges (Pending, Shipped, Delivered, Cancelled).

Seller and admin features:
- Dashboard cards showing total products, total orders, total revenue and low-stock count.
- Add, edit and delete products with form validation and a confirmation before deleting.
- View all orders and update their status.

General features:
- Responsive layout from 320px phones to large desktops, with a hamburger menu on mobile.
- Form validation on blur and on submit, with clear error messages.
- Toast notifications, loading states, empty states and a fallback image when a picture fails to load.

## Why These Technologies

- HTML, CSS and vanilla JavaScript for the frontend: this builds core web skills with no framework or build step, and the pages work with any simple static server.
- Node.js and Express for the backend: one language across the whole project, and Express makes REST routes and middleware simple.
- MongoDB with Mongoose for the database: products, carts and orders fit naturally as documents, and Mongoose adds schemas and validation.
- JWT and bcrypt for security: tokens give stateless login, and passwords are stored only as hashes.
- Postman for testing: every endpoint can be tested without the frontend.
- Git and GitHub for teamwork: feature branches, pull requests and meaningful commits.

## Architecture

The data flows like this:

Browser (HTML, CSS, JavaScript) -> api.js (fetch) -> Express REST API on port 5000 -> Mongoose -> MongoDB

All data access in the frontend goes through one file, frontend/js/api.js. Page scripts never call the server or read storage directly. Every function returns the same response shape: { success: true, data: ... } on success or { success: false, message: "..." } on failure.

## Folder Structure

ecommerce-project/
- backend/
  - config/ (database connection, categories list)
  - middleware/ (JWT protection and admin-only guard)
  - models/ (User, Product, Cart, Order)
  - routes/ (auth, users, products, categories, cart, orders)
  - utils/ (helpers and async wrapper)
  - postman/ (Postman collection)
  - seed.js (demo data)
  - server.js (app entry point)
  - .env.example
- frontend/
  - index.html
  - pages/ (products, product-detail, cart, checkout, login, register, profile, orders, admin-dashboard)
  - css/ (base.css, layout.css, pages.css)
  - js/ (api.js, main.js, products.js, cart.js, auth.js, orders.js, admin.js)
  - assets/

The files api.mock.js and mockData.js in frontend/js are the early localStorage version, kept for reference. No page loads them.

## Installation and Setup

Prerequisites:
- Node.js 18 or newer
- MongoDB running locally, or a free MongoDB Atlas cluster
- Python 3 (only to serve the frontend; any static server works)
- Git
- Optional: MongoDB Compass to view the data and Postman to test the API

Step 1: Clone the repository
git clone https://github.com/vaidehiguptacs25-cel/Skill-Lab-Capstone-Project.git
cd Skill-Lab-Capstone-Project/ecommerce-fullstack/ecommerce-project

Step 2: Start MongoDB
Start your local MongoDB service, or run it with Docker:
docker run -d -p 27017:27017 --name mongo mongo

Step 3: Set up and start the backend
cd backend
npm install
Copy .env.example to .env (Windows PowerShell: Copy-Item .env.example .env, Mac or Linux: cp .env.example .env)
npm run seed
npm run dev

The seed command inserts demo users, 16 products and 3 orders. When the backend is ready you will see "MongoDB connected" and "API running on http://localhost:5000".

Step 4: Start the frontend in a second terminal
cd frontend
python -m http.server 5500

Then open http://localhost:5500 in your browser. You can also open the frontend folder in VS Code and use the Live Server extension on port 5500.

Environment variables (backend/.env):
- PORT: the API port, default 5000.
- MONGO_URI: the MongoDB connection string, default mongodb://127.0.0.1:27017/ecommerce.
- JWT_SECRET: the secret used to sign login tokens. Change it to a long random string.
- JWT_EXPIRES: how long a login token lasts, default 7d.
- CLIENT_ORIGINS: the frontend addresses allowed by CORS, default http://127.0.0.1:5500 and http://localhost:5500.

To use MongoDB Atlas, paste your Atlas connection string into MONGO_URI and add /ecommerce as the database name.

Test accounts:
- Admin or seller: admin@shop.com with password Admin1234
- Customer: customer@shop.com with password Cust1234

Run npm run seed again at any time to reset the database to its original demo data.

## Requirements and User Stories

Customer stories:
1. As a visitor, I want to register and log in so that I can buy products.
2. As a customer, I want to search, filter and sort products so that I can find what I need quickly.
3. As a customer, I want to view product details and stock so that I can decide what to buy.
4. As a customer, I want to add items to a cart and change quantities so that I can control my order.
5. As a customer, I want to see subtotal, delivery and tax so that I know the final price.
6. As a customer, I want to check out with my shipping address so that my order is delivered.
7. As a customer, I want to see my past orders and their status so that I can track them.
8. As a customer, I want to edit my profile so that my details stay correct.

Seller and admin stories:
9. As an admin, I want a dashboard with key numbers so that I can see how the store is doing.
10. As an admin, I want to add, edit and delete products so that the catalogue stays current.
11. As an admin, I want to view orders and update their status so that customers get accurate updates.

Wireframes are in the docs/wireframes folder: [Home, Products, Product detail, Cart, Checkout, Login and Register, Orders, Admin dashboard].

## Database Design (MongoDB)

The database is called ecommerce and has four collections.

users:
- name, email (unique), password (bcrypt hash), role (customer or admin), phone, address, timestamps

products:
- name, description, price, discountPrice, finalPrice, category, image, stock, rating, reviewsCount, sellerId (reference to users), timestamps

carts:
- user (reference to users, one cart per user)
- items: a list of product (reference to products) and qty

orders:
- user (reference to users)
- items: a list of productId, name, price and qty
- total, status (Pending, Shipped, Delivered or Cancelled), date, paymentMethod
- shippingAddress: fullName, phone, address, city, state, pincode

Design notes:
- Order items copy the product name and price at purchase time, so past orders stay correct even if a product is later edited or deleted.
- finalPrice is the discount price if one is set, otherwise the normal price. It is stored so price filtering and sorting run inside the database.

## REST API Endpoints

Base URL: http://localhost:5000/api

Routes marked "login" need an Authorization: Bearer token header. Routes marked "admin" also need the admin role.

Auth and profile:
- GET /health (public): check the API is running
- POST /auth/register (public): create an account
- POST /auth/login (public): log in and receive a token and user
- GET /auth/me (login): get the logged-in user
- PUT /users/me (login): update name, phone and address

Products and categories:
- GET /products (public): list products, with query options search, category, minPrice, maxPrice, sort and page
- GET /products/:id (public): get one product
- POST /products (admin): create a product
- PUT /products/:id (admin): update a product
- DELETE /products/:id (admin): delete a product
- GET /categories (public): list categories

Cart:
- GET /cart (login): get my cart
- POST /cart (login): add an item with productId and qty
- PUT /cart/:productId (login): set an item's quantity
- DELETE /cart/:productId (login): remove an item
- DELETE /cart (login): clear the cart

Orders:
- POST /orders (login): place an order from the cart
- GET /orders/my (login): my order history
- GET /orders (admin): all orders
- PUT /orders/:id/status (admin): update an order's status

Status codes used: 200 OK, 201 Created, 400 invalid input, 401 not logged in, 403 not allowed, 404 not found, 409 already exists.

Testing with Postman:
1. Import backend/postman/ecommerce-api.postman_collection.json.
2. Run Login (customer) or Login (admin) first. It saves the token automatically.
3. Run the other requests in each folder. Product and order ids are filled in by earlier requests.
4. Use the customer login for cart and orders, and the admin login for creating products, viewing all orders and changing order status.

## Validation and Error Handling

Validation runs on both the frontend (when leaving a field and on submit) and the backend. The rules are:
- Required fields must not be empty.
- Email must have a valid format.
- Phone must be exactly 10 digits.
- Password must be at least 8 characters with at least one letter and one number.
- Confirm password must match the password.
- Pincode must be exactly 6 digits.
- Price must be greater than 0, and a discount price must be lower than the price.
- Stock must be a whole number, 0 or more.
- Quantity must be between 1 and the available stock.

Invalid fields show a red message under the field, valid fields turn green, and the submit button is disabled while a request is running to prevent double submission. API failures appear as friendly toast messages instead of raw errors.

## Security

- Passwords are hashed with bcrypt and never returned by the API.
- A JWT is required for the cart, orders and profile, and admin routes check the user's role.
- The server recalculates order totals from database prices and checks and reduces stock itself, ignoring any price sent by the browser.
- User text is escaped before it is shown on the page to prevent XSS.
- Only whitelisted product fields are saved, and search text is escaped before it is used in a database query.
- CORS allows only the frontend's address.
- Secrets live in the .env file, which is excluded from Git.

## Payments

The project supports Cash on Delivery and a Card/UPI option that is demo only. No real card data is collected. Stripe or PayPal integration is listed as future scope.

## Git Workflow

The main branch holds stable code. Each feature is built on its own branch and merged through a pull request, and every team member commits their own work with clear messages.

Feature branches:
- feature/base-styles: CSS variables, base and layout styles
- feature/api-layer: data layer and mock data
- feature/navbar: shared navbar, footer, toast, validation and home page
- feature/products-page: product listing, search, filters and detail page
- feature/cart: cart and checkout
- feature/auth-ui: login, register, profile and orders
- feature/admin-dashboard: admin dashboard and product management
- feature/backend-api: Express API, MongoDB models and Postman collection

Commit messages start with a verb, for example "Add cart page with quantity controls" or "Fix pincode validation on checkout".

## Troubleshooting

- Error "EADDRINUSE: address already in use :::5000": an old backend is still running. Find it with netstat -ano | findstr :5000, stop it with taskkill /PID <id> /F, then start the backend again.
- Error "MongoDB connection failed": MongoDB is not running. Start the MongoDB service or run docker start mongo.
- Products do not load and the console shows a CORS error: open the site on port 5500, or add your address to CLIENT_ORIGINS in backend/.env and restart the backend.
- Message "Cannot reach the server": the backend is not running. Check http://localhost:5000/api/health.
- Empty product list: run npm run seed.
- Old page behaviour after changes: hard refresh the browser with Ctrl+Shift+R.

## Limitations and Future Scope

- Real payment integration with Stripe or PayPal
- Product reviews, wishlist and image upload
- Email and SMS notifications and order tracking
- Coupons and offers
- Admin analytics charts
- Redis caching and Docker containerisation
- Deployment on MongoDB Atlas, Render and Netlify

## Final Demonstration

Each team member will explain the part they built and demonstrate it: browsing and filtering products, the cart and checkout, login and roles, the admin dashboard, the REST API in Postman and the stored data in MongoDB Compass.
