import { Material } from '../models/Material.js';
import { Student } from '../models/Student.js';
import { getOrCreateAppDataPayload } from '../services/appData.service.js';
import { logAdminAction } from '../middleware/adminAuth.js';

function normalizeId(value) {
  if (value == null) return '';
  return String(value);
}

function normalizeName(value) {
  return typeof value === 'string' ? value : '';
}

function toOption(node) {
  const id = normalizeId(node?.id || node?._id || node?.key || node?.code || node?.name);
  const name = normalizeName(node?.name || node?.title || node?.label);
  return { id, name };
}

// Validation helpers
function validateMaterialTitle(title) {
  if (!title || typeof title !== 'string') {
    return { valid: false, error: 'Material title is required' };
  }
  
  const trimmed = title.trim();
  
  if (trimmed.length < 5) {
    return { valid: false, error: 'Material title must be at least 5 characters long' };
  }
  
  // Check for generic placeholder names
  const invalidNames = [
    'file1', 'file2', 'file3', 'document', 'upload', 'material', 
    'test', 'example', 'sample', 'untitled', 'new', 'doc1', 'doc2'
  ];
  
  if (invalidNames.includes(trimmed.toLowerCase())) {
    return { valid: false, error: 'Please provide a descriptive title. Generic names like "file1" or "document" are not allowed' };
  }
  
  // Check for proper format (Week N or Module N)
  const formatRegex = /^(Week|Module)\s+\d+\s*—\s*.+/i;
  if (!formatRegex.test(trimmed)) {
    return { 
      valid: false, 
      error: 'Title should follow format "Week N — Topic Name" or "Module N — Topic Name". Example: "Week 4 — HTML Forms Notes"' 
    };
  }
  
  return { valid: true };
}

function validateUploadFields(body) {
  const { branchId, intakeId, batchId, title } = body;
  const errors = [];
  
  if (!branchId?.trim()) {
    errors.push('Please select a branch');
  }
  
  if (!intakeId?.trim()) {
    errors.push('Please select an intake');
  }
  
  if (!batchId?.trim()) {
    errors.push('Please select a batch');
  }
  
  const titleValidation = validateMaterialTitle(title);
  if (!titleValidation.valid) {
    errors.push(titleValidation.error);
  }
  
  return errors;
}

// Get academic hierarchy for dropdowns
export async function getAcademicHierarchy(req, res, next) {
  try {
    const payload = await getOrCreateAppDataPayload('academics', { branches: [] });
    
    // Return the hierarchy structure for frontend dropdowns
    res.json({
      branches: Array.isArray(payload?.branches) ? payload.branches : []
    });
  } catch (err) {
    next(err);
  }
}

// Get branches for the first dropdown
export async function getBranches(req, res, next) {
  try {
    const payload = await getOrCreateAppDataPayload('academics', { branches: [] });
    const branches = Array.isArray(payload?.branches) ? payload.branches : [];
    
    res.json({ 
      branches: branches.map((b) => toOption(b)).filter((b) => b.id && b.name)
    });
  } catch (err) {
    next(err);
  }
}

// Get intakes for a specific branch
export async function getIntakes(req, res, next) {
  try {
    const { branchId } = req.params;
    
    if (!branchId) {
      return res.status(400).json({ message: 'Branch ID is required' });
    }
    
    const payload = await getOrCreateAppDataPayload('academics', { branches: [] });
    const branches = Array.isArray(payload?.branches) ? payload.branches : [];
    
    const branch = branches.find(
      (b) => normalizeId(b?.id || b?._id || b?.key || b?.code || b?.name) === normalizeId(branchId)
    );
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    
    const intakes = Array.isArray(branch.intakes) ? branch.intakes : [];
    
    res.json({ 
      intakes: intakes.map((i) => toOption(i)).filter((i) => i.id && i.name)
    });
  } catch (err) {
    next(err);
  }
}

// Get batches for a specific branch and intake
export async function getBatches(req, res, next) {
  try {
    const { branchId, intakeId } = req.params;
    
    if (!branchId || !intakeId) {
      return res.status(400).json({ message: 'Branch ID and Intake ID are required' });
    }
    
    const payload = await getOrCreateAppDataPayload('academics', { branches: [] });
    const branches = Array.isArray(payload?.branches) ? payload.branches : [];
    
    const branch = branches.find(
      (b) => normalizeId(b?.id || b?._id || b?.key || b?.code || b?.name) === normalizeId(branchId)
    );
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    
    const intakes = Array.isArray(branch.intakes) ? branch.intakes : [];
    const intake = intakes.find(
      (i) => normalizeId(i?.id || i?._id || i?.key || i?.code || i?.name) === normalizeId(intakeId)
    );
    if (!intake) {
      return res.status(404).json({ message: 'Intake not found' });
    }
    
    const batches = Array.isArray(intake.batches) ? intake.batches : [];
    
    res.json({ 
      batches: batches.map((b) => ({ ...toOption(b), studentCount: Number(b?.studentCount || 0) }))
    });
  } catch (err) {
    next(err);
  }
}

