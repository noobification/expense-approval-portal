import express from 'express';
import cors from 'cors';
import { db } from '../src/db/index';
import { projects, lineItems, documents, users } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables in server');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Secure all API routes using Supabase Auth Token Middleware
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            console.log('Supabase Auth Error or No User:', error);
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Check if user is approved in our DB
        let dbUser = await db.select().from(users).where(eq(users.id, user.id)).limit(1);

        const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'jablodominik@gmail.com').toLowerCase();
        const ADMIN_USER_ID = process.env.ADMIN_USER_ID;
        const userEmail = user.email?.toLowerCase();
        const isAdminEmail = userEmail === ADMIN_EMAIL;
        const isHardcodedAdmin = user.id === ADMIN_USER_ID || isAdminEmail;

        console.log(`[Auth] Request for: ${userEmail}, isHardcodedAdmin: ${isHardcodedAdmin}, path: ${req.path}`);

        if (dbUser.length === 0) {
            console.log(`[Auth] Provisioning new user: ${userEmail}`);
            // Auto-provision user record
            const newUser = await db.insert(users).values({
                id: user.id,
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
                email: user.email || '',
                isApproved: isHardcodedAdmin ? "true" : "false",
                role: isHardcodedAdmin ? "Admin" : "User"
            }).returning();
            dbUser = newUser;
        } else if (isHardcodedAdmin && (dbUser[0].isApproved !== "true" || dbUser[0].role !== "Admin")) {
            console.log(`[Auth] Auto-approving admin: ${userEmail}`);
            // Auto-approve and make admin if it's the specified admin email or ID
            const updatedUser = await db.update(users)
                .set({ isApproved: "true", role: "Admin" })
                .where(eq(users.id, user.id))
                .returning();
            dbUser = updatedUser;
        }

        console.log(`[Auth] DB Status for ${userEmail}: isApproved=${dbUser[0].isApproved}, role=${dbUser[0].role}`);

        const isApproved = dbUser[0].isApproved === "true" || isHardcodedAdmin;
        const isAdmin = dbUser[0].role === "Admin" || isHardcodedAdmin;

        // Bypass approval for admin or if on /me endpoint
        if (!isApproved && !isAdmin && req.path !== '/me') {
            return res.status(403).json({
                error: 'Account pending approval',
                code: 'PENDING_APPROVAL'
            });
        }

        (req as any).auth = {
            userId: user.id,
            isApproved,
            isAdmin,
            user: dbUser[0]
        };
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
};

app.use('/api', requireAuth);

// --- USER API ---
app.get('/api/me', (req, res) => {
    const auth = (req as any).auth;
    res.json({
        ...auth.user,
        isApproved: auth.isApproved,
        isAdmin: auth.isAdmin
    });
});

// Setup Multer for file uploads (Memory storage for Supabase)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- PROJECTS API ---

