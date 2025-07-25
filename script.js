// Global state
let currentUser = null
let currentPage = "home"
let products = []
let users = []
let applications = []
let purchases = []

// Sample data
const sampleProducts = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    brand: "apple",
    price: 134900,
    image: "./assets/iphone15.jpg",
    specs: {
      Display: "6.1-inch Super Retina XDR",
      Processor: "A17 Pro chip",
      Storage: "128GB",
      Camera: "48MP Main + 12MP Ultra Wide",
      Battery: "Up to 23 hours video playback",
    },
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    brand: "samsung",
    price: 129999,
    image: "./assets/samsung-s24.jpg",
    specs: {
      Display: "6.8-inch Dynamic AMOLED 2X",
      Processor: "Snapdragon 8 Gen 3",
      Storage: "256GB",
      Camera: "200MP Main + 50MP Periscope",
      Battery: "5000mAh",
    },
  },
  {
    id: 3,
    name: "OnePlus 12",
    brand: "oneplus",
    price: 64999,
    image: "./assets/oneplus12.jpg",
    specs: {
      Display: "6.82-inch LTPO AMOLED",
      Processor: "Snapdragon 8 Gen 3",
      Storage: "256GB",
      Camera: "50MP Main + 64MP Periscope",
      Battery: "5400mAh",
    },
  },
  {
    id: 4,
    name: "Xiaomi 14 Ultra",
    brand: "xiaomi",
    price: 99999,
    image: "./assets/xiaomi.jpg",
    specs: {
      Display: "6.73-inch LTPO AMOLED",
      Processor: "Snapdragon 8 Gen 3",
      Storage: "512GB",
      Camera: "50MP Main + 50MP Ultra Wide",
      Battery: "5300mAh",
    },
  },
  {
    id: 5,
    name: "iPhone 14",
    brand: "apple",
    price: 79900,
    image: "./assets/iphone14.jpg",
    specs: {
      Display: "6.1-inch Super Retina XDR",
      Processor: "A15 Bionic chip",
      Storage: "128GB",
      Camera: "12MP Main + 12MP Ultra Wide",
      Battery: "Up to 20 hours video playback",
    },
  },
  {
    id: 6,
    name: "Samsung Galaxy A54",
    brand: "samsung",
    price: 38999,
    image: "./assets/samsunga24.jpg",
    specs: {
      Display: "6.4-inch Super AMOLED",
      Processor: "Exynos 1380",
      Storage: "128GB",
      Camera: "50MP Main + 12MP Ultra Wide",
      Battery: "5000mAh",
    },
  },
]

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
  setupEventListeners()
  loadSampleData()
})

function initializeApp() {
  // Load data from localStorage
  users = JSON.parse(localStorage.getItem("users")) || []
  applications = JSON.parse(localStorage.getItem("applications")) || []
  purchases = JSON.parse(localStorage.getItem("purchases")) || []
  currentUser = JSON.parse(localStorage.getItem("currentUser")) || null

  // Update UI based on login status
  updateNavigation()

  // Show home page by default
  showPage("home")
}

function loadSampleData() {
  products = sampleProducts
  renderProducts()
}

function setupEventListeners() {
  // Navigation
  document.querySelectorAll("[data-page]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const page = e.target.getAttribute("data-page")
      showPage(page)
    })
  })

  // Hamburger menu
  const hamburger = document.getElementById("hamburger")
  const navMenu = document.getElementById("nav-menu")

  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active")
  })

  // Forms
  document.getElementById("register-form").addEventListener("submit", handleRegister)
  document.getElementById("login-form").addEventListener("submit", handleLogin)

  // Login tabs
  document.querySelectorAll(".login-tabs .tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".login-tabs .tab-btn").forEach((b) => b.classList.remove("active"))
      e.target.classList.add("active")
    })
  })

  // Admin tabs
  document.querySelectorAll(".admin-tabs .tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const tab = e.target.getAttribute("data-tab")
      showAdminTab(tab)
    })
  })

  // Filters
  document.getElementById("brand-filter").addEventListener("change", filterProducts)
  document.getElementById("price-filter").addEventListener("change", filterProducts)

  // Modal
  const modal = document.getElementById("emi-modal")
  const closeBtn = document.querySelector(".close")

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none"
  })

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none"
    }
  })

  // EMI calculator
  document.getElementById("emi-months").addEventListener("change", calculateEMI)
}

