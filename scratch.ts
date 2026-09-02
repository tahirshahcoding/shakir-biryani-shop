import { db } from "./src/lib/db/prisma";
import { createSessionToken } from "./src/modules/auth/auth.service";

async function main() {
  const user = await db.user.findFirst({ include: { role: { include: { permissions: { include: { permission: true } } } } } });
  if (!user) {
    console.log("No user found");
    return;
  }

  // Create a dummy category directly
  const cat = await db.category.create({
    data: { name: "Test Category " + Date.now() }
  });

  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role.name,
    permissions: user.role.permissions.map((p) => p.permission.code),
  };

  const token = await createSessionToken(payload);

  console.log(`Sending HTTP DELETE to /api/categories/${cat.id}`);
  const res = await fetch(`http://localhost:3000/api/categories/${cat.id}`, {
    method: "DELETE",
    headers: {
      Cookie: `session_token=${token}`
    }
  });

  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}

main().catch(console.error);
