// ---------------------------------------------------------
// Database migration / seed script
// ---------------------------------------------------------

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcryptjs from 'bcryptjs';

// Load .env before importing app code
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { connectDatabase, disconnectDatabase } from '../config';
import { User, Role } from '../models';
import { Permission, SystemRoles } from '../constants';

function getEnv(key: string, fallback?: string): string {
  const v = process.env[key] ?? fallback;
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
}

// ─── Step 1: Seed System Roles ─────────────────────────

async function seedSystemRoles(): Promise<Record<string, mongoose.Types.ObjectId>> {
  const adminPermissions = Object.values(Permission);
  
  const managerPermissions = [
    Permission.TEAM_READ,
    Permission.CLIENT_READ,
    Permission.TIMESHEET_MANAGE_TEAM,
    Permission.TIMESHEET_SUBMIT,
    Permission.TIMESHEET_VIEW_PERSONAL,
  ];

  const employeePermissions = [
    Permission.TEAM_READ,
    Permission.CLIENT_READ,
    Permission.TIMESHEET_SUBMIT,
    Permission.TIMESHEET_VIEW_PERSONAL,
  ];

  const roleMap: Record<string, mongoose.Types.ObjectId> = {};

  const rolesToCreate = [
    { name: SystemRoles.ADMIN, permissions: adminPermissions, description: 'Super Administrator', isSystem: true },
    { name: SystemRoles.MANAGER, permissions: managerPermissions, description: 'Team Manager', isSystem: true },
    { name: SystemRoles.EMPLOYEE, permissions: employeePermissions, description: 'Standard Employee', isSystem: true },
  ];

  for (const roleDef of rolesToCreate) {
    let role = await Role.findOne({ name: roleDef.name });
    if (!role) {
      role = await Role.create(roleDef);
      console.log(`  ✅ Created system role: ${roleDef.name}`);
    } else {
      // Ensure system roles always have the right permissions
      role.permissions = roleDef.permissions;
      role.isSystem = true;
      await role.save();
      console.log(`  ℹ️  System role exists (updated permissions): ${roleDef.name}`);
    }
    roleMap[roleDef.name] = role._id as mongoose.Types.ObjectId;
  }

  return roleMap;
}

// ─── Step 2: Migrate Users ─────────────────────────────

async function migrateUsersToDynamicRoles(roleMap: Record<string, mongoose.Types.ObjectId>): Promise<void> {
  const users = await (User as any).find({ role: { $exists: true }, roleId: { $exists: false } });
  
  let migrated = 0;
  for (const user of users) {
    // If they have an old string role, map it. Treat 'user' as 'employee'.
    const oldRoleString = user.role === 'user' ? SystemRoles.EMPLOYEE : user.role;
    const targetRoleId = roleMap[oldRoleString] || roleMap[SystemRoles.EMPLOYEE];

    await (User as any).updateOne(
      { _id: user._id },
      { 
        $set: { roleId: targetRoleId },
        $unset: { role: "" }
      }
    );
    migrated++;
  }

  if (migrated > 0) {
    console.log(`  ✅ Migrated ${migrated} user(s) to reference Role ObjectIds`);
  } else {
    console.log(`  ℹ️  No legacy users needed role migration`);
  }
}

// ─── Step 3: Seed first admin ────────────────────────────

async function seedAdmin(adminRoleId: mongoose.Types.ObjectId): Promise<void> {
  const adminEmail = getEnv('SEED_ADMIN_EMAIL', '');
  const adminPassword = getEnv('SEED_ADMIN_PASSWORD', '');
  const adminName = getEnv('SEED_ADMIN_NAME', 'Admin');

  if (!adminEmail || !adminPassword) {
    console.log('  ℹ️  Skipping admin seed: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set');
    return;
  }

  const existing = await User.findOne({ email: adminEmail.toLowerCase() });
  if (existing) {
    if (existing.roleId?.toString() !== adminRoleId.toString()) {
      existing.roleId = adminRoleId;
      await existing.save();
      console.log(`  ✅ Existing admin role assignment updated: ${adminEmail}`);
    } else {
      console.log(`  ℹ️  Admin user already exists and role is correct: ${adminEmail}`);
    }
    return;
  }

  const salt = await bcryptjs.genSalt(12);
  const hashedPassword = await bcryptjs.hash(adminPassword, salt);

  await User.create({
    name: adminName,
    email: adminEmail.toLowerCase(),
    password: hashedPassword,
    roleId: adminRoleId,
  });

  console.log(`  ✅ Admin user seeded: ${adminEmail}`);
}

// ─── Main ────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('\n🚀 TaskForge Dynamic RBAC Migration\n');

  await connectDatabase();

  try {
    console.log('📦 Step 1: Seeding system roles...');
    const roleMap = await seedSystemRoles();

    console.log('\n👥 Step 2: Migrating user records...');
    await migrateUsersToDynamicRoles(roleMap);

    console.log('\n🔑 Step 3: Seeding admin user...');
    await seedAdmin(roleMap[SystemRoles.ADMIN]);

    console.log('\n✅ Migration completed successfully!\n');
  } catch (err) {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

main();
