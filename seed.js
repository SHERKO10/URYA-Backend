import dotenv from 'dotenv';
import { getDB, connectDB } from './config/db.js';

dotenv.config();

const seedData = async () => {
  try {
    connectDB();
    const db = getDB();

    db.exec('DELETE FROM projects; DELETE FROM reviews;');

    console.log('🗑️  Anciennes données supprimées');

    const insertProject = db.prepare(`
      INSERT INTO projects (
        title, description, imageUrl, category,
        github, demo, playstore,
        isFeatured, members, tags, createdAt, updatedAt
      ) VALUES (
        @title, @description, @imageUrl, @category,
        @github, @demo, @playstore,
        @isFeatured, @members, @tags,
        datetime('now'), datetime('now')
      )
    `);

    const projectsData = [
      {
        title: 'MAFAHA',
        description:
          'Système d’Intelligence Cryptographique Comportementale pour détecter les ransomwares et usurpations d’identité. Analyse comportementale par IA avec Kill-Switch cryptographique en temps réel.',
        imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800',
        category: 'ai',
        links: {
          github: null,
          demo: null,
        },
        isFeatured: true,
        members: ['Équipe URYA'],
        tags: [
          'Détection < 2s',
          'Faux positifs < 5%',
          'Kill-Switch',
          'Zero Trust',
        ],
      },
      {
        title: 'AFRICAPAY',
        description:
          'Application de paiement Mobile Money en CFA basée sur la blockchain (Stellar/Celo). Paiements par QR code, frais réduits et meilleure interopérabilité entre les opérateurs.',
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
        category: 'mobile',
        links: {
          github: null,
          demo: null,
          playstore: null,
        },
        isFeatured: true,
        members: ['Équipe URYA'],
        tags: ['QR Code', 'Blockchain', 'Mobile Money', 'Interopérable'],
      },
      {
        title: 'Neurol Détection',
        description:
          'Module IA de Détection d’Intrusions basé sur Random Forest et LSTM. Analyse jusqu’à 100 000 logs pour réduire de 40% le temps de détection des attaques.',
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        category: 'ai',
        links: {
          github: null,
          demo: null,
        },
        isFeatured: true,
        members: ['Équipe URYA'],
        tags: [
          '100 000 logs',
          'Random Forest + LSTM',
          'API REST',
          '-40% temps détection',
        ],
      },
    ];

    const insertManyProjects = db.transaction((rows) => {
      for (const p of rows) {
        insertProject.run({
          title: p.title,
          description: p.description,
          imageUrl: p.imageUrl,
          category: p.category,
          github: p.links?.github || null,
          demo: p.links?.demo || null,
          playstore: p.links?.playstore || null,
          isFeatured: p.isFeatured ? 1 : 0,
          members: JSON.stringify(p.members || []),
          tags: JSON.stringify(p.tags || []),
        });
      }
    });

    insertManyProjects(projectsData);

    const projectsCount = db.prepare('SELECT COUNT(*) as count FROM projects').get()
      .count;

    console.log(`✅ ${projectsCount} projets créés`);

    const insertReview = db.prepare(`
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

    const reviewsData = [
      {
        userId: 'demo-user-1',
        userName: 'Alice Martin',
        rating: 5,
        comment: 'Projet incroyable ! L\'interface est magnifique et les fonctionnalités sont au top. Bravo à toute l\'équipe !',
      },
      {
        userId: 'demo-user-2',
        userName: 'Thomas Dubois',
        rating: 4,
        comment: 'Très beau travail, j\'adore le design inspiré d\'Apple. Quelques petits bugs à corriger mais rien de grave.',
      },
      {
        userId: 'demo-user-3',
        userName: 'Sarah Benali',
        rating: 5,
        comment: 'L\'intégration de l\'IA est impressionnante. Le chatbot répond vraiment bien aux questions !',
      },
      {
        userId: 'demo-user-4',
        userName: 'Mohamed Amine',
        rating: 5,
        comment: 'Fier de faire partie de ce projet. Les animations sont fluides et l\'expérience utilisateur est excellente.',
      },
      {
        userId: 'demo-user-5',
        userName: 'Leila Mansouri',
        rating: 4,
        comment: 'Superbe plateforme ! J\'aimerais juste plus de projets dans la catégorie mobile.',
      },
    ];

    const insertManyReviews = db.transaction((rows) => {
      for (const r of rows) {
        insertReview.run({
          userId: r.userId,
          userName: r.userName,
          userAvatar: r.userAvatar || null,
          rating: r.rating,
          comment: r.comment,
          projectId: null,
        });
      }
    });

    insertManyReviews(reviewsData);

    const reviewsCount = db.prepare('SELECT COUNT(*) as count FROM reviews').get()
      .count;

    console.log(`✅ ${reviewsCount} avis créés`);

    console.log('\n🎉 Seed terminé avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
};

seedData();