function showPage(page) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"))

  // Show selected page
  const targetPage = document.getElementById(`${page}-page`)
  if (targetPage) {
    targetPage.classList.add("active")
    currentPage = page

    // Load page-specific content
    switch (page) {
      case "dashboard":
        if (currentUser) {
          loadDashboard()
        } else {
          showPage("login")
        }
        break
      case "admin":
        if (currentUser && currentUser.role === "admin") {
          loadAdminPanel()
        } else {
          showPage("login")
        }
        break
      case "products":
        renderProducts()
        break
    }
  }
}

function handleRegister(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const userData = {
    id: Date.now(),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    cardType: formData.get("cardType"),
    aadhar: formData.get("aadhar"),
    pan: formData.get("pan"),
    income: formData.get("income"),
    status: "pending",
    appliedDate: new Date().toISOString(),
    role: "user",
  }

  // Check if user already exists
  if (users.find((user) => user.email === userData.email)) {
    alert("User with this email already exists!")
    return
  }

  // Add to applications
  applications.push(userData)
  localStorage.setItem("applications", JSON.stringify(applications))

  alert("Application submitted successfully! You will be notified once approved.")
  e.target.reset()
  showPage("login")
}

function handleLogin(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const email = formData.get("email")
  const password = formData.get("password")
  const isAdmin = document.querySelector(".login-tabs .tab-btn.active").getAttribute("data-tab") === "admin"

  // Admin login
  if (isAdmin) {
    if (email === "admin@mobilefin.com" && password === "admin123") {
      currentUser = {
        id: "admin",
        email: "admin@mobilefin.com",
        fullName: "Admin",
        role: "admin",
      }
      localStorage.setItem("currentUser", JSON.stringify(currentUser))
      updateNavigation()
      showPage("admin")
      return
    } else {
      alert("Invalid admin credentials!")
      return
    }
  }

  // User login
  const user = users.find((u) => u.email === email && u.password === password)
  if (user) {
    currentUser = user
    localStorage.setItem("currentUser", JSON.stringify(currentUser))
    updateNavigation()
    showPage("dashboard")
  } else {
    alert("Invalid credentials!")
  }
}

function logout() {
  currentUser = null
  localStorage.removeItem("currentUser")
  updateNavigation()
  showPage("home")
}

function updateNavigation() {
  const loginNav = document.getElementById("login-nav")
  const registerNav = document.getElementById("register-nav")
  const logoutNav = document.getElementById("logout-nav")
  const dashboardNav = document.getElementById("dashboard-nav")
  const adminNav = document.getElementById("admin-nav")

  if (currentUser) {
    loginNav.style.display = "none"
    registerNav.style.display = "none"
    logoutNav.style.display = "block"
    dashboardNav.style.display = "block"

    if (currentUser.role === "admin") {
      adminNav.style.display = "block"
    } else {
      adminNav.style.display = "none"
    }
  } else {
    loginNav.style.display = "block"
    registerNav.style.display = "block"
    logoutNav.style.display = "none"
    dashboardNav.style.display = "none"
    adminNav.style.display = "none"
  }
}

