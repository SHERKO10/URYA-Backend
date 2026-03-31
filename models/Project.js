import { getDB } from '../config/db.js';

const mapRowToProject = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.imageUrl,
    category: row.category,
    links: {
      github: row.github || null,
      demo: row.demo || null,
      playstore: row.playstore || null,
    },
    isFeatured: !!row.isFeatured,
    members: row.members ? JSON.parse(row.members) : [],
    tags: row.tags ? JSON.parse(row.tags) : [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

export const getAllProjects = () => {
  const db = getDB();
  const stmt = db.prepare('SELECT * FROM projects ORDER BY datetime(createdAt) DESC');
  const rows = stmt.all();
  return rows.map(mapRowToProject);
};

export const getFeaturedProject = () => {
  const db = getDB();
  const stmt = db.prepare('SELECT * FROM projects WHERE isFeatured = 1 ORDER BY id DESC LIMIT 1');
  const row = stmt.get();
  return mapRowToProject(row);
};

export const getProjectById = (id) => {
  const db = getDB();
  const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
  const row = stmt.get(id);
  return mapRowToProject(row);
};

export const createProject = (data) => {
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO projects (
      title, description, imageUrl, category,
      github, demo, playstore,
      isFeatured, members, tags, createdAt, updatedAt
    ) VALUES (
      @title, @description, @imageUrl, @category,
      @github, @demo, @playstore,
      @isFeatured, @members, @tags, datetime('now'), datetime('now')
    )
  `);

  const info = stmt.run({
    title: data.title,
    description: data.description,
    imageUrl: data.imageUrl,
    category: data.category || 'other',
    github: data.links?.github || null,
    demo: data.links?.demo || null,
    playstore: data.links?.playstore || null,
    isFeatured: data.isFeatured ? 1 : 0,
    members: data.members ? JSON.stringify(data.members) : JSON.stringify([]),
    tags: data.tags ? JSON.stringify(data.tags) : JSON.stringify([]),
  });

  return getProjectById(info.lastInsertRowid);
};

export const updateProject = (id, data) => {
  const db = getDB();
  const existing = getProjectById(id);
  if (!existing) return null;

  const merged = {
    ...existing,
    ...data,
    links: { ...existing.links, ...(data.links || {}) },
  };

  const stmt = db.prepare(`
    UPDATE projects SET
      title = @title,
      description = @description,
      imageUrl = @imageUrl,
      category = @category,
      github = @github,
      demo = @demo,
      playstore = @playstore,
      isFeatured = @isFeatured,
      members = @members,
      tags = @tags,
      updatedAt = datetime('now')
    WHERE id = @id
  `);

  stmt.run({
    id,
    title: merged.title,
    description: merged.description,
    imageUrl: merged.imageUrl,
    category: merged.category || 'other',
    github: merged.links?.github || null,
    demo: merged.links?.demo || null,
    playstore: merged.links?.playstore || null,
    isFeatured: merged.isFeatured ? 1 : 0,
    members: merged.members ? JSON.stringify(merged.members) : JSON.stringify([]),
    tags: merged.tags ? JSON.stringify(merged.tags) : JSON.stringify([]),
  });

  return getProjectById(id);
};

export const deleteProject = (id) => {
  const db = getDB();
  const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
  const info = stmt.run(id);
  return info.changes > 0;
};

export default {
  getAllProjects,
  getFeaturedProject,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