app.get('/api/projects', async (req, res) => {
    try {
        const allProjects = await db.select().from(projects);
        res.json(allProjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

app.post('/api/projects', async (req, res) => {
    try {
        const { name, address, salesPrice, status } = req.body;
        const newProject = await db.insert(projects).values({
            id: crypto.randomUUID(),
            name,
            address: address || null,
            salesPrice: Number(salesPrice) || 0,
            status: status || 'Active',
            createdAt: new Date()
        }).returning();

        const projectId = newProject[0].id;

        const DEFAULT_LINE_ITEMS = [
            // Pre-Construction & Approvals
            { category: 'Pre-Construction', name: 'Loan Closing Costs' },
            { category: 'Pre-Construction', name: 'Lender Payment' },
            { category: 'Pre-Construction', name: 'Lot Split A' },
            { category: 'Pre-Construction', name: 'Lot Split B' },
            { category: 'Pre-Construction', name: 'Plans' },
            { category: 'Pre-Construction', name: 'Plan Review' },
            { category: 'Pre-Construction', name: 'Permits & Approvals' },
            { category: 'Pre-Construction', name: 'Insurance' },
            { category: 'Pre-Construction', name: 'MG2A' },
            // Foundation & Framing
            { category: 'Foundation & Framing', name: 'Foundation & Excavation' },
            { category: 'Foundation & Framing', name: 'Water Hookup' },
            { category: 'Foundation & Framing', name: 'Steel' },
            { category: 'Foundation & Framing', name: 'Lumber' },
            { category: 'Foundation & Framing', name: 'Framing' },
            // Exterior & Mechanicals
            { category: 'Exterior & Mechanicals', name: 'Windows' },
            { category: 'Exterior & Mechanicals', name: 'Roofing' },
            { category: 'Exterior & Mechanicals', name: 'Siding' },
            { category: 'Exterior & Mechanicals', name: 'Siding Labor' },
            { category: 'Exterior & Mechanicals', name: 'Bricks' },
            { category: 'Exterior & Mechanicals', name: 'Masonry' },
            { category: 'Exterior & Mechanicals', name: 'HVAC' },
            { category: 'Exterior & Mechanicals', name: 'Plumbing' },
            { category: 'Exterior & Mechanicals', name: 'Electrical' },
            // Insulation & Finish Prep
            { category: 'Insulation & Finish Prep', name: 'Insulation' },
            { category: 'Insulation & Finish Prep', name: 'Drywall' },
            { category: 'Insulation & Finish Prep', name: 'Drywall Labor' },
            // Site & Exterior Finishes
            { category: 'Site & Exterior Finishes', name: 'Grading' },
            { category: 'Site & Exterior Finishes', name: 'Driveway / Sidewalks' },
            { category: 'Site & Exterior Finishes', name: 'Grass' },
            { category: 'Site & Exterior Finishes', name: 'Exterior Doors' },
            { category: 'Site & Exterior Finishes', name: 'Porta Potty' },
            // Interior Finishes
            { category: 'Interior Finishes', name: 'Cabinets / Interior Doors / Trim' },
            { category: 'Interior Finishes', name: 'Countertops' },
            { category: 'Interior Finishes', name: 'Appliances' },
            { category: 'Interior Finishes', name: 'Backsplash' },
            { category: 'Interior Finishes', name: 'Tiles' },
            { category: 'Interior Finishes', name: 'Shower Glass' },
            { category: 'Interior Finishes', name: 'Paint' },
            { category: 'Interior Finishes', name: 'Plumbing Fixtures' },
            { category: 'Interior Finishes', name: 'Lighting Fixtures' },
            { category: 'Interior Finishes', name: 'Flooring Material' },
            { category: 'Interior Finishes', name: 'Flooring Labor' },
            { category: 'Interior Finishes', name: 'Stair Labor' }
        ];

        // Bulk insert default line items
        if (DEFAULT_LINE_ITEMS.length > 0) {
            await db.insert(lineItems).values(
                DEFAULT_LINE_ITEMS.map(item => ({
                    id: crypto.randomUUID(),
                    projectId,
                    name: item.name,
                    category: item.category,
                    paidBy: 'Company',
                    budget: 0,
                    actualCost: 0,
                    amountPaid: 0,
                    status: 'Not Started',
                    createdAt: new Date()
                }))
            );
        }

        res.json(newProject[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

app.get('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await db.select().from(projects).where(eq(projects.id, id));
        if (project.length === 0) return res.status(404).json({ error: 'Project not found' });
        const items = await db.select().from(lineItems).where(eq(lineItems.projectId, id));
        res.json({ ...project[0], lineItems: items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch project details' });
    }
});

app.put('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if ('salesPrice' in updateData) updateData.salesPrice = Number(updateData.salesPrice);

        const updated = await db.update(projects)
            .set(updateData)
            .where(eq(projects.id, id))
            .returning();

        res.json(updated[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.delete(lineItems).where(eq(lineItems.projectId, id)); // Clean up cascade manually
        await db.delete(projects).where(eq(projects.id, id));
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// --- LINE ITEMS API ---

app.get('/api/line-items', async (req, res) => {
    try {
        const itemsWithProjects = await db
            .select({
                id: lineItems.id,
                parentId: lineItems.parentId,
                name: lineItems.name,
                category: lineItems.category,
                paidBy: lineItems.paidBy,
                budget: lineItems.budget,
                actualCost: lineItems.actualCost,
                amountPaid: lineItems.amountPaid,
                status: lineItems.status,
                dateIncurred: lineItems.dateIncurred,
                projectName: projects.name,
                projectId: projects.id,
            })
            .from(lineItems)
            .innerJoin(projects, eq(lineItems.projectId, projects.id));
        res.json(itemsWithProjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch line items' });
    }
});

app.post('/api/line-items', async (req, res) => {
    try {
        const { projectId, parentId, name, category, paidBy, budget, actualCost, amountPaid, status, dateIncurred } = req.body;

        // Admin Approval Workflow Logic
        const userId = (req as any).auth?.userId;
        const ADMIN_USER_ID = process.env.ADMIN_USER_ID; // The admin Clerk ID
        const isUserAdmin = userId === ADMIN_USER_ID;

        // Force 'Pending Approval' for non-admin users adding new line items
        const initialStatus = isUserAdmin ? (status || 'Not Started') : 'Pending Approval';

        const newItem = await db.insert(lineItems).values({
            id: crypto.randomUUID(),
            projectId,
            parentId: parentId || null,
            name,
            category: category || 'Uncategorized',
            paidBy,
            budget: Number(budget) || 0,
            actualCost: Number(actualCost) || 0,
            amountPaid: Number(amountPaid) || 0,
            status: initialStatus,
            dateIncurred: dateIncurred ? new Date(dateIncurred) : new Date(),
            createdAt: new Date()
        }).returning();
        res.json(newItem[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add line item' });
    }
});

app.put('/api/line-items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Admin Security Check
        const userId = (req as any).auth?.userId;
        const ADMIN_USER_ID = process.env.ADMIN_USER_ID;
        const isUserAdmin = userId === ADMIN_USER_ID;

        console.log(`Update Attempt - User: ${userId}, Admin: ${ADMIN_USER_ID}, Match: ${isUserAdmin}`);

        // Strip status update payload from non-admin accounts
        if (!isUserAdmin && 'status' in updateData) {
            delete updateData.status;
        }

        // Parse numbers safely from payload before updating database
        if ('budget' in updateData) updateData.budget = Number(updateData.budget);
        if ('actualCost' in updateData) updateData.actualCost = Number(updateData.actualCost);
        if ('amountPaid' in updateData) updateData.amountPaid = Number(updateData.amountPaid);
        if ('dateIncurred' in updateData) updateData.dateIncurred = new Date(updateData.dateIncurred);

        const updated = await db.update(lineItems)
            .set(updateData)
            .where(eq(lineItems.id, id))
            .returning();
        res.json(updated[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update line item' });
    }
});

app.delete('/api/line-items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[Delete] Request for LineItem ID: ${id}`);

        // 1. Fetch documents for this item AND all child items recursively (optional, but let's start with this item)
        // Since we have ON DELETE CASCADE, deleting from DB is easy, but Storage needs manual cleanup.
        const docsToDelete = await db.select().from(documents).where(eq(documents.lineItemId, id));

        for (const doc of docsToDelete) {
            try {
                const urlParts = doc.url.split('/');
                const fileName = urlParts[urlParts.length - 1];
                if (doc.url.includes('supabase.co')) {
                    await supabase.storage.from('documents').remove([`documents/${fileName}`]);
                }
            } catch (err) {
                console.error(`[Delete] Storage cleanup failed for ${doc.id}:`, err);
            }
        }

        // 2. Delete from database (Cascade will handle sub-items if DB configured correctly)
        await db.delete(documents).where(eq(documents.lineItemId, id));
        await db.delete(lineItems).where(eq(lineItems.id, id));

        res.json({ message: 'Line item deleted successfully' });
    } catch (error) {
        console.error('[Delete] Route Error:', error);
        res.status(500).json({ error: 'Failed to delete line item' });
    }
});

// --- DOCUMENTS / FILE UPLOAD API ---

app.post('/api/line-items/:id/upload', upload.single('document'), async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const type = (req.body.type as string) || 'Receipt';
        const file = req.file;
        const fileExt = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
        const filePath = `documents/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (uploadError) {
            console.error('Supabase Upload Error:', uploadError);
            return res.status(500).json({ error: 'Failed to upload to storage' });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

        const doc = await db.insert(documents).values({
            id: crypto.randomUUID(),
            lineItemId: id,
            type,
            name: file.originalname,
            url: publicUrl,
            uploadedAt: new Date()
        } as any).returning();

        res.json(doc[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload document' });
    }
});

app.get('/api/line-items/:id/documents', async (req, res) => {
    try {
        const { id } = req.params;
        const docs = await db.select().from(documents).where(eq(documents.lineItemId, id));
        res.json(docs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

app.delete('/api/documents/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.select().from(documents).where(eq(documents.id, id));
        if (doc.length === 0) return res.status(404).json({ error: 'Document not found' });

        // Delete from database
        await db.delete(documents).where(eq(documents.id, id));

        // Delete from Supabase Storage
        const urlParts = doc[0].url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const { error: storageError } = await supabase.storage
            .from('documents')
            .remove([`documents/${fileName}`]);

        if (storageError) {
            console.error('Supabase Storage Delete Error:', storageError);
        }

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete document' });
    }
});

// --- ADMIN API ---

app.get('/api/admin/users', async (req, res) => {
    try {
        if (!(req as any).auth.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const allUsers = await db.select().from(users);
        res.json(allUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.post('/api/admin/users/:id/approve', async (req, res) => {
    try {
        if (!(req as any).auth.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        const { isApproved } = req.body;

        await db.update(users)
            .set({ isApproved })
            .where(eq(users.id, id));

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// --- DATABASE SEEDING ---

app.post('/api/seed', async (req, res) => {
    try {
        const projectId1 = crypto.randomUUID();
        const projectId2 = crypto.randomUUID();

        await db.insert(projects).values([
            { id: projectId1, name: 'Skyline Residential', address: '123 Skyline Blvd', salesPrice: 1500000, status: 'Active', createdAt: new Date() },
            { id: projectId2, name: 'Harbor Commercial', address: '456 Harbor Way', salesPrice: 3200000, status: 'Delayed', createdAt: new Date() }
        ]);

        await db.insert(lineItems).values([
            {
                id: crypto.randomUUID(),
                projectId: projectId1,
                name: 'Foundation Concrete',
                paidBy: 'Matt',
                status: 'Completed',
                category: 'Concrete',
                budget: 12000,
                actualCost: 11500,
                amountPaid: 11500,
                dateIncurred: new Date('2026-02-15'),
                createdAt: new Date()
            },
            {
                id: crypto.randomUUID(),
                projectId: projectId1,
                name: 'Framing Labor',
                paidBy: 'Dominik',
                status: 'In Progress',
                category: 'Framing',
                budget: 45000,
                actualCost: 20000,
                amountPaid: 15000,
                dateIncurred: new Date('2026-03-01'),
                createdAt: new Date()
            },
            {
                id: crypto.randomUUID(),
                projectId: projectId2,
                name: 'HVAC Units',
                paidBy: 'Credit',
                status: 'Waiting on Material',
                category: 'HVAC',
                budget: 85000,
                actualCost: 0,
                amountPaid: 0,
                dateIncurred: new Date('2026-03-05'),
                createdAt: new Date()
            }
        ]);

        res.json({ message: 'Database seeded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to seed database' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