// Upload material (admin only)
export async function uploadMaterial(req, res, next) {
  try {
    const { branchId, intakeId, batchId, title, description, category } = req.body;
    const adminAuth = req.adminAuth;
    
    // Validate required fields
    const validationErrors = validateUploadFields(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Upload validation failed', 
        errors: validationErrors 
      });
    }
    
    // Check if file was uploaded (this would be handled by multer middleware)
    if (!req.file) {
      return res.status(400).json({ message: 'Please select a file to upload' });
    }
    
    // Extract week/module number from title for categorization
    const weekMatch = title.match(/Week\s+(\d+)/i);
    const moduleMatch = title.match(/Module\s+(\d+)/i);
    
    // Create material record
    const material = new Material({
      branchId: branchId.trim(),
      intakeId: intakeId.trim(),
      batchId: batchId.trim(),
      title: title.trim(),
      description: description?.trim() || '',
      fileName: req.file.originalname,
      fileUrl: req.file.path || req.file.filename, // Depends on storage configuration
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      uploadedBy: adminAuth.id,
      uploadedByName: adminAuth.name || 'Admin',
      category: category?.trim() || 'Study Material',
      week: weekMatch ? parseInt(weekMatch[1]) : null,
      module: moduleMatch ? parseInt(moduleMatch[1]) : null,
    });
    
    const saved = await material.save();
    
    // Log the action for audit trail
    await logAdminAction(adminAuth.id, 'UPLOAD_MATERIAL', {
      materialId: saved._id,
      title: title.trim(),
      branchId,
      intakeId, 
      batchId,
      fileSize: req.file.size
    });
    
    res.status(201).json({
      message: 'Material uploaded successfully',
      material: {
        id: saved._id,
        title: saved.title,
        fileName: saved.fileName,
        fileSize: saved.fileSize,
        fileType: saved.fileType,
        uploadedAt: saved.createdAt
      }
    });
    
  } catch (err) {
    next(err);
  }
}

// Get materials for students (filtered by their batch)
export async function getStudentMaterials(req, res, next) {
  try {
    // Get current student from auth
    const studentId = req.auth?.sub;
    if (!studentId) {
      return res.status(401).json({ message: 'Student authentication required' });
    }
    
    // Find student to get their batch info
    const student = await Student.findById(studentId).lean();
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if student has batch assignment
    if (!student.branchId || !student.intakeId || !student.batchId) {
      return res.json({ 
        materials: [], 
        message: 'You have not been assigned to a batch yet. Please contact administration.' 
      });
    }

    // Get academic hierarchy to resolve names
    const payload = await getOrCreateAppDataPayload('academics', { branches: [] });
    const branches = Array.isArray(payload?.branches) ? payload.branches : [];
    
    // Find the branch, intake, and batch names
    const branch = branches.find(b => b.id === student.branchId);
    const intake = branch?.intakes?.find(i => i.id === student.intakeId);
    const batch = intake?.batches?.find(b => b.id === student.batchId);
    
    const branchName = branch?.name || 'Unknown Branch';
    const intakeName = intake?.name || 'Unknown Intake';
    const batchName = batch?.name || 'Unknown Batch';
    
    // Get materials for student's batch
    const materials = await Material.find({
      branchId: student.branchId,
      intakeId: student.intakeId,
      batchId: student.batchId,
      isActive: true
    })
    .sort({ createdAt: -1 })
    .select('title description fileName fileType fileSize createdAt category week module downloadCount')
    .lean();
    
    res.json({ 
      materials: materials.map(material => ({
        id: material._id,
        title: material.title,
        description: material.description,
        fileName: material.fileName,
        fileType: material.fileType,
        fileSize: material.fileSize,
        uploadedAt: material.createdAt,
        category: material.category,
        week: material.week,
        module: material.module,
        downloadCount: material.downloadCount,
        // Add branch hierarchy information
        branchName: branchName,
        intakeName: intakeName,
        batchName: batchName,
        branchId: student.branchId,
        intakeId: student.intakeId,
        batchId: student.batchId
      }))
    });
    
  } catch (err) {
    next(err);
  }
}

// Download material (students only see their batch materials)
export async function downloadMaterial(req, res, next) {
  try {
    const { materialId } = req.params;
    const studentId = req.auth?.sub;
    
    if (!studentId) {
      return res.status(401).json({ message: 'Student authentication required' });
    }
    
    // Find student to get their batch info
    const student = await Student.findById(studentId).lean();
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Find material and verify access
    const material = await Material.findOne({
      _id: materialId,
      isActive: true
    }).lean();
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    
    // Verify student has access to this material
    if (material.branchId !== student.branchId || 
        material.intakeId !== student.intakeId || 
        material.batchId !== student.batchId) {
      return res.status(403).json({ 
        message: 'Access denied. This material is not available for your batch.' 
      });
    }
    
    // Increment download count
    await Material.findByIdAndUpdate(materialId, { 
      $inc: { downloadCount: 1 } 
    });
    
    // Return file download URL or stream
    // This depends on your file storage setup (local files, S3, etc.)
    res.json({
      downloadUrl: material.fileUrl,
      fileName: material.fileName,
      fileSize: material.fileSize
    });
    
  } catch (err) {
    next(err);
  }
}

// Admin: Get all materials with filters
export async function getAdminMaterials(req, res, next) {
  try {
    const { branchId, intakeId, batchId, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (branchId) filter.branchId = branchId;
    if (intakeId) filter.intakeId = intakeId;
    if (batchId) filter.batchId = batchId;
    
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    
    const materials = await Material.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();
    
    const total = await Material.countDocuments(filter);
    
    res.json({
      materials: materials.map(material => ({
        id: material._id,
        title: material.title,
        fileName: material.fileName,
        fileType: material.fileType,
        fileSize: material.fileSize,
        branchId: material.branchId,
        intakeId: material.intakeId,
        batchId: material.batchId,
        uploadedBy: material.uploadedByName,
        uploadedAt: material.createdAt,
        downloadCount: material.downloadCount,
        isActive: material.isActive
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
    
  } catch (err) {
    next(err);
  }
}