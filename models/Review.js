import { getDB } from '../config/db.js';

const mapRowToReview = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.userId,
    userName: row.userName,
    userAvatar: row.userAvatar,
    rating: row.rating,
    comment: row.comment,
    projectId: row.projectId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

export const getAllReviews = (limit = 50) => {
  const db = getDB();
  const stmt = db.prepare(
    'SELECT * FROM reviews ORDER BY datetime(createdAt) DESC LIMIT ?'
  );
  const rows = stmt.all(limit);
  return rows.map(mapRowToReview);
};

export const getReviewsByProject = (projectId) => {
  const db = getDB();
  const stmt = db.prepare(
    'SELECT * FROM reviews WHERE projectId = ? ORDER BY datetime(createdAt) DESC'
  );
  const rows = stmt.all(projectId);
  return rows.map(mapRowToReview);
};

export const getAverageStats = () => {
  const db = getDB();
  const stmt = db.prepare(
    'SELECT AVG(rating) as averageRating, COUNT(*) as totalReviews FROM reviews'
  );
  const row = stmt.get();
  return {
    averageRating: row?.averageRating || 0,
    totalReviews: row?.totalReviews || 0,
  };
};

export const createReview = (data) => {
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO reviews (
      userId, userName, userAvatar,
      rating, comment, projectId,
      createdAt, updatedAt
    ) VALUES (
      @userId, @userName, @userAvatar,
      @rating, @comment, @projectId,
      datetime('now'), datetime('now')
    )
  `);

  const info = stmt.run({
    userId: data.userId,
    userName: data.userName,
    userAvatar: data.userAvatar || null,
    rating: data.rating,
    comment: data.comment,
    projectId: data.projectId || null,
  });

  const select = db.prepare('SELECT * FROM reviews WHERE id = ?');
  return mapRowToReview(select.get(info.lastInsertRowid));
};

export const deleteReview = (id) => {
  const db = getDB();
  const stmt = db.prepare('DELETE FROM reviews WHERE id = ?');
  const info = stmt.run(id);
  return info.changes > 0;
};

export default {
  getAllReviews,
  getReviewsByProject,
  getAverageStats,
  createReview,
  deleteReview,
};
