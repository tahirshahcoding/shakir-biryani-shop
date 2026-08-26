import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ============================================================
  // ROLES
  // ============================================================
  const ownerRole = await prisma.role.upsert({
    where: { name: "OWNER" },
    update: {},
    create: { name: "OWNER", description: "Full system access" },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: "MANAGER" },
    update: {},
    create: { name: "MANAGER", description: "Operational management access" },
  });

  const cashierRole = await prisma.role.upsert({
    where: { name: "CASHIER" },
    update: {},
    create: { name: "CASHIER", description: "POS and basic sales access" },
  });

  console.log("✅ Roles created");

  // ============================================================
  // PERMISSIONS
  // ============================================================
  const permissions = [
    { code: "DASHBOARD_VIEW", description: "View dashboard" },

    { code: "PRODUCTS_VIEW", description: "View products" },
    { code: "PRODUCTS_CREATE", description: "Create products" },
    { code: "PRODUCTS_EDIT", description: "Edit products" },
    { code: "PRODUCTS_DELETE", description: "Delete products" },

    { code: "CATEGORIES_VIEW", description: "View categories" },
    { code: "CATEGORIES_CREATE", description: "Create categories" },
    { code: "CATEGORIES_EDIT", description: "Edit categories" },
    { code: "CATEGORIES_DELETE", description: "Delete categories" },

    { code: "SALES_VIEW", description: "View sales" },
    { code: "SALES_CREATE", description: "Create sales (POS)" },
    { code: "SALES_VOID", description: "Void sales" },
    { code: "SALES_VIEW_ALL", description: "View all sales (not just own)" },

    { code: "INVENTORY_VIEW", description: "View inventory" },
    { code: "INVENTORY_ADJUST", description: "Adjust inventory" },
    { code: "INVENTORY_VIEW_ALL", description: "View all inventory transactions" },

    { code: "EXPENSES_VIEW", description: "View expenses" },
    { code: "EXPENSES_CREATE", description: "Create expenses" },
    { code: "EXPENSES_EDIT", description: "Edit expenses" },
    { code: "EXPENSES_DELETE", description: "Delete expenses" },

    { code: "REPORTS_VIEW", description: "View reports" },
    { code: "REPORTS_EXPORT", description: "Export reports" },

    { code: "USERS_VIEW", description: "View users" },
    { code: "USERS_CREATE", description: "Create users" },
    { code: "USERS_EDIT", description: "Edit users" },
    { code: "USERS_DELETE", description: "Delete users" },

    { code: "ROLES_MANAGE", description: "Manage roles and permissions" },

    { code: "SETTINGS_VIEW", description: "View settings" },
    { code: "SETTINGS_EDIT", description: "Edit settings" },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { description: perm.description },
      create: perm,
    });
  }

  console.log(`✅ ${permissions.length} permissions created`);

  // ============================================================
  // ROLE-PERMISSION MAPPINGS
  // ============================================================
  // Owner gets everything
  const allPerms = await prisma.permission.findMany();
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: ownerRole.id, permissionId: perm.id },
      },
      update: {},
      create: { roleId: ownerRole.id, permissionId: perm.id },
    });
  }

  // Manager permissions
  const managerPermCodes = [
    "DASHBOARD_VIEW",
    "PRODUCTS_VIEW",
    "PRODUCTS_CREATE",
    "PRODUCTS_EDIT",
    "CATEGORIES_VIEW",
    "CATEGORIES_CREATE",
    "CATEGORIES_EDIT",
    "SALES_VIEW",
    "SALES_CREATE",
    "SALES_VOID",
    "SALES_VIEW_ALL",
    "INVENTORY_VIEW",
    "INVENTORY_ADJUST",
    "INVENTORY_VIEW_ALL",
    "EXPENSES_VIEW",
    "EXPENSES_CREATE",
    "EXPENSES_EDIT",
    "REPORTS_VIEW",
    "REPORTS_EXPORT",
    "USERS_VIEW",
    "SETTINGS_VIEW",
  ];
  const managerPerms = await prisma.permission.findMany({
    where: { code: { in: managerPermCodes } },
  });
  for (const perm of managerPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: managerRole.id, permissionId: perm.id },
      },
      update: {},
      create: { roleId: managerRole.id, permissionId: perm.id },
    });
  }

  // Cashier permissions
  const cashierPermCodes = [
    "DASHBOARD_VIEW",
    "PRODUCTS_VIEW",
    "SALES_VIEW",
    "SALES_CREATE",
  ];
  const cashierPerms = await prisma.permission.findMany({
    where: { code: { in: cashierPermCodes } },
  });
  for (const perm of cashierPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: cashierRole.id, permissionId: perm.id },
      },
      update: {},
      create: { roleId: cashierRole.id, permissionId: perm.id },
    });
  }

  console.log("✅ Role-permission mappings created");

  // ============================================================
  // ADMIN USER
  // ============================================================
  const passwordHash = await bcrypt.hash("admin123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@shakirbiryani.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@shakirbiryani.com",
      passwordHash,
      roleId: ownerRole.id,
    },
  });

  console.log("✅ Admin user created (admin@shakirbiryani.com / admin123)");

  // ============================================================
  // CATEGORIES
  // ============================================================
  const biryaniCat = await prisma.category.upsert({
    where: { name: "Biryani" },
    update: {},
    create: { name: "Biryani", description: "Signature biryani dishes", sortOrder: 1 },
  });

  const accompanimentCat = await prisma.category.upsert({
    where: { name: "Accompaniments" },
    update: {},
    create: { name: "Accompaniments", description: "Side dishes and raita", sortOrder: 2 },
  });

  const beverageCat = await prisma.category.upsert({
    where: { name: "Beverages" },
    update: {},
    create: { name: "Beverages", description: "Drinks and refreshments", sortOrder: 3 },
  });

  const dessertCat = await prisma.category.upsert({
    where: { name: "Desserts" },
    update: {},
    create: { name: "Desserts", description: "Sweet treats", sortOrder: 4 },
  });

  const extrasCat = await prisma.category.upsert({
    where: { name: "Extras" },
    update: {},
    create: { name: "Extras", description: "Add-ons and extras", sortOrder: 5 },
  });

  console.log("✅ Categories created");

  // ============================================================
  // PRODUCTS
  // ============================================================
  const biryaniProducts = [
    { name: "Chicken Biryani", description: "Classic chicken biryani", sellingPrice: 350, costPrice: 150 },
    { name: "Mutton Biryani", description: "Premium mutton biryani", sellingPrice: 550, costPrice: 280 },
    { name: "Beef Biryani", description: "Tender beef biryani", sellingPrice: 450, costPrice: 220 },
    { name: "Chicken Tikka Biryani", description: "Smoky chicken tikka biryani", sellingPrice: 400, costPrice: 170 },
    { name: "Special Biryani", description: "Chef's special biryani", sellingPrice: 600, costPrice: 300 },
  ];

  const accompanimentProducts = [
    { name: "Raita", description: "Fresh yogurt raita", sellingPrice: 50, costPrice: 15 },
    { name: "Salad", description: "Mixed green salad", sellingPrice: 60, costPrice: 20 },
    { name: "Daal", description: "Yellow lentil curry", sellingPrice: 80, costPrice: 30 },
    { name: "Chicken Korma", description: "Creamy chicken korma", sellingPrice: 200, costPrice: 100 },
    { name: "Seekh Kebab (2 pcs)", description: "Grilled seekh kebabs", sellingPrice: 150, costPrice: 70 },
  ];

  const beverageProducts = [
    { name: "Water (500ml)", description: "Mineral water", sellingPrice: 30, costPrice: 10 },
    { name: "Cola (330ml)", description: "Carbonated cola drink", sellingPrice: 40, costPrice: 18 },
    { name: "Lassi", description: "Traditional yogurt drink", sellingPrice: 60, costPrice: 20 },
    { name: "Chai", description: "Hot milk tea", sellingPrice: 30, costPrice: 8 },
    { name: "Mango Lassi", description: "Sweet mango yogurt drink", sellingPrice: 80, costPrice: 30 },
  ];

  const dessertProducts = [
    { name: "Gulab Jamun (2 pcs)", description: "Hot syrup-soaked dumplings", sellingPrice: 80, costPrice: 25 },
    { name: "Kheer", description: "Rice pudding dessert", sellingPrice: 70, costPrice: 20 },
    { name: "Falooda", description: "Rose-flavored cold dessert", sellingPrice: 100, costPrice: 35 },
  ];

  const extraProducts = [
    { name: "Extra Rice", description: "Additional plain rice", sellingPrice: 80, costPrice: 25 },
    { name: "Extra Gravy", description: "Additional masala gravy", sellingPrice: 50, costPrice: 15 },
    { name: "Packaging Fee", description: "Takeaway packaging", sellingPrice: 20, costPrice: 10 },
  ];

  const allProducts = [
    ...biryaniProducts.map((p) => ({ ...p, categoryId: biryaniCat.id })),
    ...accompanimentProducts.map((p) => ({ ...p, categoryId: accompanimentCat.id })),
    ...beverageProducts.map((p) => ({ ...p, categoryId: beverageCat.id })),
    ...dessertProducts.map((p) => ({ ...p, categoryId: dessertCat.id })),
    ...extraProducts.map((p) => ({ ...p, categoryId: extrasCat.id })),
  ];

  for (const product of allProducts) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          description: product.description,
          categoryId: product.categoryId,
          sellingPrice: product.sellingPrice,
          costPrice: product.costPrice,
        },
      });
    } else {
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          categoryId: product.categoryId,
          sellingPrice: product.sellingPrice,
          costPrice: product.costPrice,
          unit: "piece",
        },
      });
    }
  }

  console.log(`✅ ${allProducts.length} products created`);

  // ============================================================
  // EXPENSE CATEGORIES
  // ============================================================
  const expenseCats = [
    { name: "Rent", description: "Monthly shop rent" },
    { name: "Utilities", description: "Electricity, water, gas" },
    { name: "Staff Salary", description: "Employee salaries" },
    { name: "Groceries", description: "Raw material purchases" },
    { name: "Maintenance", description: "Equipment and shop maintenance" },
    { name: "Transport", description: "Delivery and transport costs" },
    { name: "Miscellaneous", description: "Other expenses" },
  ];

  for (const cat of expenseCats) {
    await prisma.expenseCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log(`✅ ${expenseCats.length} expense categories created`);

  // ============================================================
  // INVENTORY ITEMS
  // ============================================================
  const inventoryItems = [
    { name: "Basmati Rice", unit: "kg", currentQuantity: 50, minimumQuantity: 10 },
    { name: "Chicken", unit: "kg", currentQuantity: 20, minimumQuantity: 5 },
    { name: "Mutton", unit: "kg", currentQuantity: 10, minimumQuantity: 3 },
    { name: "Beef", unit: "kg", currentQuantity: 10, minimumQuantity: 3 },
    { name: "Cooking Oil", unit: "liters", currentQuantity: 15, minimumQuantity: 5 },
    { name: "Spices (Biryani Masala)", unit: "kg", currentQuantity: 5, minimumQuantity: 1 },
    { name: "Yogurt", unit: "kg", currentQuantity: 10, minimumQuantity: 3 },
    { name: "Onions", unit: "kg", currentQuantity: 15, minimumQuantity: 5 },
    { name: "Tomatoes", unit: "kg", currentQuantity: 10, minimumQuantity: 3 },
    { name: "Ginger-Garlic Paste", unit: "kg", currentQuantity: 3, minimumQuantity: 1 },
  ];

  for (const item of inventoryItems) {
    const existing = await prisma.inventoryItem.findFirst({ where: { name: item.name } });
    if (existing) {
      await prisma.inventoryItem.update({
        where: { id: existing.id },
        data: { currentQuantity: item.currentQuantity, minimumQuantity: item.minimumQuantity },
      });
    } else {
      await prisma.inventoryItem.create({ data: item });
    }
  }

  console.log(`✅ ${inventoryItems.length} inventory items created`);

  // ============================================================
  // SYSTEM SETTINGS
  // ============================================================
  const settings = [
    { key: "BUSINESS_NAME", value: "Shakir Biryani" },
    { key: "BUSINESS_PHONE", value: "+92-300-1234567" },
    { key: "BUSINESS_ADDRESS", value: "Main Market, Lahore" },
    { key: "CURRENCY", value: "PKR" },
    { key: "CURRENCY_SYMBOL", value: "Rs." },
    { key: "TAX_RATE", value: "0" },
    { key: "INVOICE_PREFIX", value: "SB" },
    { key: "LOW_STOCK_THRESHOLD", value: "5" },
    { key: "TIMEZONE", value: "Asia/Karachi" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log(`✅ ${settings.length} system settings created`);

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📋 Summary:");
  console.log("   - 3 roles (OWNER, MANAGER, CASHIER)");
  console.log(`   - ${permissions.length} permissions`);
  console.log(`   - ${allProducts.length} products across ${5} categories`);
  console.log(`   - ${expenseCats.length} expense categories`);
  console.log(`   - ${inventoryItems.length} inventory items`);
  console.log(`   - ${settings.length} system settings`);
  console.log(`   - 1 admin user (admin@shakirbiryani.com / admin123)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
