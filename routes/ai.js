import express from 'express';
import { getAllProjects } from '../models/Project.js';

const router = express.Router();

let anthropic = null;
const apiKey = process.env.ANTHROPIC_API_KEY || '';

if (apiKey) {
  (async () => {
    try {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      anthropic = new Anthropic({ apiKey });
    } catch (e) {
      console.error('Impossible de charger le SDK Anthropic:', e.message);
      anthropic = null;
    }
  })();
}

const SYSTEM_PROMPT = `Tu es l'assistant virtuel d'URYA, un projet de stage innovant.
Tu dois aider les utilisateurs à :
- Comprendre ce qu'est URYA et sa mission
- Découvrir les projets développés par l'équipe
- Obtenir des informations techniques
- Être guidé dans leur navigation sur le site

Tu es amical, professionnel et concis dans tes réponses.
Tu réponds en français sauf si l'utilisateur te parle dans une autre langue.`;

// POST chat with AI
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Mode "local" sans Anthropic : assistant guidé par les données du site
    if (!anthropic) {
      const lower = message.toLowerCase();
      const projects = getAllProjects();
      const mainProjects = projects.slice(0, 3);
      const projectList = mainProjects
        .map(
          (p, idx) =>
            `${idx + 1}. ${p.title} (${p.category || 'projet'})`
        )
        .join('\n');

      let answer = '';

      if (lower.includes('projet')) {
        answer +=
          "Voici les 3 projets principaux URYA actuellement présentés sur le site :\n\n";
        answer += projectList || '- Aucun projet en base pour le moment.\n\n';
        answer +=
          "Tu peux les découvrir visuellement dans la page « Dashboard » (vue d’ensemble) et plus en détail dans la page « Projets ».\n";
      } else if (
        lower.includes('urya') ||
        lower.includes('c\'est quoi') ||
        lower.includes('présenter') ||
        lower.includes('présentation')
      ) {
        answer +=
          "URYA est un projet de stage CUBE dédié à la protection des données par cryptographie et intelligence artificielle.\n\n";
        answer +=
          "- La page d’accueil (`/`) te donne la vision globale et le contexte.\n";
        answer +=
          "- La page « Dashboard » (`/dashboard`) présente la mission, les chiffres clés et un projet phare.\n";
        answer +=
          "- La page « Projets » (`/projects`) détaille chaque projet et service.\n";
        answer +=
          "- La page « Auth » (`/auth`) permet de se connecter pour laisser un avis ou accéder à l’admin.\n";
      } else if (
        lower.includes('contacter') ||
        lower.includes('contact') ||
        lower.includes('contribuer') ||
        lower.includes('participer')
      ) {
        answer +=
          "Pour nous contacter ou contribuer :\n\n";
        answer +=
          "- Utilise la page d’authentification (`/auth`) pour te connecter.\n";
        answer +=
          "- Une fois connecté, tu peux laisser des avis dans la section « Avis & Feedback ».\n";
        answer +=
          "- Tu peux aussi te référer aux informations de contact mentionnées dans le pied de page du site (email, GitHub...).\n";
      } else {
        answer +=
          "Je peux t’aider à naviguer sur le site URYA et à comprendre les projets.\n\n";
        answer +=
          "- Pour voir la vision globale du projet : va sur « Dashboard » (`/dashboard`).\n";
        answer +=
          "- Pour la liste détaillée des projets : va sur « Projets » (`/projects`).\n";
        answer +=
          "- Pour te connecter ou créer un compte : va sur « Auth » (`/auth`).\n\n";
        if (mainProjects.length) {
          answer +=
            "Voici un aperçu des projets en base actuellement :\n\n" +
            projectList;
        }
      }

      return res.status(200).json({
        message: 'Réponse locale sans IA distante',
        response: answer,
      });
    }

    // Build messages array with history
    const messages = [
      ...history.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    res.json({
      response: response.content[0].text,
      usage: response.usage,
    });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({
      message: 'Failed to get AI response',
      error: error.message
    });
  }
});

export default router;
