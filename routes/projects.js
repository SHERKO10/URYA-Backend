import express from 'express';
import {
  getAllProjects,
  getFeaturedProject,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../models/Project.js';
import {
  isAdminConfigReady,
  isAuthorizedAdminRequest,
} from '../utils/adminAuth.js';

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (!isAdminConfigReady()) {
    return res
      .status(500)
      .json({
        message:
          'ADMIN_USERNAME, ADMIN_PASSWORD et ADMIN_API_KEY doivent etre configures.',
      });
  }

  if (!isAuthorizedAdminRequest(req)) {
    return res.status(401).json({ message: 'Accès administrateur requis' });
  }

  return next();
};

router.get('/', (req, res) => {
  try {
    const projects = getAllProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/featured', (req, res) => {
  try {
    const featured = getFeaturedProject();
    res.json(featured);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const project = getProjectById(Number(req.params.id));
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', requireAdmin, (req, res) => {
  try {
    const newProject = createProject(req.body);
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', requireAdmin, (req, res) => {
  try {
    const project = updateProject(Number(req.params.id), req.body);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const deleted = deleteProject(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
