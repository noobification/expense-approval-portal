import { pgTable, text, real, timestamp } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
    id: text("id").primaryKey(), // We will use UUIDs manually or crypto.randomUUID()
    name: text("name").notNull(),
    address: text("address"),
    salesPrice: real("sales_price").notNull().default(0),
    status: text("status").notNull().default("Active"), // "Active | Completed | On Hold"
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const lineItems = pgTable("line_items", {
    id: text("id").primaryKey(),
    projectId: text("project_id").references(() => projects.id).notNull(),
    parentId: text("parent_id"), // Self-referencing ID for sub-costs
    name: text("name").notNull(),
    paidBy: text("paid_by").notNull(),
    status: text("status").notNull().default("In Progress"), // "Completed | In Progress | Waiting on Material | Revision Required"
    budget: real("budget").notNull().default(0),
    actualCost: real("actual_cost").notNull().default(0),
    amountPaid: real("amount_paid").notNull().default(0),
    category: text("category").notNull(),
    dateIncurred: timestamp("date_incurred"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const documents = pgTable("documents", {
    id: text("id").primaryKey(),
    lineItemId: text("line_item_id").references(() => lineItems.id).notNull(),
    type: text("type").notNull(), // "Invoice | Receipt | Lien Waiver"
    name: text("name"), // Original filename
    url: text("url").notNull(),
    uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    isApproved: text("is_approved").notNull().default("false"), // "true" | "false"
    role: text("role").notNull().default("User"), // "Admin" | "User"
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