function loadDashboard() {
  const userInfo = document.getElementById("user-info")
  const cardDisplay = document.getElementById("card-display")
  const availableLimit = document.getElementById("available-limit")
  const usedLimit = document.getElementById("used-limit")
  const activeLoansCount = document.getElementById("active-loans")
  const totalEmiLeft = document.getElementById("total-emi-left")
  const activeLoansContainer = document.getElementById("active-loans-container")

  // User info
  userInfo.innerHTML = `
        <div>
            <strong>${currentUser.fullName}</strong><br>
            <small>${currentUser.email}</small>
        </div>
    `

  // Card display
  const cardLimit = currentUser.cardType === "gold" ? 50000 : 150000
  const userPurchases = purchases.filter((p) => p.userId === currentUser.id)
  const totalUsed = userPurchases.reduce((sum, p) => sum + p.amount, 0)
  const available = cardLimit - totalUsed

  cardDisplay.innerHTML = `
        <div class="card-display ${currentUser.cardType}">
            <h4>${currentUser.cardType.toUpperCase()} CARD</h4>
            <p>${currentUser.fullName}</p>
            <p>Limit: ₹${cardLimit.toLocaleString()}</p>
            <p>Available: ₹${available.toLocaleString()}</p>
        </div>
    `

  // Calculate EMI statistics
  const activeLoans = userPurchases.filter((p) => p.status === "active")
  const totalEmiRemaining = activeLoans.reduce((sum, loan) => {
    const paidInstallments = loan.paidInstallments || 0
    const remainingInstallments = loan.emiMonths - paidInstallments
    return sum + loan.emiAmount * remainingInstallments
  }, 0)

  // Update individual stat cards
  availableLimit.textContent = `₹${available.toLocaleString()}`
  usedLimit.textContent = `₹${totalUsed.toLocaleString()}`
  activeLoansCount.textContent = activeLoans.length
  totalEmiLeft.textContent = `₹${totalEmiRemaining.toLocaleString()}`

  // Load active loans
  loadActiveLoans(activeLoans)
}

function loadActiveLoans(activeLoans) {
  const container = document.getElementById("active-loans-container")

  if (activeLoans.length === 0) {
    container.innerHTML = '<p class="no-data">No active loans. <a href="#" data-page="products">Browse products</a></p>'
    return
  }

  container.innerHTML = activeLoans
    .map((loan) => {
      // Initialize loan data if not exists
      if (!loan.paidInstallments) loan.paidInstallments = Math.floor(Math.random() * (loan.emiMonths / 2)) + 1
      if (!loan.startDate) loan.startDate = new Date(loan.date)

      const paidInstallments = loan.paidInstallments
      const totalInstallments = loan.emiMonths
      const remainingInstallments = totalInstallments - paidInstallments
      const progressPercentage = Math.round((paidInstallments / totalInstallments) * 100)

      // Calculate next EMI date
      const nextEmiDate = new Date(loan.startDate)
      nextEmiDate.setMonth(nextEmiDate.getMonth() + paidInstallments + 1)

      // Generate EMI timeline
      const emiTimeline = generateEmiTimeline(loan, paidInstallments, totalInstallments)

      return `
      <div class="loan-card">
        <div class="loan-header">
          <div class="loan-info">
            <h4>${loan.productName}</h4>
            <p>Loan started on ${new Date(loan.startDate).toLocaleDateString()}</p>
          </div>
          <div class="loan-amount">
            <span class="total-amount">₹${loan.amount.toLocaleString()}</span>
            <span class="emi-amount">₹${loan.emiAmount}/month</span>
          </div>
        </div>
        
        <div class="loan-progress">
          <div class="progress-header">
            <span class="progress-text">${paidInstallments} of ${totalInstallments} EMIs paid</span>
            <span class="progress-percentage">${progressPercentage}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
          </div>
        </div>
        
        <div class="emi-timeline">
          ${emiTimeline}
        </div>
        
        <div class="loan-details">
          <div class="detail-item">
            <span class="detail-value">₹${(loan.emiAmount * remainingInstallments).toLocaleString()}</span>
            <span class="detail-label">Amount Left</span>
          </div>
          <div class="detail-item">
            <span class="detail-value">${remainingInstallments}</span>
            <span class="detail-label">EMIs Left</span>
          </div>
          <div class="detail-item">
            <span class="detail-value">₹${(loan.emiAmount * paidInstallments).toLocaleString()}</span>
            <span class="detail-label">Paid Amount</span>
          </div>
          <div class="detail-item">
            <span class="detail-value">${Math.ceil(remainingInstallments / 12)}y ${remainingInstallments % 12}m</span>
            <span class="detail-label">Time Left</span>
          </div>
        </div>
        
        ${
          remainingInstallments > 0
            ? `
          <div class="next-emi-date">
            <span class="date">${nextEmiDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}</span>
            <span class="label">Next EMI Due Date</span>
          </div>
        `
            : ""
        }
      </div>
    `
    })
    .join("")
}

function generateEmiTimeline(loan, paidInstallments, totalInstallments) {
  let timeline = ""
  const currentDate = new Date()
  const startDate = new Date(loan.startDate)

  for (let i = 1; i <= totalInstallments; i++) {
    const emiDate = new Date(startDate)
    emiDate.setMonth(emiDate.getMonth() + i)

    let status = "pending"
    let tooltip = `EMI ${i}: ${emiDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`

    if (i <= paidInstallments) {
      status = "paid"
      tooltip += " - Paid ✓"
    } else if (i === paidInstallments + 1) {
      status = "current"
      tooltip += " - Due Now"
    } else if (emiDate < currentDate) {
      status = "overdue"
      tooltip += " - Overdue!"
    } else {
      tooltip += " - Pending"
    }

    timeline += `
      <div class="emi-installment ${status}" data-tooltip="${tooltip}">
        ${i}
      </div>
    `
  }

  return timeline
}

function renderProducts() {
  const productsGrid = document.getElementById("products-grid")
  const brandFilter = document.getElementById("brand-filter").value
  const priceFilter = document.getElementById("price-filter").value

  let filteredProducts = products

  // Apply brand filter
  if (brandFilter) {
    filteredProducts = filteredProducts.filter((p) => p.brand === brandFilter)
  }

  // Apply price filter
  if (priceFilter) {
    const [min, max] = priceFilter.split("-").map(Number)
    if (max) {
      filteredProducts = filteredProducts.filter((p) => p.price >= min && p.price <= max)
    } else {
      filteredProducts = filteredProducts.filter((p) => p.price >= min)
    }
  }

  productsGrid.innerHTML = filteredProducts
    .map(
      (product) => `
        <div class="product-card">
            <img src="${product.image}" class="product-image" />
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-price">₹${product.price.toLocaleString()}</div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-small" onclick="showProductInfo(${product.id})">View Details</button>
                    ${currentUser ? `<button class="btn btn-secondary btn-small" onclick="showEMICalculator(${product.id})">EMI</button>` : ""}
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

function filterProducts() {
  renderProducts()
}

function showProductInfo(productId) {
  const product = products.find((p) => p.id === productId)
  if (!product) return

  const container = document.getElementById("product-info-container")
  container.innerHTML = `
        <div class="product-detail">
            <img src=${product.image} class="product-detail-image"/>
            <div class="product-detail-info">
                <h1>${product.name}</h1>
                <div class="product-detail-price">₹${product.price.toLocaleString()}</div>
                <div class="product-specs">
                    <h3>Specifications</h3>
                    <ul>
                        ${Object.entries(product.specs)
                          .map(([key, value]) => `<li><span>${key}</span><span>${value}</span></li>`)
                          .join("")}
                    </ul>
                </div>
                <div class="product-actions">
                    ${
                      currentUser
                        ? `
                        <button class="btn btn-primary" onclick="showEMICalculator(${product.id})">Calculate EMI</button>
                        <button class="btn btn-secondary" onclick="showPage('products')">Back to Products</button>
                    `
                        : `
                        <button class="btn btn-primary" onclick="showPage('login')">Login to Buy</button>
                        <button class="btn btn-secondary" onclick="showPage('products')">Back to Products</button>
                    `
                    }
                </div>
            </div>
        </div>
    `

  showPage("product-info")
}

function showEMICalculator(productId) {
  if (!currentUser) {
    alert("Please login to calculate EMI")
    return
  }

  const product = products.find((p) => p.id === productId)
  if (!product) return

  document.getElementById("product-price").textContent = product.price.toLocaleString()
  document.getElementById("emi-modal").style.display = "block"

  // Store current product for purchase
  window.currentProduct = product

  calculateEMI()
}

function calculateEMI() {
  const price = window.currentProduct.price
  const months = Number.parseInt(document.getElementById("emi-months").value)

  const monthlyEMI = Math.ceil(price / months)
  const totalAmount = monthlyEMI * months

  document.getElementById("monthly-emi").textContent = monthlyEMI.toLocaleString()
  document.getElementById("total-amount").textContent = totalAmount.toLocaleString()
}

function purchaseProduct() {
  if (!currentUser) {
    alert("Please login to purchase")
    return
  }

  const product = window.currentProduct
  const months = Number.parseInt(document.getElementById("emi-months").value)
  const monthlyEMI = Math.ceil(product.price / months)

  // Check credit limit
  const cardLimit = currentUser.cardType === "gold" ? 50000 : 150000
  const userPurchases = purchases.filter((p) => p.userId === currentUser.id)
  const totalUsed = userPurchases.reduce((sum, p) => sum + p.amount, 0)
  const available = cardLimit - totalUsed

  if (product.price > available) {
    alert(`Insufficient credit limit! Available: ₹${available.toLocaleString()}`)
    return
  }

  // Create purchase record with loan tracking
  const purchase = {
    id: Date.now(),
    userId: currentUser.id,
    productId: product.id,
    productName: product.name,
    amount: product.price,
    emiAmount: monthlyEMI,
    emiMonths: months,
    date: new Date().toISOString(),
    startDate: new Date().toISOString(),
    status: "active",
    paidInstallments: 0,
  }

  purchases.push(purchase)
  localStorage.setItem("purchases", JSON.stringify(purchases))

  alert("Purchase successful! EMI plan activated.")
  document.getElementById("emi-modal").style.display = "none"

  if (currentPage === "dashboard") {
    loadDashboard()
  }
}

function loadAdminPanel() {
  showAdminTab("applications")
}

function showAdminTab(tab) {
  // Update tab buttons
  document.querySelectorAll(".admin-tabs .tab-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  document.querySelector(`[data-tab="${tab}"]`).classList.add("active")

  // Update tab content
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active")
  })
  document.getElementById(`${tab}-tab`).classList.add("active")

  // Load tab-specific content
  switch (tab) {
    case "applications":
      loadApplications()
      break
    case "users":
      loadUsers()
      break
    case "products":
      loadAdminProducts()
      break
  }
}

function loadApplications() {
  const container = document.getElementById("pending-applications")
  const pendingApps = applications.filter((app) => app.status === "pending")

  if (pendingApps.length === 0) {
    container.innerHTML = '<p class="no-data">No pending applications</p>'
    return
  }

  container.innerHTML = pendingApps
    .map(
      (app) => `
        <div class="application-card">
            <div class="application-header">
                <div>
                    <h4>${app.fullName}</h4>
                    <p>${app.email} | ${app.phone}</p>
                </div>
                <span class="status ${app.status}">${app.status.toUpperCase()}</span>
            </div>
            <div class="application-details">
                <p><strong>Card Type:</strong> ${app.cardType.toUpperCase()}</p>
                <p><strong>Monthly Income:</strong> ₹${Number.parseInt(app.income).toLocaleString()}</p>
                <p><strong>Applied:</strong> ${new Date(app.appliedDate).toLocaleDateString()}</p>
            </div>
            <div class="application-actions">
                <button class="btn btn-primary btn-small" onclick="approveApplication('${app.id}')">Approve</button>
                <button class="btn btn-secondary btn-small" onclick="rejectApplication('${app.id}')">Reject</button>
            </div>
        </div>
    `,
    )
    .join("")
}

function approveApplication(appId) {
  const app = applications.find((a) => a.id == appId)
  if (!app) return

  // Move to users
  app.status = "approved"
  users.push(app)

  // Update storage
  localStorage.setItem("applications", JSON.stringify(applications))
  localStorage.setItem("users", JSON.stringify(users))

  alert(`Application approved for ${app.fullName}`)
  loadApplications()
  loadUsers()
}

function rejectApplication(appId) {
  const app = applications.find((a) => a.id == appId)
  if (!app) return

  app.status = "rejected"
  localStorage.setItem("applications", JSON.stringify(applications))

  alert(`Application rejected for ${app.fullName}`)
  loadApplications()
}

function loadUsers() {
  const container = document.getElementById("users-list")
  const approvedUsers = users.filter((user) => user.status === "approved")

  if (approvedUsers.length === 0) {
    container.innerHTML = '<p class="no-data">No approved users</p>'
    return
  }

  container.innerHTML = approvedUsers
    .map(
      (user) => `
        <div class="user-card">
            <div class="user-header">
                <div>
                    <h4>${user.fullName}</h4>
                    <p>${user.email} | ${user.phone}</p>
                </div>
                <span class="status approved">ACTIVE</span>
            </div>
            <div class="user-details">
                <p><strong>Card Type:</strong> ${user.cardType.toUpperCase()}</p>
                <p><strong>Credit Limit:</strong> ₹${(user.cardType === "gold" ? 50000 : 150000).toLocaleString()}</p>
                <p><strong>Joined:</strong> ${new Date(user.appliedDate).toLocaleDateString()}</p>
            </div>
        </div>
    `,
    )
    .join("")
}

function loadAdminProducts() {
  const container = document.getElementById("admin-products-list")

  container.innerHTML = products
    .map(
      (product) => `
        <div class="user-card">
            <div class="user-header">
                <div>
                    <h4>${product.name}</h4>
                    <p>Brand: ${product.brand.toUpperCase()} | Price: ₹${product.price.toLocaleString()}</p>
                </div>
                <span class="status approved">ACTIVE</span>
            </div>
            <div class="user-details">
                <p><strong>Storage:</strong> ${product.specs.Storage}</p>
                <p><strong>Display:</strong> ${product.specs.Display}</p>
                <p><strong>Processor:</strong> ${product.specs.Processor}</p>
            </div>
            <div class="application-actions">
                <button class="btn btn-secondary btn-small" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn btn-secondary btn-small" onclick="deleteProduct(${product.id})">Delete</button>
            </div>
        </div>
    `,
    )
    .join("")
}

function addProduct() {
  const name = prompt("Product Name:")
  const brand = prompt("Brand (apple/samsung/oneplus/xiaomi):")
  const price = Number.parseInt(prompt("Price:"))

  if (name && brand && price) {
    const newProduct = {
      id: Date.now(),
      name: name,
      brand: brand.toLowerCase(),
      price: price,
      image: "📱",
      specs: {
        Display: "6.1-inch Display",
        Processor: "Latest Processor",
        Storage: "128GB",
        Camera: "Main Camera",
        Battery: "All-day battery",
      },
    }

    products.push(newProduct)
    alert("Product added successfully!")
    loadAdminProducts()
    renderProducts()
  }
}

function editProduct(productId) {
  const product = products.find((p) => p.id === productId)
  if (!product) return

  const newName = prompt("Product Name:", product.name)
  const newPrice = Number.parseInt(prompt("Price:", product.price))

  if (newName && newPrice) {
    product.name = newName
    product.price = newPrice
    alert("Product updated successfully!")
    loadAdminProducts()
    renderProducts()
  }
}

function deleteProduct(productId) {
  if (confirm("Are you sure you want to delete this product?")) {
    products = products.filter((p) => p.id !== productId)
    alert("Product deleted successfully!")
    loadAdminProducts()
    renderProducts()
  }
}

// Utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN")
}

// Add some sample users and applications for demo
function addSampleData() {
  // Add sample approved user
  const sampleUser = {
    id: 1001,
    fullName: "John Doe",
    email: "john@example.com",
    phone: "9876543210",
    password: "password123",
    cardType: "gold",
    aadhar: "1234-5678-9012",
    pan: "ABCDE1234F",
    income: "50000",
    status: "approved",
    appliedDate: new Date().toISOString(),
    role: "user",
  }

  if (!users.find((u) => u.email === sampleUser.email)) {
    users.push(sampleUser)
    localStorage.setItem("users", JSON.stringify(users))
  }

  // Add sample pending application
  const sampleApp = {
    id: 2001,
    fullName: "Jane Smith",
    email: "jane@example.com",
    phone: "9876543211",
    password: "password123",
    cardType: "titanium",
    aadhar: "1234-5678-9013",
    pan: "ABCDE1234G",
    income: "75000",
    status: "pending",
    appliedDate: new Date().toISOString(),
    role: "user",
  }

  if (!applications.find((a) => a.email === sampleApp.email)) {
    applications.push(sampleApp)
    localStorage.setItem("applications", JSON.stringify(applications))
  }
}

// Initialize sample data on first load
if (localStorage.getItem("sampleDataLoaded") !== "true") {
  addSampleData()
  localStorage.setItem("sampleDataLoaded", "true")
}